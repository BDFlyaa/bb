import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Checkin & Traceability Module E2E', () => {
  
  test('CHECK-01: 志愿者完成 AI 识别打卡并查询溯源', async ({ page }) => {
    // 1. 登录
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', '蓝海卫士');
    await page.fill('input[placeholder="密码"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 进入智能打卡页
    await page.goto('/app/checkin');
    await expect(page.locator('.checkin-view')).toBeVisible();

    // 3. 模拟 AI 识别流程 (拦截分类请求)
    await page.route('**/api/classify/rubbish', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            elements: [{
              Category: '可回收垃圾',
              Rubbish: '塑料瓶',
              RubbishScore: 0.98
            }]
          }
        })
      });
    });

    // 4. 触发上传 (模拟文件选择)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('.ai-card');
    const fileChooser = await fileChooserPromise;
    
    const testImagePath = path.join(process.cwd(), 'test-image.jpg');
    fs.writeFileSync(testImagePath, 'fake image content');
    await fileChooser.setFiles(testImagePath);

    // 5. 检查识别结果展示
    await expect(page.locator('.result-panel')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.category-tag')).toHaveText('可回收垃圾');
    
    // 6. 确认打卡
    await page.click('button:has-text("确认打卡")');
    
    // 7. 等待打卡结果处理并检查历史记录
    await expect(page.locator('.history-item').first()).toBeVisible({ timeout: 10000 });
    
    // 等待批次号渲染
    const batchNoElement = page.locator('.batch-no').first();
    await expect(batchNoElement).toBeVisible({ timeout: 10000 });
    const batchNo = (await batchNoElement.innerText()).trim();
    console.log(`Generated Batch No: ${batchNo}`);

    // 8. 进入溯源查询页
    await page.goto('/app/blockchain');
    await expect(page.locator('.traceability-view')).toBeVisible();

    // 9. 输入批次号查询
    await page.fill('input[placeholder*="输入批次号"]', batchNo);
    await page.click('button:has-text("立即查询")');

    // 10. 验证溯源结果
    await expect(page.locator('.trace-info')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.info-item:has-text("批次编号") .value')).toHaveText(batchNo);
    await expect(page.locator('.achievement-card')).toBeVisible();
    
    // 清理测试文件
    if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
  });

  test('CHECK-02: 管理员查看溯源列表', async ({ page }) => {
    // 1. 登录管理员
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', 'admin');
    await page.fill('input[placeholder="密码"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 访问溯源页
    await page.goto('/app/blockchain');
    await expect(page.locator('h2:has-text("溯源记录管理")')).toBeVisible();

    // 3. 检查表格数据 (使用自动等待机制)
    const firstRow = page.locator('.admin-table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    
    const rowCount = await page.locator('.admin-table tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
    await expect(page.locator('.hash-tag').first()).toContainText('已存证');
  });
});
