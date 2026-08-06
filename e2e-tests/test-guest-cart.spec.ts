import { test, expect } from '@playwright/test';

test('guest cart merge on login', async ({ page }) => {
  await page.goto('http://localhost:3000/products');
  await page.waitForTimeout(2000);
  
  // Find and click first product's "Add to cart" button
  const addToCartBtn = page.locator('button[aria-label*="to cart"]:visible').first();
  await addToCartBtn.click();
  
  // Wait a bit for localStorage update
  await page.waitForTimeout(1000);
  
  // Check cart count in navbar (should be 1)
  const cartLink = page.locator('a[aria-label*="Shopping cart"]');
  await expect(cartLink).toContainText('1');
  console.log('Guest cart count: 1');
  
  // Check localStorage has the item
  const guestCart = await page.evaluate(() => localStorage.getItem('ecommerce_cart'));
  console.log('localStorage cart:', guestCart);
  
  // Now login
  await page.click('button:has-text("Sign In"):visible');
  await page.waitForSelector('h2:has-text("Welcome Back")', { timeout: 5000 });
  await page.fill('input[type="email"]', 'customer@test.com');
  await page.fill('input[type="password"]', 'test123');
  await page.click('form button:has-text("Sign In")');
  await page.waitForSelector('text=Welcome back', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Go to cart
  await page.goto('http://localhost:3000/cart');
  await page.waitForTimeout(2000);
  
  // Check if cart has items
  const cartText = await page.locator('main').textContent();
  console.log('Cart page:', cartText?.substring(0, 300));
  
  const hasSubtotal = await page.locator('text=Subtotal').isVisible({ timeout: 5000 }).catch(() => false);
  console.log('Has Subtotal:', hasSubtotal);
  
  // Check Supabase cart
  const supabaseCart = await page.evaluate(async () => {
    const supabase = (window as any).__SUPABASE_CLIENT__;
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('cart_items').select('*').eq('user_id', session.user.id);
        return data;
      }
    }
    return null;
  });
  console.log('Supabase cart:', supabaseCart);
  
  // Verify merge worked
  expect(hasSubtotal).toBe(true);
  expect(supabaseCart).toBeTruthy();
  expect(supabaseCart?.length).toBeGreaterThan(0);
  
  console.log('✅ Guest cart merged to Supabase on login!');
});
