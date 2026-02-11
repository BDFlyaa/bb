import { test, expect } from '@playwright/test';

test.describe('Auth Module', () => {
  
  // Mock API 接口
  test.beforeEach(async ({ page }) => {
    // 拦截登录请求
    await page.route('**/api/auth/login', async route => {
      const postData = route.request().postDataJSON();
      if (postData.username === 'user' && postData.password === 'password') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'mock-token-12345',
            user: { userId: 1, username: 'user', role: 'volunteer', points: 100 }
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: '用户名或密码错误' })
        });
      }
    });

    // 拦截注册请求
    await page.route('**/api/auth/register', async route => {
      const postData = route.request().postDataJSON();
      // 简单模拟：只要用户名以 testuser_ 开头就成功
      if (postData.username && postData.username.startsWith('testuser_')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: '注册成功' })
        });
      } else {
        await route.continue();
      }
    });

    // 每次测试前访问首页
    await page.goto('/');
  });

  test('AUTH-01: 正常登录流程', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[placeholder="用户名 (admin/user)"]', 'user');
    await page.fill('input[placeholder="密码"]', 'password');

    await page.click('button[type="submit"]');

    // 预期跳转到统计页
    await expect(page).toHaveURL(/\/app\/stats/);
  });

  test('AUTH-02: 错误密码登录失败', async ({ page }) => {
    await page.goto('/login');

    // 监听 alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('错误'); // store 中返回的消息包含 "错误"
      await dialog.accept();
    });

    await page.fill('input[placeholder="用户名 (admin/user)"]', 'user');
    await page.fill('input[placeholder="密码"]', 'wrong_password');
    await page.click('button[type="submit"]');

    // 验证没有跳转
    await expect(page).toHaveURL(/\/login/);
  });

  test('AUTH-04: 用户注册流程', async ({ page }) => {
    await page.goto('/register');

    const uniqueUser = `testuser_${Date.now()}`;
    
    await page.fill('input[placeholder="用户名"]', uniqueUser);
    await page.fill('input[placeholder="邮箱"]', `${uniqueUser}@example.com`);
    await page.fill('input[placeholder="密码"]', '123456');
    await page.fill('input[placeholder="确认密码"]', '123456');

    // 监听注册成功的 alert
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.click('button:has-text("立即注册")');

    // 等待跳转回登录页
    await expect(page).toHaveURL(/\/login/);
    expect(alertMessage).toContain('注册成功');
  });

  test('AUTH-03: 注册密码不一致校验', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[placeholder="用户名"]', 'test_mismatch');
    await page.fill('input[placeholder="邮箱"]', 'test@example.com');
    await page.fill('input[placeholder="密码"]', '123456');
    await page.fill('input[placeholder="确认密码"]', '654321'); // 密码不一致

    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.click('button:has-text("立即注册")');

    // 验证停留在当前页
    await expect(page).toHaveURL(/\/register/);
    expect(alertMessage).toContain('不一致');
  });

  test('AUTH-05: 退出登录', async ({ page }) => {
    // 1. 先登录
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', 'user');
    await page.fill('input[placeholder="密码"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 执行退出操作
    // 退出按钮在 Sidebar 中，类名为 .logout-btn
    await page.click('.logout-btn');
    
    // 3. 验证跳转
    // MainLayout.vue 中 router.push('/')
    await expect(page).toHaveURL(/\/$/); 
    
    // 验证本地存储已清除 (可选)
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
