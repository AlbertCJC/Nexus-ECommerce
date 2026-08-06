import { test, expect } from '@playwright/test';

test('admin login works', async ({ page }) => {
  await page.goto('http://localhost:3000/admin/login');
  await page.waitForTimeout(1000);
  
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('form button:has-text("Sign In")');
  
  // Should redirect to admin dashboard
  await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1000);
  
  // Verify dashboard loaded - check for sidebar "Dashboard" link or heading
  const hasDashboard = await page.locator('text=Admin Dashboard').isVisible({ timeout: 5000 }).catch(() => false);
  const hasSidebar = await page.locator('text=Admin Panel').isVisible({ timeout: 5000 }).catch(() => false);
  console.log('Dashboard heading:', hasDashboard);
  console.log('Sidebar:', hasSidebar);
  
  expect(hasDashboard || hasSidebar).toBe(true);
  console.log('✅ Admin login works!');
});
