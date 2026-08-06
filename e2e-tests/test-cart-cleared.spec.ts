import { test, expect } from '@playwright/test';

test.describe('Cart Cleared After Order', () => {
  test('should clear cart after successful COD order', async ({ page }) => {
    // 1. Login as admin@example.com / admin123
    await page.goto('http://localhost:3000');

    // Click "Sign In" button (for non-authenticated users)
    await page.click('button:has-text("Sign In")');

    // Wait for auth modal to open (modal has class fixed inset-0 z-50)
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();

    // Fill login form in modal (inputs use id, not name)
    await page.fill('input#email', 'admin@example.com');
    await page.fill('input#password', 'admin123');
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Wait for modal to close and redirect
    await expect(page.locator('.fixed.inset-0.z-50')).toBeHidden();
    await page.waitForTimeout(1000);

    // 2. Add items to cart - go to products and add first product
    await page.goto('http://localhost:3000/products');
    // Wait for product cards to load
    await page.waitForSelector('.btn-primary', { timeout: 10000 });

    // Click Add to Cart on first product (button with cart SVG icon)
    await page.click('button.btn-primary:first-child');

    // Wait for toast/success
    await page.waitForTimeout(1000);

    // 3. Go to cart and verify items
    await page.goto('http://localhost:3000/cart');
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
    await expect(page.locator('text=/item.*in your cart/')).toBeVisible();

    // Check navbar badge shows count > 0 (the badge is a span with the count)
    const badgeBefore = await page.locator('nav >> span:has-text("1"), nav >> span:has-text("2"), nav >> span:has-text("3")').textContent();
    console.log('Cart badge before order:', badgeBefore);

    // 4. Go to checkout
    await page.click('text=Proceed to Checkout');
    await expect(page).toHaveURL('http://localhost:3000/checkout');

    // 5. Fill checkout form (COD is default)
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="phone"]', '+63 912 345 6789');
    await page.fill('input[name="address.street"]', '123 Test Street');
    await page.fill('input[name="address.city"]', 'Manila');
    await page.fill('input[name="address.state"]', 'Metro Manila');
    await page.fill('input[name="address.zip"]', '1000');
    await page.fill('input[name="address.country"]', 'Philippines');

    // 6. Place Order (COD)
    await page.click('button:has-text("Place Order")');

    // 7. Wait for order confirmation page
    await page.waitForURL(/\/order\/.*\/confirmation/);
    await expect(page.locator('text=Order Confirmed')).toBeVisible();

    // 8. Go to cart - should be empty
    await page.goto('http://localhost:3000/cart');
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
    await expect(page.locator('text=Continue Shopping')).toBeVisible();

    // 9. Check navbar badge = 0 or hidden (no badge visible)
    await page.goto('http://localhost:3000/');
    const badgeAfter = await page.locator('nav >> span:has-text("1"), nav >> span:has-text("2"), nav >> span:has-text("3")').count();
    console.log('Cart badge elements after order:', badgeAfter);
    expect(badgeAfter).toBe(0);

    console.log('✅ TEST PASSED: Cart cleared after order');
  });
});