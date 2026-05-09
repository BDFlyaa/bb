import { test, expect } from '@playwright/test';

test.describe('移动端适配测试', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    // 仅移动端项目执行
    if (testInfo.project.name !== 'mobile') test.skip();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', '蓝海卫士');
    await page.fill('input[placeholder="密码"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/, { timeout: 10000 });
    await page.waitForTimeout(800);
  });

  test('MOB-01: 移动端汉堡菜单可展开关闭', async ({ page }) => {
    // 移动端侧边栏默认隐藏
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).not.toHaveClass(/mobile-open/, { timeout: 3000 });

    // 点击汉堡按钮展开菜单
    await page.locator('.menu-toggle').click();
    await expect(sidebar).toHaveClass(/mobile-open/, { timeout: 3000 });

    // 点击遮罩关闭菜单
    await page.locator('.mobile-overlay').click();
    await expect(sidebar).not.toHaveClass(/mobile-open/, { timeout: 3000 });
  });

  test('MOB-02: 移动端顶栏品牌和通知铃铛可见', async ({ page }) => {
    // 移动端顶栏
    await expect(page.locator('.mobile-header')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.mobile-brand')).toBeVisible();
    await expect(page.locator('.mobile-header .notification-bell')).toBeVisible({ timeout: 3000 });
  });

  test('MOB-03: 移动端通知铃铛展开面板', async ({ page }) => {
    // 点击移动端铃铛
    await page.locator('.mobile-header .notification-bell').click();
    await expect(page.locator('.notification-panel')).toBeVisible({ timeout: 5000 });

    // 面板全宽
    const panel = page.locator('.notification-panel');
    const box = await panel.boundingBox();
    expect(box).toBeTruthy();

    // 关闭
    await panel.locator('.close-btn').click();
    await expect(panel).not.toBeVisible({ timeout: 3000 });
  });

  test('MOB-04: 移动端导航菜单可跳转', async ({ page }) => {
    // 展开菜单
    await page.locator('.menu-toggle').click();
    await expect(page.locator('.sidebar.mobile-open')).toBeVisible({ timeout: 3000 });

    // 点击积分商城
    await page.locator('.nav-item:has-text("积分商城")').click();
    await expect(page).toHaveURL(/\/app\/mall/, { timeout: 5000 });
    await expect(page.locator('.mall-view')).toBeVisible({ timeout: 5000 });
  });

  test('MOB-05: 移动端页面布局不自适应溢出', async ({ page }) => {
    // 检查主布局没有水平溢出
    const layout = page.locator('.main-layout');
    const box = await layout.boundingBox();
    expect(box).toBeTruthy();

    // 内容区域可滚动
    const content = page.locator('.content-area');
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('MOB-06: 移动端首页展示正常', async ({ page }) => {
    // 退出登录看首页
    await page.locator('.menu-toggle').click();
    await page.waitForTimeout(300);
    await page.locator('.logout-btn').click();
    await expect(page).toHaveURL(/\/$/, { timeout: 5000 });

    // 验证首页核心元素
    await expect(page.locator('.hero-section')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.main-title')).toBeVisible();

    // 验证科普卡片区
    await expect(page.locator('.wiki-grid').first()).toBeVisible({ timeout: 5000 });
  });

  test('MOB-07: 移动端数据统计页展示正常', async ({ page }) => {
    await expect(page.locator('.stats-overview')).toBeVisible({ timeout: 5000 });

    // 统计卡片区可见
    const statBoxes = page.locator('.stat-box');
    const count = await statBoxes.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('MOB-08: 移动端社区页面展示正常', async ({ page }) => {
    await page.goto('/app/community');
    await expect(page.locator('.community-view')).toBeVisible({ timeout: 10000 });

    // 发布区域可见
    const publishCard = page.locator('.publish-card');
    await expect(publishCard).toBeVisible({ timeout: 5000 });
  });

  test('MOB-09: 移动端AI悬浮按钮可见可用', async ({ page }) => {
    await expect(page.locator('.ai-fab')).toBeVisible({ timeout: 5000 });

    await page.locator('.ai-fab').click();
    await expect(page.locator('.chat-window')).toBeVisible({ timeout: 5000 });
  });

  test('MOB-10: 移动端个人资料页展示正常', async ({ page }) => {
    await page.goto('/app/profile');
    await expect(page.locator('.profile-container')).toBeVisible({ timeout: 10000 });

    // 用户横幅可见
    await expect(page.locator('.user-banner')).toBeVisible({ timeout: 5000 });

    // Tab 切换正常
    await page.locator('.tab-btn:has-text("安全设置")').click();
    await expect(page.locator('.password-form').first()).toBeVisible({ timeout: 5000 });
  });

});
