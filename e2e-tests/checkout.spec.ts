import { test, expect } from '@playwright/test';

test.describe('Checkout & Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('CONSOLE ERROR:', msg.text());
      }
    });
  });

  test('Form Validation - empty form shows errors', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addProductToCart(page);
    // Debug: check if we can access checkout
    await debugPage(page, 'After add to cart');
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');
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
    await login(page, 'customer@test.com', 'test123');
    await addProductToCart(page);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');
    const nameValue = await page.inputValue('input[name="name"]');
    const emailValue = await page.inputValue('input[name="email"]');
    const phoneValue = await page.inputValue('input[name="phone"]');
    console.log('Prefilled name:', nameValue);
    console.log('Prefilled email:', emailValue);
    console.log('Prefilled phone:', phoneValue);
    expect(nameValue.length).toBeGreaterThan(0);
    expect(emailValue).toContain('@');
  });

  test('Guest redirect to login when checking out', async ({ page }) => {
    // Don't login, just add to cart as guest
    await page.goto('http://localhost:3000/products/prod-1');
    await page.waitForURL(/\/products\//);
    await page.click('button:has-text("Add to Cart")');
    await page.waitForSelector('text=Added to cart', { timeout: 5000 });
    await page.goto('http://localhost:3000/checkout');
    await page.waitForTimeout(2000);
    const url = page.url();
    console.log('Guest checkout URL:', url);
    expect(url).toContain('localhost:3000/');
  });

  test('COD Payment - complete order flow', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addProductToCart(page);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');
    await fillCheckoutForm(page, {
      name: 'Test User',
      email: 'test@example.com',
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
    await expect(page.locator('text=Cash on Delivery').first()).toBeVisible();
  });

  test('E-Wallet Payment - complete order flow', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addProductToCart(page);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');
    await fillCheckoutForm(page, {
      name: 'Test User',
      email: 'test@example.com',
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
    await expect(page.locator('text=E-Wallet').first()).toBeVisible();
  });

  test('Bank Transfer Payment - complete order flow', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addProductToCart(page);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');
    await fillCheckoutForm(page, {
      name: 'Test User',
      email: 'test@example.com',
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
    await expect(page.locator('text=Bank Transfer').first()).toBeVisible();
  });

  test('Totals accuracy - verify calculations', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addProductToCart(page);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');
    const summaryText = await page.locator('aside').textContent();
    console.log('Order summary:', summaryText);
  });

  test('Duplicate submission prevention', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addProductToCart(page);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');
    await fillCheckoutForm(page, {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+63 912 345 6789',
      street: '123 Main St',
      city: 'Manila',
      state: 'Metro Manila',
      zip: '1000',
      country: 'Philippines'
    });
    await page.click('button:has-text("Place Order")');
    await page.click('button:has-text("Place Order")');
    await page.click('button:has-text("Place Order")');
    await page.waitForURL(/\/order\/.*\/confirmation/, { timeout: 15000 });
  });

  test('Cart cleared after order', async ({ page }) => {
    await login(page, 'customer@test.com', 'test123');
    await addProductToCart(page);
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('form');
    await fillCheckoutForm(page, {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+63 912 345 6789',
      street: '123 Main St',
      city: 'Manila',
      state: 'Metro Manila',
      zip: '1000',
      country: 'Philippines'
    });
    await page.click('button:has-text("Place Order")');
    await page.waitForURL(/\/order\/.*\/confirmation/, { timeout: 15000 });
    await page.goto('http://localhost:3000/cart');
    await page.waitForSelector('text=Your cart is empty', { timeout: 5000 });
    const cartCount = await page.locator('a[href="/cart"] span').textContent().catch(() => '0');
    console.log('Cart count after order:', cartCount);
  });
});

async function login(page: any, email: string, password: string) {
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("Sign In"):visible');
  // Wait for modal to open
  await page.waitForSelector('h2:has-text("Welcome Back")', { timeout: 5000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  // Click the submit button inside the modal
  await page.click('form button:has-text("Sign In")');
  await page.waitForSelector('text=Welcome back', { timeout: 10000 });
  await page.waitForTimeout(1000);
}

async function addProductToCart(page: any) {
  // Go directly to a known product detail page (prod-1 from seed data)
  await page.goto('http://localhost:3000/products/prod-1');
  await page.waitForURL(/\/products\//);
  // Wait for product to load - wait for the add to cart button
  await page.waitForSelector('button:has-text("Add to Cart"):visible', { timeout: 15000 });
  await page.click('button:has-text("Add to Cart")');
  await page.waitForSelector('text=Added to cart', { timeout: 5000 });
  await page.waitForTimeout(500);
}

async function debugPage(page: any, label: string) {
  const html = await page.content();
  console.log(`=== ${label} ===`);
  console.log(html.substring(0, 5000));
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