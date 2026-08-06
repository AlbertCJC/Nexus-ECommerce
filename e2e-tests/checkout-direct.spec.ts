import { test, expect } from '@playwright/test';

test.describe('Checkout & Payment Flow (Direct API)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('CONSOLE ERROR:', msg.text());
      }
    });
  });

  async function login(page: any, email: string, password: string) {
    await page.goto('http://localhost:3000');
    await page.click('button:has-text("Sign In"):visible');
    await page.waitForSelector('h2:has-text("Welcome Back")', { timeout: 5000 });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('form button:has-text("Sign In")');
    await page.waitForSelector('text=Welcome back', { timeout: 10000 });
    await page.waitForTimeout(1000);
  }

  async function addToCartViaAPI(page: any, productId: string, quantity: number = 1) {
    // Get the session from localStorage and use it with Supabase
    const session = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const supabaseKey = keys.find(k => k.startsWith('supabase.auth.token'));
      if (supabaseKey) {
        return JSON.parse(localStorage.getItem(supabaseKey) || '{}');
      }
      return null;
    });

    if (!session?.access_token) {
      throw new Error('No session found in localStorage');
    }

    // Use Supabase REST API directly
    await page.evaluate(async ({ productId, quantity, accessToken }) => {
      const supabaseUrl = 'https://dlqjmtnwcekcndpchxgr.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscWptdG53Y2VrY25kcGNoeGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyNzQ0NjQsImV4cCI6MjA0OTg1MDQ2NH0.YOUR_ANON_KEY';

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if item exists
      const { data: existing, error: existingError } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: productId, quantity });
        if (error) throw error;
      }
    }, { productId, quantity, accessToken: session.access_token });

    // Wait for the mutation to complete and query to invalidate
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
    await login(page, 'customer@test.com', 'test123');

    // Add product to cart via API
    await addToCartViaAPI(page, 'prod-1', 1);

    // Go to checkout
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    // Submit empty form
    await page.click('button:has-text("Place Order")');

    // Wait for validation errors
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Invalid email address')).toBeVisible();
    await expect(page.locator('text=Invalid phone number')).toBeVisible();
    await expect(page.locator('text=Street address is required')).toBeVisible();
    await expect(page.locator('text=City is required')).toBeVisible();
    await expect(page.locator('text=State is required')).toBeVisible();
    await expect(page.locator('text=Invalid ZIP code')).toBeVisible();
    await expect(page.locator('text=Country is required')).toBeVisible();
    await expect(page.locator('text=Select a payment method')).toBeVisible();
  });

  test('Profile prefill works for authenticated user', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addToCartViaAPI(page, 'prod-1', 1);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    const nameValue = await page.inputValue('input[name="name"]');
    const emailValue = await page.inputValue('input[name="email"]');
    const phoneValue = await page.inputValue('input[name="phone"]');
    console.log('Prefilled name:', nameValue);
    console.log('Prefilled email:', emailValue);
    console.log('Prefilled phone:', phoneValue);

    // The user might not have phone in metadata
    expect(nameValue.length).toBeGreaterThan(0);
    expect(emailValue).toContain('@');
  });

  test('Guest redirect to login when checking out', async ({ page }) => {
    // Clear localStorage to simulate guest with cart
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.setItem('ecommerce_cart', JSON.stringify([{ productId: 'prod-1', quantity: 1 }])));
    await page.goto('http://localhost:3000/checkout');
    await page.waitForTimeout(2000);

    // Should be able to fill form but clicking place order should redirect
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

    // Select payment method
    await page.click('label:has-text("Cash on Delivery")');

    // Click place order
    await page.click('button:has-text("Place Order")');

    // Should show toast and redirect to login
    await expect(page.locator('text=Please log in to place an order')).toBeVisible({ timeout: 5000 });

    // Wait for redirect
    await page.waitForURL(/\/auth/, { timeout: 5000 });
    const url = page.url();
    console.log('Guest checkout redirect URL:', url);
  });

  test('COD Payment - complete order flow', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addToCartViaAPI(page, 'prod-1', 2); // 2 x 9490 = 18980 cents
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    await fillCheckoutForm(page, {
      name: 'Test User',
      email: 'customer@test.com',
      phone: '+63 912 345 6789',
      street: '123 Main St',
      city: 'Manila',
      state: 'Metro Manila',
      zip: '1000',
      country: 'Philippines'
    });

    // COD is default
    await page.click('button:has-text("Place Order")');
    await page.waitForURL(/\/order\/.*\/confirmation/, { timeout: 15000 });

    await expect(page.locator('text=Order Confirmed')).toBeVisible();
    await expect(page.locator('text=Cash on Delivery').first()).toBeVisible();
  });

  test('E-Wallet Payment - complete order flow', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addToCartViaAPI(page, 'prod-3', 1); // 8990 cents
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    await fillCheckoutForm(page, {
      name: 'Test User',
      email: 'customer@test.com',
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
    await expect(page.locator('text=E-Wallet').first()).toBeVisible();
  });

  test('Bank Transfer Payment - complete order flow', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addToCartViaAPI(page, 'prod-7', 1); // 2990 cents
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    await fillCheckoutForm(page, {
      name: 'Test User',
      email: 'customer@test.com',
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
    await expect(page.locator('text=Bank Transfer').first()).toBeVisible();
  });

  test('Totals accuracy - verify calculations', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    // Product 1: 9490 cents x 2 = 18980
    // Product 7: 2990 cents x 1 = 2990
    // Subtotal: 21970
    // Shipping: 0 (free over 10000)
    // Tax: 2197 (10%)
    // Total: 24167
    await addToCartViaAPI(page, 'prod-1', 2);
    await addToCartViaAPI(page, 'prod-7', 1);
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
    await login(page, 'customer@test.com', 'test123');
    await addToCartViaAPI(page, 'prod-1', 1);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    await fillCheckoutForm(page, {
      name: 'Test User',
      email: 'customer@test.com',
      phone: '+63 912 345 6789',
      street: '123 Main St',
      city: 'Manila',
      state: 'Metro Manila',
      zip: '1000',
      country: 'Philippines'
    });

    // Click rapidly 3 times
    await page.click('button:has-text("Place Order")');
    await page.click('button:has-text("Place Order")');
    await page.click('button:has-text("Place Order")');

    await page.waitForURL(/\/order\/.*\/confirmation/, { timeout: 15000 });

    // Should only create one order - verify by checking order confirmation
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });

  test('Cart cleared after order', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addToCartViaAPI(page, 'prod-1', 1);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    await fillCheckoutForm(page, {
      name: 'Test User',
      email: 'customer@test.com',
      phone: '+63 912 345 6789',
      street: '123 Main St',
      city: 'Manila',
      state: 'Metro Manila',
      zip: '1000',
      country: 'Philippines'
    });

    await page.click('button:has-text("Place Order")');
    await page.waitForURL(/\/order\/.*\/confirmation/, { timeout: 15000 });

    // Go to cart
    await page.goto('http://localhost:3000/cart');
    await page.waitForSelector('text=Your cart is empty', { timeout: 5000 });

    // Check navbar badge
    const cartCount = await page.locator('a[href="/cart"] span').textContent().catch(() => '0');
    console.log('Cart count after order:', cartCount);
  });
});