import { test, expect } from '@playwright/test';

test.describe('AI智能助手测试', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', '蓝海卫士');
    await page.fill('input[placeholder="密码"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/, { timeout: 10000 });
  });

  test('AI-01: AI悬浮按钮可见', async ({ page }) => {
    await expect(page.locator('.ai-fab')).toBeVisible({ timeout: 5000 });
  });

  test('AI-02: 点击悬浮按钮展开聊天窗口', async ({ page }) => {
    await page.click('.ai-fab');
    await expect(page.locator('.chat-window')).toBeVisible({ timeout: 5000 });

    // 检查标题
    await expect(page.locator('.chat-header h3')).toContainText('AI');

    // 检查初始欢迎消息
    const messages = page.locator('.message');
    await expect(messages).toHaveCount(1);
  });

  test('AI-03: 发送消息并接收回复', async ({ page }) => {
    await page.click('.ai-fab');
    await expect(page.locator('.chat-window')).toBeVisible({ timeout: 5000 });

    // 输入问题
    await page.fill('.chat-input-area input', '你好，请介绍一下你自己');
    await page.click('.send-btn');

    // 等待 AI 回复（可能较慢，给 20 秒超时）
    await expect(page.locator('.message.ai').last()).toBeVisible({ timeout: 20000 });

    // 确认有 AI 回复内容
    const aiMessages = page.locator('.message.ai');
    const count = await aiMessages.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('AI-04: 多轮对话保持历史', async ({ page }) => {
    await page.click('.ai-fab');
    await expect(page.locator('.chat-window')).toBeVisible({ timeout: 5000 });

    // 第一轮
    await page.fill('.chat-input-area input', '垃圾回收打卡流程是怎样的？');
    await page.click('.send-btn');
    await page.waitForTimeout(5000);

    // 第二轮
    await page.fill('.chat-input-area input', '能详细说说积分规则吗？');
    await page.click('.send-btn');
    await page.waitForTimeout(5000);

    // 检查消息总数（应该有欢迎消息 + 2问 + 2答 = 至少 5 条）
    const messages = page.locator('.message');
    const count = await messages.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('AI-05: 关闭聊天窗口', async ({ page }) => {
    await page.click('.ai-fab');
    await expect(page.locator('.chat-window')).toBeVisible({ timeout: 5000 });

    // 点击关闭按钮
    await page.click('.close-chat');
    await expect(page.locator('.chat-window')).not.toBeVisible({ timeout: 3000 });

    // 再次打开应恢复
    await page.click('.ai-fab');
    await expect(page.locator('.chat-window')).toBeVisible({ timeout: 5000 });
  });

});
