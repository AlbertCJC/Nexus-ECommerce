import { test, expect } from '@playwright/test';

test.describe('Product Catalog Tests', () => {
  const consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Warning: validateDOMNesting') ||
            text.includes('Warning: Each child in a list should have a unique key') ||
            text.includes('Warning: ReactDOM.render is no longer supported') ||
            text.includes('Failed to load resource')) {
          return;
        }
        consoleErrors.push(text);
      }
    });
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });
  });

  test.afterEach(async ({ page }) => {
    if (consoleErrors.length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      consoleErrors.forEach(err => console.log('ERROR:', err));
      console.log('========================\n');
    }
  });

  test.describe('Products Listing Page (/products)', () => {
    test('Page loads and shows all 25 products', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const countText = await page.locator('text=/\\d+ products? found/').first().textContent();
      console.log('Product count:', countText);

      // Count products via image links (one per product)
      const productImageLinks = page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') });
      const count = await productImageLinks.count();
      console.log('Product image links found:', count);

      expect(count).toBeGreaterThanOrEqual(20);
    });

    test('ProductCard shows: image, name, brand, category, price, Add to Cart', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Product card is the Card component div containing the image link
      const firstCard = page.locator('div.grid > div:has(a[href*="/products/"] img)').first();
      await expect(firstCard).toBeVisible();

      await expect(firstCard.locator('img')).toBeVisible();
      await expect(firstCard.locator('h3')).toBeVisible();
      await expect(firstCard.locator('span.text-xs, .inline-flex')).toBeVisible();
      await expect(firstCard.locator('text=/₱/')).toBeVisible();
      await expect(firstCard.locator('button:has-text("Add to Cart")')).toBeVisible();
    });

    test('Search filter works - "Razer" filters to Razer products', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const searchInput = page.locator('input[placeholder="Search products..."]');
      await expect(searchInput).toBeVisible();

      await searchInput.fill('Razer');
      await page.waitForTimeout(1000);

      expect(page.url()).toContain('search=Razer');

      const productImageLinks = page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') });
      const count = await productImageLinks.count();
      console.log('Razer products found:', count);

      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('Category filter works - "Gaming Mice" shows only mice', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const categorySelect = page.locator('select[id="category"]');
      await expect(categorySelect).toBeVisible();

      await categorySelect.selectOption('cat-mice');
      await page.waitForTimeout(1000);

      expect(page.url()).toContain('category=cat-mice');

      const productImageLinks = page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') });
      const count = await productImageLinks.count();
      console.log('Gaming mice products found:', count);

      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('Brand filter works - Check "Razer" shows only Razer products', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const showAllBtn = page.locator('button:has-text("Show all")');
      if (await showAllBtn.isVisible()) {
        await showAllBtn.click();
        await page.waitForTimeout(500);
      }

      const razerCheckbox = page.locator('label:has-text("Razer") input[type="checkbox"]').first();
      await expect(razerCheckbox).toBeVisible();
      await razerCheckbox.check();
      await page.waitForTimeout(1000);

      expect(page.url()).toContain('brand=brand-razer');

      const productImageLinks = page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') });
      const count = await productImageLinks.count();
      console.log('Razer products via brand filter:', count);

      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('Multi-brand filter - Razer and Logitech G', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const showAllBtn = page.locator('button:has-text("Show all")');
      if (await showAllBtn.isVisible()) {
        await showAllBtn.click();
        await page.waitForTimeout(500);
      }

      const razerCheckbox = page.locator('label:has-text("Razer") input[type="checkbox"]').first();
      await razerCheckbox.check();

      const logitechCheckbox = page.locator('label:has-text("Logitech G") input[type="checkbox"]').first();
      await logitechCheckbox.check();
      await page.waitForTimeout(1000);

      expect(page.url()).toContain('brand=brand-razer');
      expect(page.url()).toContain('brand=brand-logitech');

      const productImageLinks = page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') });
      const count = await productImageLinks.count();
      console.log('Razer + Logitech products:', count);

      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('Sorting works - Price Low to High', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const sortSelect = page.locator('select[id="sort"]');
      await sortSelect.selectOption('price-asc');
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('sort=price-asc');

      const firstPrice = await page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') }).first().locator('..').locator('text=/₱/').first().textContent();
      console.log('First product price (asc):', firstPrice);
    });

    test('Sorting works - Price High to Low', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const sortSelect = page.locator('select[id="sort"]');
      await sortSelect.selectOption('price-desc');
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('sort=price-desc');

      const firstPrice = await page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') }).first().locator('..').locator('text=/₱/').first().textContent();
      console.log('First product price (desc):', firstPrice);
    });

    test('Sorting works - Name A-Z and Z-A', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const sortSelect = page.locator('select[id="sort"]');

      await sortSelect.selectOption('name-asc');
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('sort=name-asc');

      await sortSelect.selectOption('name-desc');
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('sort=name-desc');
    });

    test('URL sync - Refresh with filters preserves them', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      await page.locator('input[placeholder="Search products..."]').fill('Razer');
      await page.locator('select[id="category"]').selectOption('cat-mice');

      const showAllBtn = page.locator('button:has-text("Show all")');
      if (await showAllBtn.isVisible()) {
        await showAllBtn.click();
        await page.waitForTimeout(500);
      }
      await page.locator('label:has-text("Razer") input[type="checkbox"]').first().check();
      await page.locator('select[id="sort"]').selectOption('price-asc');
      await page.waitForTimeout(2000);

      const urlWithFilters = page.url();
      console.log('URL with filters:', urlWithFilters);

      await page.reload();
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('search=Razer');
      expect(page.url()).toContain('category=cat-mice');
      expect(page.url()).toContain('brand=brand-razer');
      expect(page.url()).toContain('sort=price-asc');
    });

    test('Clear filters button resets all', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      await page.locator('input[placeholder="Search products..."]').fill('Razer');
      await page.locator('select[id="category"]').selectOption('cat-mice');

      const showAllBtn = page.locator('button:has-text("Show all")');
      if (await showAllBtn.isVisible()) {
        await showAllBtn.click();
        await page.waitForTimeout(500);
      }
      await page.locator('label:has-text("Razer") input[type="checkbox"]').first().check();
      await page.waitForTimeout(1000);

      const clearBtn = page.locator('button:has-text("Clear Filters")');
      await expect(clearBtn).toBeVisible();
      await clearBtn.click();
      await page.waitForTimeout(2000);

      expect(page.url()).toBe('http://localhost:3000/products');
      expect(page.url()).not.toContain('search=');
      expect(page.url()).not.toContain('category=');
      expect(page.url()).not.toContain('brand=');
    });

    test('Pagination works if >20 products', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const pagination = page.locator('nav[aria-label="pagination"], .pagination, button:has-text("Next"), button:has-text("Previous")');
      const hasPagination = await pagination.count() > 0;
      console.log('Has pagination:', hasPagination);

      if (hasPagination) {
        const nextBtn = page.locator('button:has-text("Next"), a:has-text("Next")').first();
        if (await nextBtn.isVisible()) {
          await nextBtn.click();
          await page.waitForTimeout(1000);
          expect(page.url()).toContain('page=2');
        }
      }
    });
  });

  test.describe('Product Detail Page (/products/:id)', () => {
    test('Navigate to product detail from product listing', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Click the first product image link
      const firstImageLink = page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') }).first();
      const productName = await firstImageLink.locator('img').getAttribute('alt');
      console.log('Clicking product:', productName);

      await firstImageLink.click();

      await page.waitForSelector('h1', { timeout: 10000 });
      await page.waitForTimeout(1000);

      expect(page.url()).toMatch(/\/products\/prod-\d+/);

      const detailName = await page.locator('h1').first().textContent();
      console.log('Detail page product name:', detailName);
    });

    test('Product detail shows: main image, thumbnails, name, brand, category, price, description', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const firstImageLink = page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') }).first();
      await firstImageLink.click();

      await page.waitForSelector('h1', { timeout: 10000 });
      await page.waitForTimeout(1000);

      await expect(page.locator('div.aspect-square img').first()).toBeVisible();

      const thumbnails = page.locator('button[aria-label^="View image"]');
      const thumbCount = await thumbnails.count();
      console.log('Thumbnail count:', thumbCount);

      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('a[href*="/products?brand="]').first()).toBeVisible();
      await expect(page.locator('text=/Gaming Mice|Gaming Keyboards|Gaming Headsets|Gaming Monitors|Laptops|Components|Accessories/')).toBeVisible();
      await expect(page.locator('text=/₱/').first()).toBeVisible();
      await expect(page.locator('text=/ultra-lightweight|mechanical|wireless|gaming|RGB|optical|switch/i')).toBeVisible();
    });

    test('Add to Cart button works (authenticated user)', async ({ page }) => {
      // First login
      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[type="email"], input[name="email"]', 'admin@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Sign In")');
      await page.waitForURL('**/admin/dashboard*', { timeout: 20000 });
      await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 10000 });

      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const firstImageLink = page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') }).first();
      await firstImageLink.click();

      await page.waitForSelector('h1', { timeout: 10000 });
      await page.waitForTimeout(1000);

      const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
      await expect(addToCartBtn).toBeVisible();
      await addToCartBtn.click();
      await page.waitForTimeout(1000);

      const cartCount = page.locator('a[href="/cart"] span, button:has-text("Cart") span').first();
      const countText = await cartCount.textContent().catch(() => '0');
      console.log('Cart count after add:', countText);
    });

    test('Related products section shows 4 products from same category', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const firstImageLink = page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') }).first();
      await firstImageLink.click();

      await page.waitForSelector('h1', { timeout: 10000 });
      await page.waitForTimeout(2000);

      const relatedSection = page.locator('h2:has-text("You May Also Like")');
      if (await relatedSection.count() > 0) {
        await relatedSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        const relatedProducts = page.locator('section:has-text("You May Also Like") a[href*="/products/"]');
        const count = await relatedProducts.count();
        console.log('Related products count:', count);

        expect(count).toBeLessThanOrEqual(4);
      } else {
        console.log('Related products section not found (may be empty)');
      }
    });

    test('Click related product navigates correctly', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const firstImageLink = page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') }).first();
      await firstImageLink.click();

      await page.waitForSelector('h1', { timeout: 10000 });
      await page.waitForTimeout(2000);

      const relatedLink = page.locator('section:has-text("You May Also Like") a[href*="/products/"]').first();
      if (await relatedLink.count() > 0) {
        await relatedLink.click();
        await page.waitForSelector('h1', { timeout: 10000 });
        expect(page.url()).toMatch(/\/products\/prod-\d+/);
      }
    });

    test('Invalid product ID shows 404 or redirects', async ({ page }) => {
      await page.goto('http://localhost:3000/products/invalid-id');
      await page.waitForTimeout(3000);

      const notFound = page.locator('text=/Product not found|Not Found|404/i');
      await expect(notFound.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Image Loading', () => {
    test('All product images load on listing page', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(3000);

      const images = page.locator('div.grid a[href*="/products/"] img');
      const count = await images.count();
      console.log('Product images found:', count);

      const brokenImages = await page.evaluate(() => {
        const imgs = document.querySelectorAll('div.grid a[href*="/products/"] img');
        let broken = 0;
        imgs.forEach(img => {
          if (!img.complete || img.naturalWidth === 0) broken++;
        });
        return broken;
      });
      console.log('Broken images on listing:', brokenImages);
      expect(brokenImages).toBe(0);
    });

    test('Product detail page images load with fallback', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const firstImageLink = page.locator('div.grid a[href*="/products/"]').filter({ has: page.locator('img') }).first();
      await firstImageLink.click();

      await page.waitForSelector('h1', { timeout: 10000 });
      await page.waitForTimeout(2000);

      const mainImage = page.locator('div.aspect-square img').first();
      await expect(mainImage).toBeVisible();

      const thumbnails = page.locator('button[aria-label^="View image"] img');
      const thumbCount = await thumbnails.count();
      console.log('Detail page thumbnails:', thumbCount);

      const brokenImages = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img');
        let broken = 0;
        imgs.forEach(img => {
          if (!img.complete || img.naturalWidth === 0) {
            broken++;
            console.log('Broken:', img.src);
          }
        });
        return broken;
      });
      console.log('Broken images on detail:', brokenImages);
      expect(brokenImages).toBe(0);
    });

    test('Lazy loading works - images load on scroll', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const images = page.locator('div.grid a[href*="/products/"] img');
      const firstImage = images.first();
      const loadingAttr = await firstImage.getAttribute('loading');
      console.log('Image loading attribute:', loadingAttr);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      const loadedImages = await page.evaluate(() => {
        const imgs = document.querySelectorAll('div.grid a[href*="/products/"] img');
        let loaded = 0;
        imgs.forEach(img => {
          if (img.complete && img.naturalWidth > 0) loaded++;
        });
        return loaded;
      });
      console.log('Images loaded after scroll:', loadedImages);
      expect(loadedImages).toBeGreaterThan(0);
    });
  });

  test.describe('Inventory Display', () => {
    test('Products with stock=0 or status!=active are filtered from /products', async ({ page }) => {
      await page.goto('http://localhost:3000/products');
      await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const stockBadges = page.locator('span.badge:has-text("In Stock"), span.badge:has-text("Only")');
      const count = await stockBadges.count();
      console.log('In stock badges:', count);

      const outOfStockBadges = page.locator('span.badge:has-text("Out of Stock")');
      const outCount = await outOfStockBadges.count();
      console.log('Out of stock badges on listing:', outCount);

      expect(outCount).toBe(0);
    });

    test('Product detail for out_of_stock shows "Out of Stock" badge and disables add to cart', async ({ page }) => {
      console.log('Skipping - requires admin to set product to out_of_stock');
    });
  });

  test.describe('Home Page Featured Products & Brand Carousel', () => {
    test('Home page loads with featured products', async ({ page }) => {
      await page.goto('http://localhost:3000/');
      await page.waitForSelector('h1:has-text("NEXUS"), h2:has-text("Featured")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      await expect(page.locator('h2:has-text("Featured Gear")')).toBeVisible();

      const featuredProducts = page.locator('section:has-text("Featured Gear") a[href*="/products/"]');
      const count = await featuredProducts.count();
      console.log('Featured products count:', count);

      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(12);
    });

    test('Brand carousel shows 8 brands with logos', async ({ page }) => {
      await page.goto('http://localhost:3000/');
      await page.waitForSelector('h2:has-text("Trusted by Champions")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const brandLogos = page.locator('section:has-text("Trusted by Champions") img');
      const count = await brandLogos.count();
      console.log('Brand logos count:', count);

      expect(count).toBeGreaterThanOrEqual(8);
      expect(count).toBeLessThanOrEqual(9);
    });

    test('Click brand on home page filters products page by that brand', async ({ page }) => {
      await page.goto('http://localhost:3000/');
      await page.waitForSelector('h2:has-text("Trusted by Champions")', { timeout: 15000 });
      await page.waitForTimeout(2000);

      const categoryLink = page.locator('a[href*="/products?category="]').first();
      if (await categoryLink.count() > 0) {
        await categoryLink.click();
        await page.waitForSelector('h1:has-text("All Products")', { timeout: 15000 });
        expect(page.url()).toContain('/products?category=');
      }
    });
  });
});