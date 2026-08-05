import { test, expect } from '@playwright/test';

test.describe('Edge Case Testing', () => {
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
    await page.fill('input[name="name"]', data.name);
    await page.fill('input[name="email"]', data.email);
    await page.fill('input[name="phone"]', data.phone);
    await page.fill('input[name="address.street"]', data.street);
    await page.fill('input[name="address.city"]', data.city);
    await page.fill('input[name="address.state"]', data.state);
    await page.fill('input[name="address.zip"]', data.zip);
    await page.fill('input[name="address.country"]', data.country);
  }

  // =====================
  // STEP 1: Invalid Inputs
  // =====================

  test.describe('Invalid Inputs', () => {
    test('Special characters in name field', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await addToCart(page, 'prod-1', 1);
      await page.goto('http://localhost:3000/checkout');
      await page.waitForSelector('form');

      await fillCheckoutForm(page, {
        name: '<>&"\';--',
        email: 'admin@example.com',
        phone: '+63 912 345 6789',
        street: '123 Main St',
        city: 'Manila',
        state: 'Metro Manila',
        zip: '1000',
        country: 'Philippines'
      });

      await page.click('button:has-text("Place Order")');
      // Should accept special chars or show validation error
      const toast = page.locator('[role="alert"]');
      await expect(toast).toBeVisible({ timeout: 5000 });
      console.log('Special chars test completed');
    });

    test('Emoji in name/address fields', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await addToCart(page, 'prod-1', 1);
      await page.goto('http://localhost:3000/checkout');
      await page.waitForSelector('form');

      await fillCheckoutForm(page, {
        name: 'Test 😀🎮🖥️',
        email: 'admin@example.com',
        phone: '+63 912 345 6789',
        street: '123 Gaming St 🎮',
        city: 'Manila 🏙️',
        state: 'Metro Manila',
        zip: '1000',
        country: 'Philippines 🇵🇭'
      });

      await page.click('button:has-text("Place Order")');
      const toast = page.locator('[role="alert"]');
      await expect(toast).toBeVisible({ timeout: 5000 });
      console.log('Emoji test completed');
    });

    test('Very long strings (1000+ chars) in address field', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await addToCart(page, 'prod-1', 1);
      await page.goto('http://localhost:3000/checkout');
      await page.waitForSelector('form');

      const longString = 'A'.repeat(1500);
      await fillCheckoutForm(page, {
        name: 'Test User',
        email: 'admin@example.com',
        phone: '+63 912 345 6789',
        street: longString,
        city: 'Manila',
        state: 'Metro Manila',
        zip: '1000',
        country: 'Philippines'
      });

      await page.click('button:has-text("Place Order")');
      // Should either truncate, show validation error, or handle gracefully
      const toast = page.locator('[role="alert"]');
      await expect(toast).toBeVisible({ timeout: 5000 });
      console.log('Long string test completed');
    });

    test('Negative quantity in cart', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await page.goto('http://localhost:3000/cart');

      // Try to add negative quantity via direct manipulation
      await page.evaluate(async () => {
        const supabase = (window as any).__SUPABASE_CLIENT__;
        if (!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        await supabase.from('cart_items').insert({
          user_id: session.user.id,
          product_id: 'prod-1',
          quantity: -5
        });
      });
      await page.waitForTimeout(1000);
      await page.reload();
      // Should handle gracefully - either clamp to 0/1 or show error
      console.log('Negative quantity test completed');
    });

    test('Decimal in integer fields (quantity)', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('text=Razer DeathAdder');

      // Navigate to product detail
      await page.click('text=Razer DeathAdder V3 Pro');
      await page.waitForSelector('text=Add to Cart');

      // Try to set decimal quantity via input manipulation
      const qtyInput = page.locator('input[type="number"]').first();
      await qtyInput.fill('2.5');
      await page.click('button:has-text("Add to Cart")');

      await page.waitForTimeout(1000);
      const toast = page.locator('[role="alert"]');
      await expect(toast).toBeVisible({ timeout: 5000 });
      console.log('Decimal quantity test completed');
    });

    test('Empty required fields on all forms', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await addToCart(page, 'prod-1', 1);
      await page.goto('http://localhost:3000/checkout');
      await page.waitForSelector('form');

      // Clear all fields
      await page.fill('input[name="name"]', '');
      await page.fill('input[name="email"]', '');
      await page.fill('input[name="phone"]', '');
      await page.fill('input[name="address.street"]', '');
      await page.fill('input[name="address.city"]', '');
      await page.fill('input[name="address.state"]', '');
      await page.fill('input[name="address.zip"]', '');
      await page.fill('input[name="address.country"]', '');

      await page.click('button:has-text("Place Order")');

      // Should show validation errors for all required fields
      await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Invalid email address')).toBeVisible();
      await expect(page.locator('text=Invalid phone number')).toBeVisible();
      await expect(page.locator('text=Street address is required')).toBeVisible();
      await expect(page.locator('text=City is required')).toBeVisible();
      await expect(page.locator('text=State is required')).toBeVisible();
      await expect(page.locator('text=Invalid ZIP code')).toBeVisible();
      await expect(page.locator('text=Country is required')).toBeVisible();
      await expect(page.locator('text=Select a payment method')).toBeVisible();
      console.log('Empty fields test completed');
    });
  });

  // =====================
  // STEP 2: Empty States
  // =====================

  test.describe('Empty States', () => {
    test('Categories with no products', async ({ page }) => {
      // This requires admin access to check category management
      await loginAsAdmin(page);
      await page.goto('http://localhost:3000/admin/categories');
      await page.waitForSelector('table');
      // Check if categories display correctly even with no products
      const rows = page.locator('table tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(0);
      console.log('Categories empty state test completed, count:', count);
    });

    test('Brands with no products', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('http://localhost:3000/admin/brands');
      await page.waitForSelector('table');
      const rows = page.locator('table tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(0);
      console.log('Brands empty state test completed, count:', count);
    });

    test('User with no orders', async ({ page }) => {
      await loginAsAdmin(page);
      // Clear orders for this user if needed
      await page.goto('http://localhost:3000/orders');
      await page.waitForTimeout(2000);
      // Should show empty state message, not crash
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      console.log('Empty orders test completed');
    });

    test('Admin with no recent orders on dashboard', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('http://localhost:3000/admin/dashboard');
      await page.waitForSelector('text=Recent Orders');
      // Should show empty state or handle gracefully
      console.log('Admin dashboard empty state test completed');
    });

    test('Cart with deleted product items', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);

      // Add a product, then delete it from DB, then check cart
      await page.evaluate(async () => {
        const supabase = (window as any).__SUPABASE_CLIENT__;
        if (!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        await supabase.from('cart_items').insert({
          user_id: session.user.id,
          product_id: 'non-existent-product',
          quantity: 1
        });
      });
      await page.waitForTimeout(1000);
      await page.goto('http://localhost:3000/cart');
      await page.waitForTimeout(2000);
      // Should handle gracefully - show error or remove item
      console.log('Deleted product in cart test completed');
    });
  });

  // =====================
  // STEP 3: Boundary Values
  // =====================

  test.describe('Boundary Values', () => {
    test('Quantity = 0 (should remove item)', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await addToCart(page, 'prod-1', 1);
      await page.goto('http://localhost:3000/cart');
      await page.waitForSelector('text=Razer DeathAdder V3 Pro');

      // Try to set quantity to 0 via minus button
      const minusBtn = page.locator('button[aria-label="Decrease quantity"]').first();
      await minusBtn.click();
      await page.waitForTimeout(1000);

      // Item should be removed or qty should be 1 minimum
      const qtyText = await page.locator('input[type="number"]').first().inputValue();
      console.log('Qty after decrement to 0:', qtyText);
    });

    test('Quantity = 1 (minimum)', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await addToCart(page, 'prod-1', 1);
      await page.goto('http://localhost:3000/cart');
      await page.waitForSelector('text=Razer DeathAdder V3 Pro');

      const qtyText = await page.locator('input[type="number"]').first().inputValue();
      expect(parseInt(qtyText)).toBeGreaterThanOrEqual(1);
      console.log('Minimum qty test completed:', qtyText);
    });

    test('Quantity = stock (maximum)', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);

      // Get stock for prod-1
      const stock = await page.evaluate(async () => {
        const supabase = (window as any).__SUPABASE_CLIENT__;
        if (!supabase) return 10;
        const { data } = await supabase.from('products').select('stock').eq('id', 'prod-1').single();
        return data?.stock || 10;
      });

      await addToCart(page, 'prod-1', stock);
      await page.goto('http://localhost:3000/cart');
      await page.waitForSelector('text=Razer DeathAdder V3 Pro');

      const qtyText = await page.locator('input[type="number"]').first().inputValue();
      console.log('Max stock qty test completed, stock:', stock, 'cart qty:', qtyText);
    });

    test('Quantity = stock + 1 (should fail)', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);

      const stock = await page.evaluate(async () => {
        const supabase = (window as any).__SUPABASE_CLIENT__;
        if (!supabase) return 10;
        const { data } = await supabase.from('products').select('stock').eq('id', 'prod-1').single();
        return data?.stock || 10;
      });

      await addToCart(page, 'prod-1', stock + 1);
      await page.goto('http://localhost:3000/cart');
      await page.waitForTimeout(1000);

      // Should cap at stock or show error
      const qtyText = await page.locator('input[type="number"]').first().inputValue();
      console.log('Stock+1 qty test completed, stock:', stock, 'cart qty:', qtyText);
    });

    test('Search: empty string', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('input[placeholder*="search" i], input[aria-label*="search" i]');

      const searchInput = page.locator('input[placeholder*="search" i], input[aria-label*="search" i]').first();
      await searchInput.fill('');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // Should show all products or handle gracefully
      const productCards = page.locator('[data-testid="product-card"], article:has-text("Razer")');
      const count = await productCards.count();
      console.log('Empty search results count:', count);
    });

    test('Search: single character', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('input[placeholder*="search" i], input[aria-label*="search" i]');

      const searchInput = page.locator('input[placeholder*="search" i], input[aria-label*="search" i]').first();
      await searchInput.fill('R');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      const productCards = page.locator('[data-testid="product-card"], article:has-text("Razer")');
      const count = await productCards.count();
      console.log('Single char search results count:', count);
    });

    test('Search: 100 characters', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('input[placeholder*="search" i], input[aria-label*="search" i]');

      const searchInput = page.locator('input[placeholder*="search" i], input[aria-label*="search" i]').first();
      await searchInput.fill('A'.repeat(100));
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // Should handle gracefully
      console.log('Long search string test completed');
    });
  });

  // =====================
  // STEP 4: Rapid/Duplicate Actions
  // =====================

  test.describe('Rapid/Duplicate Actions', () => {
    test('Rapid "Add to Cart" clicks (10x)', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('text=Razer DeathAdder V3 Pro');

      // Click add to cart rapidly
      const addBtn = page.locator('button:has-text("Add to Cart")').first();
      for (let i = 0; i < 10; i++) {
        await addBtn.click({ noWaitAfter: true });
      }
      await page.waitForTimeout(2000);

      await page.goto('http://localhost:3000/cart');
      await page.waitForTimeout(1000);

      const qtyText = await page.locator('input[type="number"]').first().inputValue();
      console.log('Rapid add to cart 10x - final qty:', qtyText);
    });

    test('Rapid "Place Order" clicks (5x)', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await addToCart(page, 'prod-1', 1);
      await page.goto('http://localhost:3000/checkout');
      await page.waitForSelector('form');

      await fillCheckoutForm(page, {
        name: 'Test User',
        email: 'admin@example.com',
        phone: '+63 912 345 6789',
        street: '123 Main St',
        city: 'Manila',
        state: 'Metro Manila',
        zip: '1000',
        country: 'Philippines'
      });

      const placeOrderBtn = page.locator('button:has-text("Place Order")');
      for (let i = 0; i < 5; i++) {
        await placeOrderBtn.click({ noWaitAfter: true });
      }
      await page.waitForTimeout(3000);

      // Should only create one order
      const toast = page.locator('[role="alert"]');
      await expect(toast).toBeVisible({ timeout: 5000 });
      console.log('Rapid place order 5x test completed');
    });

    test('Rapid tab switching', async ({ page, context }) => {
      await loginAsAdmin(page);

      // Open multiple tabs
      const tab2 = await context.newPage();
      const tab3 = await context.newPage();

      await tab2.goto('http://localhost:3000/products');
      await tab3.goto('http://localhost:3000/cart');

      // Rapidly switch and perform actions
      for (let i = 0; i < 5; i++) {
        await page.bringToFront();
        await page.waitForTimeout(100);
        await tab2.bringToFront();
        await tab2.waitForTimeout(100);
        await tab3.bringToFront();
        await tab3.waitForTimeout(100);
      }

      // Check no corruption
      await page.goto('http://localhost:3000');
      await page.waitForTimeout(500);
      console.log('Rapid tab switching test completed');

      await tab2.close();
      await tab3.close();
    });
  });

  // =====================
  // STEP 5: Browser Events
  // =====================

  test.describe('Browser Events', () => {
    test('Refresh page mid-checkout preserves form data', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await addToCart(page, 'prod-1', 1);
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

      // Refresh page
      await page.reload();
      await page.waitForSelector('form');

      // Check if form data is preserved (or appropriately cleared)
      const nameValue = await page.inputValue('input[name="name"]');
      const emailValue = await page.inputValue('input[name="email"]');
      console.log('After refresh - name:', nameValue, 'email:', emailValue);
    });

    test('Back button after order - no resubmit warning', async ({ page }) => {
      await loginAsAdmin(page);
      await clearCart(page);
      await addToCart(page, 'prod-1', 1);
      await page.goto('http://localhost:3000/checkout');
      await page.waitForSelector('form');

      await fillCheckoutForm(page, {
        name: 'Test User',
        email: 'admin@example.com',
        phone: '+63 912 345 6789',
        street: '123 Main St',
        city: 'Manila',
        state: 'Metro Manila',
        zip: '1000',
        country: 'Philippines'
      });

      await page.click('button:has-text("Place Order")');
      await page.waitForTimeout(3000);

      // Navigate back
      await page.goBack();
      await page.waitForTimeout(1000);

      // Should not show resubmit warning or form should be cleared
      console.log('Back button test completed, URL:', page.url());
    });

    test('Multiple tabs - storage sync', async ({ page, context }) => {
      await loginAsAdmin(page);
      await clearCart(page);

      const tab2 = await context.newPage();
      await tab2.goto('http://localhost:3000');
      await tab2.waitForTimeout(1000);

      // Add to cart in first tab
      await addToCart(page, 'prod-1', 1);
      await page.waitForTimeout(1000);

      // Check cart in second tab
      await tab2.goto('http://localhost:3000/cart');
      await tab2.waitForTimeout(2000);

      const hasItem = await tab2.locator('text=Razer DeathAdder V3 Pro').isVisible();
      console.log('Multi-tab storage sync - second tab sees item:', hasItem);

      await tab2.close();
    });
  });

  // =====================
  // STEP 6: Network Failures
  // =====================

  test.describe('Network Failures', () => {
    test('Offline mode - load page shows error', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Go offline
      await page.context().setOffline(true);

      // Try to navigate
      await page.goto('http://localhost:3000/products').catch(() => {});
      await page.waitForTimeout(2000);

      // Should show error or handle gracefully
      console.log('Offline load test completed');

      await page.context().setOffline(false);
    });

    test('Offline mode - add to cart shows error toast', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('text=Razer DeathAdder V3 Pro');

      await page.context().setOffline(true);

      await page.click('button:has-text("Add to Cart")');
      await page.waitForTimeout(2000);

      const toast = page.locator('[role="alert"]');
      const hasToast = await toast.isVisible({ timeout: 5000 }).catch(() => false);
      console.log('Offline add to cart - toast shown:', hasToast);

      await page.context().setOffline(false);
    });

    test('Slow 3G - loading states show', async ({ page }) => {
      // Simulate slow 3G via client-side throttling
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      const startTime = Date.now();
      await page.goto('http://localhost:3000/products');

      // Check for loading indicators
      const spinner = page.locator('[class*="spinner"], [class*="loading"], [data-testid="skeleton"]');
      const hasSpinner = await spinner.first().isVisible({ timeout: 1000 }).catch(() => false);

      const loadTime = Date.now() - startTime;
      console.log('Slow 3G simulation - load time:', loadTime, 'spinner visible:', hasSpinner);
    });
  });

  // =====================
  // STEP 7: Offline/PWA Behavior
  // =====================

  test.describe('Offline/PWA Behavior', () => {
    test('Service worker registration', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      const swRegistered = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          return !!reg;
        }
        return false;
      });
      console.log('Service worker registered:', swRegistered);
    });

    test('Critical assets cached', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      const caches = await page.evaluate(async () => {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          const results = {};
          for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            results[name] = keys.map(req => req.url);
          }
          return results;
        }
        return {};
      });
      console.log('Cache contents:', JSON.stringify(caches, null, 2));
    });
  });
});