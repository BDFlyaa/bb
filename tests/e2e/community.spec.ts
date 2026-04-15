import { test, expect } from '@playwright/test';

test.describe('Community & Tasks Module E2E', () => {
  
  test('COMM-01: 志愿者在社区发帖并点赞', async ({ page }) => {
    // 1. 登录
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', '蓝海卫士');
    await page.fill('input[placeholder="密码"]', 'password123');
    await page.click('button[type="submit"]');
    // 必须等待登录成功跳转，确保 Token 已写入 localStorage
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 访问社区
    await page.goto('/app/community');
    await expect(page.locator('.community-view')).toBeVisible();

    // 3. 发布新动态
    const postContent = `测试动态_${Date.now()}`;
    await page.fill('textarea[placeholder="分享你的最新环保成就..."]', postContent);
    
    // 点击发布按钮
    await page.click('button:has-text("发布")');
    
    // 验证动态出现在列表中
    const newPost = page.locator('.feed-item').filter({ hasText: postContent });
    await expect(newPost).toBeVisible({ timeout: 10000 });

    // 4. 点赞
    const likeBtn = newPost.locator('.action-item').first();
    await likeBtn.click();
    
    // 验证点赞状态
    await expect(likeBtn).toHaveClass(/liked/);
  });

  test('TASK-01: 志愿者查看并申请参与任务', async ({ page }) => {
    // 1. 登录
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', '蓝海卫士');
    await page.fill('input[placeholder="密码"]', 'password123');
    await page.click('button[type="submit"]');
    // 修复点：显式等待登录完成，防止被路由守卫重定向回登录页
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 访问社区
    await page.goto('/app/community');
    
    // 3. 显式等待志愿者视图加载完成
    await page.waitForSelector('.community-layout', { state: 'visible', timeout: 15000 });
    
    // 4. 检查任务卡片是否渲染
    await page.waitForSelector('.task-card', { state: 'visible', timeout: 15000 });
    const count = await page.locator('.task-card').count();
    expect(count).toBeGreaterThan(0);

    // 5. 执行报名/退出操作
    const firstTask = page.locator('.task-card').first();
    const btn = firstTask.locator('button');
    const btnText = await btn.innerText();
    
    if (btnText.includes('报名参加')) {
      await btn.click();
      await expect(btn).toContainText('已参加', { timeout: 10000 });
    } else {
      // 如果已经参加，测试退出逻辑
      await btn.click();
      // 等待自定义确认弹窗并确定
      await page.click('.modal-footer .btn-primary:has-text("确定")');
      await expect(btn).toContainText('报名参加', { timeout: 10000 });
    }
  });
});
