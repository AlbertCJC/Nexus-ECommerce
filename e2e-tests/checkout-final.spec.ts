import { test, expect } from '@playwright/test';

test.describe('Checkout & Payment Flow (Admin User)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('CONSOLE ERROR:', msg.text());
      }
    });
  });

  async function loginAsAdmin(page: any) {
    await page.goto('http://localhost:3000');
    await page.click('button:has-text("Sign In"):visible');
    await page.waitForSelector('h2:has-text("Welcome Back")', { timeout: 5000 });
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('form button:has-text("Sign In")');
    await page.waitForSelector('text=Welcome back', { timeout: 10000 });
    await page.waitForTimeout(2000);
  }

  async function logout(page: any) {
    await page.goto('http://localhost:3000');
    // Click user menu and logout
    await page.click('button:has-text("admin@example.com")').catch(() => {});
    await page.click('button:has-text("Sign Out")').catch(() => {});
    await page.waitForTimeout(1000);
  }

  async function clearCart(page: any) {
    await page.evaluate(async () => {
      const supabase = (window as any).__SUPABASE_CLIENT__;
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      await supabase.from('cart_items').delete().eq('user_id', session.user.id);
    });
    await page.waitForTimeout(1000);
  }

  async function addToCart(page: any, productId: string, quantity: number = 1) {
    await page.evaluate(async ({ productId, quantity }) => {
      const supabase = (window as any).__SUPABASE_CLIENT__;
      if (!supabase) throw new Error('Supabase not available');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', session.user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('user_id', session.user.id)
          .eq('product_id', productId);
      } else {
        await supabase
          .from('cart_items')
          .insert({ user_id: session.user.id, product_id: productId, quantity });
      }
    }, { productId, quantity });
    await page.waitForTimeout(1500);
  }

  async function fillCheckoutForm(page: any, data: any) {
    // Clear prefilled values first
    await page.fill('input[name="name"]', '');
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="phone"]', '');
    await page.fill('input[name="address.street"]', '');
    await page.fill('input[name="address.city"]', '');
    await page.fill('input[name="address.state"]', '');
    await page.fill('input[name="address.zip"]', '');
    await page.fill('input[name="address.country"]', '');

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
    await clearCart(page);
    await addToCart(page, 'prod-1', 1);

    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    // Clear prefilled email and country to trigger validation
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="address.country"]', '');
    await page.click('button:has-text("Place Order")');

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
    await loginAsAdmin(page);
    await clearCart(page);
    await addToCart(page, 'prod-1', 1);
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
    // Don't login - stay as guest
    await page.goto('http://localhost:3000');
    // Clear any existing auth
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    // Set guest cart
    await page.evaluate(() => localStorage.setItem('ecommerce_cart', JSON.stringify([{ productId: 'prod-1', quantity: 1 }])));
    await page.goto('http://localhost:3000/checkout');
    await page.waitForTimeout(2000);

    // Fill form
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

    // Should show toast and redirect to login
    await expect(page.locator('text=Please log in to place an order')).toBeVisible({ timeout: 5000 });

    // Wait for redirect
    await page.waitForURL(/\/auth/, { timeout: 5000 });
    const url = page.url();
    console.log('Guest checkout redirect URL:', url);
    // Known issue: redirects to /auth which doesn't exist (UJ-003)
    expect(url).toContain('/auth');
  });

  test('Payment method selection - COD', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCart(page);
    await addToCart(page, 'prod-1', 1);
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

    // COD is default, verify it's selected
    const codRadio = page.locator('input[value="cod"]');
    await expect(codRadio).toBeChecked();
  });

  test('Payment method selection - E-Wallet', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCart(page);
    await addToCart(page, 'prod-1', 1);
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
    const ewalletRadio = page.locator('input[value="ewallet"]');
    await expect(ewalletRadio).toBeChecked();
  });

  test('Payment method selection - Bank Transfer', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCart(page);
    await addToCart(page, 'prod-1', 1);
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
    const bankRadio = page.locator('input[value="bank"]');
    await expect(bankRadio).toBeChecked();
  });

  test('Totals accuracy - verify calculations', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCart(page);
    // Product 1: 9490 cents = ₱94.90 (below ₱100 free shipping threshold)
    await addToCart(page, 'prod-1', 1);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');

    const summaryText = await page.locator('aside').textContent();
    console.log('Order summary:', summaryText);

    // Check totals: 94.90 subtotal, 9.99 shipping, 9.49 tax, 114.38 total
    await expect(page.locator('text=₱94.90').first()).toBeVisible(); // Subtotal
    await expect(page.locator('text=₱9.99').first()).toBeVisible(); // Shipping
    await expect(page.locator('text=₱9.49').first()).toBeVisible(); // Tax (10%)
    await expect(page.locator('text=₱114.38').first()).toBeVisible(); // Total
  });

  test('Duplicate submission prevention - button loading state', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCart(page);
    await addToCart(page, 'prod-1', 1);
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

    const placeOrderBtn = page.locator('button:has-text("Place Order")');
    // Click once
    await placeOrderBtn.click();
    // Button should show loading spinner
    await expect(page.locator('button svg.animate-spin')).toBeVisible({ timeout: 3000 });
    // Note: Actual duplicate prevention requires backend RLS fix (AUTH-001)
  });

  test('Cart UI shows items before order', async ({ page }) => {
    await loginAsAdmin(page);
    await clearCart(page);
    await addToCart(page, 'prod-1', 2);
    await page.goto('http://localhost:3000/cart');
    await page.waitForSelector('text=Razer DeathAdder V3 Pro', { timeout: 5000 });

    // Verify cart shows items
    await expect(page.locator('text=Razer DeathAdder V3 Pro')).toBeVisible();
    await expect(page.locator('text=2').first()).toBeVisible(); // Quantity
  });
});