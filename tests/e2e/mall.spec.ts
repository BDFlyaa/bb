import { test, expect } from '@playwright/test';

test.describe('Mall Module E2E', () => {
  
  test('MALL-01: 志愿者浏览并尝试兑换商品', async ({ page }) => {
    // 1. 登录
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', '蓝海卫士');
    await page.fill('input[placeholder="密码"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 访问商城
    await page.goto('/app/mall');
    await expect(page.locator('.mall-view')).toBeVisible();
    
    // 等待商品加载
    await page.waitForSelector('.product-card');
    const count = await page.locator('.product-card').count();
    expect(count).toBeGreaterThan(0);

    // 3. 检查我的积分
    const pointsText = await page.locator('.user-points-pill .value').innerText();
    const points = parseInt(pointsText);

    // 4. 尝试点击第一个可兑换商品
    const firstProduct = page.locator('.product-card').first();
    const costText = await firstProduct.locator('.points-cost').innerText();
    const cost = parseInt(costText);

    if (points >= cost) {
      await firstProduct.locator('.redeem-btn-small').click();
      
      // 应该出现了兑换模态框
      await expect(page.locator('.modal:has-text("兑换商品")')).toBeVisible();
      
      // 填写收货信息
      await page.fill('label:has-text("收货人姓名") + input', '张三');
      await page.fill('label:has-text("联系电话") + input', '13800138000');
      await page.fill('label:has-text("详细收货地址") + textarea', '测试地址');
      
      // 提交兑换
      await page.click('.modal-footer .btn-primary:has-text("确认兑换")', { force: true });
      
      // 等待兑换模态框关闭
      await expect(page.locator('.modal:has-text("兑换商品")')).not.toBeVisible();
      
      // 应该出现了成功模态框
      await expect(page.locator('.modal:has-text("兑换成功")')).toBeVisible();
      await page.click('button:has-text("太棒了")');
      await expect(page.locator('.modal:has-text("兑换成功")')).not.toBeVisible();
    }

    // 5. 查看兑换记录
    await page.click('button:has-text("兑换记录")');
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('.modal-header h3')).toContainText('我的兑换记录');
  });

  test('MALL-02: 管理员管理商城商品', async ({ page }) => {
    // 1. 登录管理员
    await page.goto('/login');
    await page.fill('input[placeholder="用户名 (admin/user)"]', 'admin');
    await page.fill('input[placeholder="密码"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/stats/);

    // 2. 访问商城管理页
    await page.goto('/app/mall');
    await expect(page.locator('h2:has-text("商城运维中心")')).toBeVisible();

    // 3. 上架新商品
    await page.click('button:has-text("上架新商品")');
    await expect(page.locator('.modal')).toBeVisible();
    
    const newProductName = `测试商品_${Date.now()}`;
    await page.fill('label:has-text("商品名称") + input', newProductName);
    await page.fill('label:has-text("积分价格") + input', '999');
    await page.fill('label:has-text("库存数量") + input', '10');
    
    // 提交
    await page.click('.modal-footer .btn-primary:has-text("确认上架")', { force: true });
    
    // 等待模态框关闭
    await expect(page.locator('.modal:has-text("上架新商品")')).not.toBeVisible();
    
    // 验证新商品在列表中
    await expect(page.locator('.admin-table')).toContainText(newProductName);

    // 4. 修改商品状态 (下架)
    const productRow = page.locator('tr', { hasText: newProductName });
    await productRow.locator('button:has-text("下架")').click();
    
    // 应该出现了确认模态框
    await expect(page.locator('.modal:has-text("确认操作")')).toBeVisible();
    await page.click('button:has-text("确认操作")');
    
    // 验证状态改变
    await expect(productRow.locator('.status-tag')).toHaveText('已下架');

    // 5. 删除商品
    await productRow.locator('button:has-text("删除")').click();
    
    // 应该出现了确认模态框
    await expect(page.locator('.modal:has-text("确认操作")')).toBeVisible();
    await page.click('button:has-text("确认操作")');
    
    // 验证删除
    await expect(page.locator('.admin-table')).not.toContainText(newProductName);
  });
});
