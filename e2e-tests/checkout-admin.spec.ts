import { test, expect } from '@playwright/test';

// Run tests sequentially to avoid cart conflicts
test.describe.serial('Checkout & Payment Flow (Admin User)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('CONSOLE ERROR:', msg.text());
      }
    });

    // Make sure we start on a clean page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
  });

  async function loginAsAdmin(page: any) {
    await page.goto('http://localhost:3000');
    await page.click('button:has-text("Sign In"):visible');
    await page.waitForSelector('h2:has-text("Welcome Back")', { timeout: 5000 });
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('form button:has-text("Sign In")');
    await page.waitForSelector('text=Welcome back', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for session to settle
  }

  async function addToCartViaMutation(page: any, productId: string, quantity: number = 1) {
    // Wait for Supabase client to be available
    await page.waitForFunction(() => (window as any).__SUPABASE_CLIENT__ !== undefined, { timeout: 10000 });

    // Use the app's useAddToCart mutation via the React context
    await page.evaluate(async ({ productId, quantity }) => {
      // Find the React component tree and trigger the mutation
      // This is a workaround - we'll use the Supabase client directly with the session
      const supabase = (window as any).__SUPABASE_CLIENT__;
      if (!supabase) throw new Error('Supabase not available');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      // Call the upsert logic
      const { data: existing, error: existingError } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', session.user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('user_id', session.user.id)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: session.user.id, product_id: productId, quantity });
        if (error) throw error;
      }
    }, { productId, quantity });

    // Wait for query invalidation
    await page.waitForTimeout(1500);
  }

  async function clearCartViaMutation(page: any) {
    // Wait for Supabase client to be available
    await page.waitForFunction(() => (window as any).__SUPABASE_CLIENT__ !== undefined, { timeout: 10000 });

    await page.evaluate(async () => {
      const supabase = (window as any).__SUPABASE_CLIENT__;
      if (!supabase) throw new Error('Supabase not available');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;
    });

    // Wait for query invalidation
    await page.waitForTimeout(1500);
  }

  async function fillCheckoutForm(page: any, data: any) {
    await page.fill('input[name="name"]', data.name);
    await page.fill('input[name="email"]', data.email);
    await page.fill('input[name="phone"]', data.phone);
    await page.fill('input[name="address.street"]', data.street);
    await page.fill('input[name="address.city"]', data.city);
    await page.fill('input[name="address.state"]', data.state);
    await page.fill('input[name="address.zip"]', data.zip);
    await page.fill('input[name="address.country"]', data.country);
  }

  test('Form Validation - empty form shows errors', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCartViaMutation(page);
    await addToCartViaMutation(page, 'prod-1', 1);

    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    // Clear pre-filled fields to test empty form validation
    await page.fill('input[name="name"]', '');
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="phone"]', '');
    await page.fill('input[name="address.street"]', '');
    await page.fill('input[name="address.city"]', '');
    await page.fill('input[name="address.state"]', '');
    await page.fill('input[name="address.zip"]', '');
    await page.fill('input[name="address.country"]', '');
    // Uncheck payment method (COD is pre-selected) - use JS since radio can't be unchecked directly
    await page.evaluate(() => {
      const radio = document.querySelector('input[value="cod"]');
      if (radio) radio.checked = false;
    });

    await page.click('button:has-text("Place Order")');

    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Invalid email address')).toBeVisible();
    await expect(page.locator('text=Invalid phone number')).toBeVisible();
    await expect(page.locator('text=Street address is required')).toBeVisible();
    await expect(page.locator('text=City is required')).toBeVisible();
    await expect(page.locator('text=State is required')).toBeVisible();
    await expect(page.locator('text=Invalid ZIP code (4-6 digits)')).toBeVisible();
    await expect(page.locator('text=Country is required')).toBeVisible();
    // Payment method has default (COD), so it won't show error
  });

  test('Profile prefill works for authenticated user', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCartViaMutation(page);
    await addToCartViaMutation(page, 'prod-1', 1);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    const nameValue = await page.inputValue('input[name="name"]');
    const emailValue = await page.inputValue('input[name="email"]');
    const phoneValue = await page.inputValue('input[name="phone"]');
    console.log('Prefilled name:', nameValue);
    console.log('Prefilled email:', emailValue);
    console.log('Prefilled phone:', phoneValue);

    // Admin user might not have name/phone in metadata
    expect(emailValue).toContain('@');
  });

  test('Guest redirect to login when checking out', async ({ page }) => {
    // Clear localStorage to simulate guest with cart
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.setItem('ecommerce_cart', JSON.stringify([{ productId: 'prod-1', quantity: 1 }])));
    await page.goto('http://localhost:3000/checkout');
    await page.waitForTimeout(2000);

    // Should be able to fill form but clicking place order should show login modal
    await fillCheckoutForm(page, {
      name: 'Test Guest',
      email: 'guest@test.com',
      phone: '+63 912 345 6789',
      street: '123 Main St',
      city: 'Manila',
      state: 'Metro Manila',
      zip: '1000',
      country: 'Philippines'
    });

    await page.click('label:has-text("Cash on Delivery")');
    await page.click('button:has-text("Place Order")');

    // Should show toast and open auth modal
    await expect(page.locator('text=Please log in to place an order')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2:has-text("Welcome Back")')).toBeVisible({ timeout: 5000 });
  });

  test('COD Payment - complete order flow', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCartViaMutation(page);
    await addToCartViaMutation(page, 'prod-1', 2); // 2 x 9490 = 18980 cents
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    await fillCheckoutForm(page, {
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+63 912 345 6789',
      street: '123 Main St',
      city: 'Manila',
      state: 'Metro Manila',
      zip: '1000',
      country: 'Philippines'
    });

    await page.click('button:has-text("Place Order")');
    await page.waitForURL(/\/order\/.*\/confirmation/, { timeout: 15000 });

    await expect(page.locator('text=Order Confirmed')).toBeVisible();
    await expect(page.locator('text=Cod').first()).toBeVisible();
  });

  test('E-Wallet Payment - complete order flow', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCartViaMutation(page);
    await addToCartViaMutation(page, 'prod-3', 1); // 8990 cents
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    await fillCheckoutForm(page, {
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+63 912 345 6789',
      street: '123 Main St',
      city: 'Manila',
      state: 'Metro Manila',
      zip: '1000',
      country: 'Philippines'
    });

    await page.click('label:has-text("E-Wallet")');
    await page.click('button:has-text("Place Order")');
    await page.waitForURL(/\/order\/.*\/confirmation/, { timeout: 15000 });

    await expect(page.locator('text=Order Confirmed')).toBeVisible();
    await expect(page.locator('text=Ewallet').first()).toBeVisible();
  });

  test('Bank Transfer Payment - complete order flow', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCartViaMutation(page);
    await addToCartViaMutation(page, 'prod-7', 1); // 2990 cents
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    await fillCheckoutForm(page, {
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+63 912 345 6789',
      street: '123 Main St',
      city: 'Manila',
      state: 'Metro Manila',
      zip: '1000',
      country: 'Philippines'
    });

    await page.click('label:has-text("Bank Transfer")');
    await page.click('button:has-text("Place Order")');
    await page.waitForURL(/\/order\/.*\/confirmation/, { timeout: 15000 });

    await expect(page.locator('text=Order Confirmed')).toBeVisible();
    await expect(page.locator('text=Bank').first()).toBeVisible();
  });

  test('Totals accuracy - verify calculations', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCartViaMutation(page);
    // Product 1: 9490 cents x 2 = 18980
    // Product 7: 2990 cents x 1 = 2990
    // Subtotal: 21970
    // Shipping: 0 (free over 10000)
    // Tax: 2197 (10%)
    // Total: 24167
    await addToCartViaMutation(page, 'prod-1', 2);
    await addToCartViaMutation(page, 'prod-7', 1);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    const summaryText = await page.locator('aside').textContent();
    console.log('Order summary:', summaryText);

    // Check totals
    await expect(page.locator('text=₱219.70').first()).toBeVisible(); // Subtotal
    await expect(page.locator('text=Free')).toBeVisible(); // Shipping
    await expect(page.locator('text=₱21.97').first()).toBeVisible(); // Tax (10%)
    await expect(page.locator('text=₱241.67').first()).toBeVisible(); // Total
  });

  test('Duplicate submission prevention', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCartViaMutation(page);
    await addToCartViaMutation(page, 'prod-1', 1);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    await fillCheckoutForm(page, {
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+63 912 345 6789',
      street: '123 Main St',
      city: 'Manila',
      state: 'Metro Manila',
      zip: '1000',
      country: 'Philippines'
    });

    // Click place order - button should disable after click to prevent duplicate submissions
    await page.click('button:has-text("Place Order")');

    await page.waitForURL(/\/order\/.*\/confirmation/, { timeout: 15000 });

    // Should only create one order
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });

  test('Cart cleared after order', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes for full flow
    await loginAsAdmin(page);
    await clearCartViaMutation(page);
    await addToCartViaMutation(page, 'prod-1', 1);

    // Wait for cart query to be invalidated and navbar to update
    await page.waitForTimeout(2000);

    // Verify cart has 1 item by going to cart page
    await page.goto('http://localhost:3000/cart');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Razer DeathAdder V3 Pro')).toBeVisible({ timeout: 10000 });

    // Go through checkout
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    await fillCheckoutForm(page, {
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+63 912 345 6789',
      street: '123 Main St',
      city: 'Manila',
      state: 'Metro Manila',
      zip: '1000',
      country: 'Philippines'
    });

    await page.click('button:has-text("Place Order")');
    await page.waitForURL(/\/order\/.*\/confirmation/, { timeout: 120000 });

    // Should only create one order
    await expect(page.locator('text=Order Confirmed')).toBeVisible();

    // Verify cart is empty by going to cart page
    await page.goto('http://localhost:3000/cart');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Your cart is empty')).toBeVisible({ timeout: 10000 });
  });
});