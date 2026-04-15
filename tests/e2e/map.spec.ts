import { test, expect } from '@playwright/test';

test.describe('Map Module E2E', () => {
  
  test('MAP-01: 志愿者申请新点位并反馈报错', async ({ page }) => {
    // 1. 登录
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', '蓝海卫士');
    await page.fill('input[placeholder="密码"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 访问地图
    await page.goto('/app/map');
    await expect(page.locator('.map-view')).toBeVisible();
    await page.waitForSelector('#container');

    // 3. 申请新点位 (志愿者模式)
    await page.click('button:has-text("申请新点位")');
    await expect(page.locator('.picking-tip')).toBeVisible();

    // 4. 点击地图 (模拟点击)
    await page.click('#container');

    // 5. 填写申请信息
    await expect(page.locator('.modal:has-text("申报新回收点")')).toBeVisible();
    const newStationName = `新回收点_${Date.now()}`;
    await page.fill('label:has-text("站点名称") + input', newStationName);
    await page.fill('label:has-text("详细地址") + input', '测试地址');
    
    const dialogPromise = page.waitForEvent('dialog');
    await page.click('.modal-footer .btn-primary:has-text("提交申报")', { force: true });
    const dialog = await dialogPromise;
    await dialog.accept();
    
    // 等待模态框关闭
    await expect(page.locator('.modal')).not.toBeVisible();

    // 6. 报告回收站已满
    const firstStation = page.locator('.station-item').first();
    await firstStation.click();
    await firstStation.locator('button:has-text("这里满了")').click();
    
    const modalVisible = await page.locator('.modal:has-text("站点报错反馈")').isVisible();
    if (modalVisible) {
      await page.selectOption('label:has-text("问题类型") + select', 'full');
      await page.fill('textarea', '回收箱已满');
      
      const dialogPromise2 = page.waitForEvent('dialog');
      await page.click('.modal-footer .btn-primary:has-text("提交反馈")', { force: true });
      const dialog2 = await dialogPromise2;
      await dialog2.accept();
      
      await expect(page.locator('.modal')).not.toBeVisible();
    }
  });

  test('MAP-02: 管理员审核申请并管理站点', async ({ page }) => {
    // 1. 登录管理员
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', 'admin');
    await page.fill('input[placeholder="密码"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 访问地图
    await page.goto('/app/map');
    await expect(page.locator('.map-view')).toBeVisible();

    // 3. 审核申请
    await page.click('button:has-text("审核申请")');
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('.modal-header h3')).toContainText('点位申请审核');

    // 4. 审核通过第一个申请
    const firstAuditRow = page.locator('.admin-table tbody tr').first();
    const rowCount = await firstAuditRow.count();
    if (rowCount > 0 && await firstAuditRow.locator('td').count() > 1) {
      const stationName = await firstAuditRow.locator('td').nth(1).innerText();
      await firstAuditRow.locator('button:has-text("通过")').click();
      await page.waitForTimeout(500);
      
      // 关闭审核模态框
      await page.click('.close-btn');
      await expect(page.locator('.modal')).not.toBeVisible();

      // 检查地图列表中是否出现该站点
      await expect(page.locator('.station-list')).toContainText(stationName);
    } else {
      await page.click('.close-btn');
      await expect(page.locator('.modal')).not.toBeVisible();
    }

    // 5. 新增回收站 (管理员直连)
    await page.click('button:has-text("新增回收站")');
    await expect(page.locator('.picking-tip')).toBeVisible();
    await page.click('#container');
    
    const adminStationName = `管理员直管站_${Date.now()}`;
    await page.fill('label:has-text("站点名称") + input', adminStationName);
    await page.fill('label:has-text("详细地址") + input', '管理员添加');
    
    await page.click('.modal-footer .btn-primary:has-text("确认创建")', { force: true });
    await expect(page.locator('.station-list')).toContainText(adminStationName);
  });
});
