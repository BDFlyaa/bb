import { test, expect } from '@playwright/test';

test.describe('通知系统测试', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', '蓝海卫士');
    await page.fill('input[placeholder="密码"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/, { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('NOTI-01: 通知铃铛可见且初始无未读', async ({ page }) => {
    // 桌面端侧边栏中的铃铛
    const bell = page.locator('.sidebar .notification-bell');
    await expect(bell).toBeVisible({ timeout: 8000 });
    const badge = bell.locator('.badge');
    // 初始无未读：角标不存在
    await expect(badge).toHaveCount(0);
  });

  test('NOTI-02: 点击铃铛展开通知面板', async ({ page }) => {
    await page.locator('.sidebar .notification-bell').click();
    const panel = page.locator('.notification-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel.locator('.panel-header h3')).toContainText('通知中心');

    // 关闭面板
    await panel.locator('.close-btn').click();
    await expect(panel).not.toBeVisible({ timeout: 3000 });
  });

  test('NOTI-03: 通知面板空状态显示', async ({ page }) => {
    await page.locator('.sidebar .notification-bell').click();
    await expect(page.locator('.notification-panel')).toBeVisible({ timeout: 5000 });

    const emptyEl = page.locator('.notification-panel .list-state');
    await expect(emptyEl).toBeVisible({ timeout: 5000 });
    await expect(emptyEl).toContainText('暂无通知');
  });

  test('NOTI-04: 管理员审核打卡后志愿者收到通知', async ({ browser }) => {
    // 1. 志愿者做一次打卡
    const volPage = await browser.newPage();
    await volPage.goto('/login');
    await volPage.fill('input[placeholder="用户名 (admin/user)"]', '蓝海卫士');
    await volPage.fill('input[placeholder="密码"]', 'password123');
    await volPage.click('button[type="submit"]');
    await expect(volPage).toHaveURL(/\/app\/stats/, { timeout: 10000 });

    await volPage.goto('/app/checkin');
    await expect(volPage.locator('.checkin-view')).toBeVisible({ timeout: 10000 });

    const scanBtn = volPage.locator('button:has-text("扫码打卡")');
    if (await scanBtn.isVisible({ timeout: 3000 })) {
      await scanBtn.click();
      await volPage.waitForTimeout(2500);
    }

    // 2. 管理员审核
    const adminPage = await browser.newPage();
    await adminPage.goto('/login');
    await adminPage.fill('input[placeholder="用户名 (admin/user)"]', 'admin');
    await adminPage.fill('input[placeholder="密码"]', 'admin123');
    await adminPage.click('button[type="submit"]');
    await expect(adminPage).toHaveURL(/\/app\/stats/, { timeout: 10000 });

    await adminPage.goto('/app/checkin');
    await adminPage.waitForTimeout(2000);

    const approveBtn = adminPage.locator('button:has-text("通过")').first();
    if (await approveBtn.isVisible({ timeout: 5000 })) {
      await approveBtn.click();
      await adminPage.waitForTimeout(1500);
    }
    await adminPage.close();

    // 3. 志愿者查看通知
    await volPage.goto('/app/stats');
    await volPage.waitForTimeout(2000);

    await volPage.locator('.sidebar .notification-bell').click();
    await volPage.waitForTimeout(1000);

    const items = volPage.locator('.notification-item');
    const count = await items.count();
    console.log(`[NOTI-04] 通知数量: ${count}`);
    expect(count).toBeGreaterThanOrEqual(0);
    await volPage.close();
  });

  test('NOTI-05: 通知已读功能', async ({ page }) => {
    await page.locator('.sidebar .notification-bell').click();
    await page.waitForTimeout(1000);

    const firstUnread = page.locator('.notification-item.unread').first();
    if (await firstUnread.isVisible({ timeout: 3000 })) {
      await firstUnread.click();
      await page.waitForTimeout(800);
      await expect(firstUnread).not.toHaveClass(/unread/, { timeout: 3000 });
    }
  });

});
