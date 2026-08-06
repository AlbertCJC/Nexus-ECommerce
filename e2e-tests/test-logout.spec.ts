import { test, expect } from '@playwright/test';

test('logout flow via dropdown button', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Login
  await page.click('button:has-text("Sign In"):visible');
  await page.waitForSelector('h2:has-text("Welcome Back")', { timeout: 5000 });
  await page.fill('input[type="email"]', 'customer@test.com');
  await page.fill('input[type="password"]', 'test123');
  await page.click('form button:has-text("Sign In")');
  await page.waitForSelector('text=Welcome back', { timeout: 10000 });
  await page.waitForTimeout(1000);
  
  // Verify user avatar visible
  await expect(page.locator('button[aria-label="User account"]')).toBeVisible();
  
  // Click user avatar to open dropdown
  await page.click('button[aria-label="User account"]');
  await page.waitForSelector('text=Sign Out', { timeout: 5000 });
  
  // Click Sign Out button in dropdown
  await page.click('text=Sign Out');
  
  // Wait for auth state change
  await page.waitForSelector('button:has-text("Sign In"):visible', { timeout: 10000 });
  
  // Verify navbar shows Sign In/Sign Up
  const navbarText = await page.locator('nav').textContent();
  console.log('Navbar:', navbarText?.substring(0, 200));
  
  expect(navbarText).toContain('Sign In');
  expect(navbarText).toContain('Sign Up');
  
  console.log('✅ Logout via dropdown works!');
});
