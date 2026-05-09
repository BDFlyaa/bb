import { test, expect } from '@playwright/test';

test.describe('Stats & Profile Module E2E', () => {
  
  test('STATS-01: 管理员查看数据大屏图表', async ({ page }) => {
    // 1. 登录管理员
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', 'admin');
    await page.fill('input[placeholder="密码"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 检查管理员大屏元素
    await expect(page.locator('.admin-mode')).toBeVisible();
    await expect(page.locator('h2')).toContainText('海洋塑料回收指挥中心');

    // 3. 检查 ECharts 容器
    await expect(page.locator('.echart-container').first()).toBeVisible();
  });

  test('STATS-02: 志愿者查看个人中心数据', async ({ page }) => {
    // 1. 登录
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', '蓝海卫士');
    await page.fill('input[placeholder="密码"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 检查志愿者个人数据元素
    await expect(page.locator('.user-mode')).toBeVisible();
    const count = await page.locator('.stat-box').count();
    expect(count).toBeGreaterThan(0);
    await expect(page.locator('.medal-gallery')).toBeVisible();
  });

  test('PROF-01: 志愿者修改个人资料', async ({ page }) => {
    // 1. 登录
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', '蓝海卫士');
    await page.fill('input[placeholder="密码"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 访问个人资料页 (ProfileEdit.vue)
    // 尝试点击侧边栏的“设置”或者直接跳转
    await page.goto('/app/profile');
    
    // 增加等待时间，确保页面加载完成
    await page.waitForSelector('.profile-container', { timeout: 10000 });
    await expect(page.locator('.profile-container')).toBeVisible();

    // 3. 修改简介
    const newBio = `这是测试简介_${Date.now()}`;
    await page.fill('textarea[placeholder="介绍一下你自己..."]', newBio);
    
    // 注册对话框处理
    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    // 提交修改
    await page.click('button:has-text("保存修改")');
    await page.waitForTimeout(1000);
    
    // 验证修改成功 (在页面上刷新显示)
    await expect(page.locator('.banner-bio')).toContainText(newBio);
  });
});
