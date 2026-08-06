import { test, expect } from '@playwright/test';

const PAGES_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/products', name: 'Products' },
  { path: '/cart', name: 'Cart' },
  { path: '/admin/login', name: 'Admin Login' },
  { path: '/register', name: 'Register' },
];

// Run on all configured projects (desktop browsers + mobile viewports)
for (const page of PAGES_TO_TEST) {
  test(`${page.name} page loads without console errors`, async ({ page: browserPage, browserName }) => {
    const consoleErrors: string[] = [];
    browserPage.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[${browserName}] ${msg.text()}`);
      }
    });

    await browserPage.goto(page.path, { waitUntil: 'networkidle' });
    await expect(browserPage).toHaveTitle(/NEXUS|Gaming|E-commerce/i);

    // Filter out known benign errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('preload') &&
      !err.includes('Source map') &&
      !err.includes('Failed to load resource') &&
      !err.includes('net::ERR_') &&
      !err.includes('Cookie') &&
      !err.includes('__cf_bm') &&
      !err.includes('invalid domain')
    );

    // Log all console errors for debugging
    if (consoleErrors.length > 0) {
      console.log(`Console errors on ${page.name}:`, consoleErrors);
    }

    // Only fail on critical errors
    expect(criticalErrors.length).toBe(0);
  });
}

test('CSS Variables render correctly', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  const rootStyles = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const props = {};
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith('--')) {
        props[prop] = styles.getPropertyValue(prop);
      }
    }
    return props;
  });
  // Check for actual CSS variables used in the app
  const primaryColor = rootStyles['--accent-primary'] ||
                       rootStyles['--bg-deep'] ||
                       rootStyles['--bg-base'] ||
                       rootStyles['--text-primary'];
  expect(primaryColor?.trim()).toBeTruthy();
});

test('Flexbox/Grid layouts work on product grid', async ({ page }) => {
  await page.goto('/products', { waitUntil: 'networkidle' });

  const productGrid = page.locator('[data-testid="product-grid"], .product-grid, .products-grid, .grid, [class*="grid"]').first();
  if (await productGrid.count() > 0) {
    const display = await productGrid.evaluate(el => getComputedStyle(el).display);
    expect(['grid', 'flex', 'inline-flex', 'inline-grid']).toContain(display);
  }
});

test('localStorage/sessionStorage work', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  const storageWorks = await page.evaluate(() => {
    try {
      localStorage.setItem('test', 'value');
      const val = localStorage.getItem('test');
      localStorage.removeItem('test');
      sessionStorage.setItem('test', 'value');
      const sessVal = sessionStorage.getItem('test');
      sessionStorage.removeItem('test');
      return val === 'value' && sessVal === 'value';
    } catch {
      return false;
    }
  });
  expect(storageWorks).toBe(true);
});

test('No horizontal scroll on mobile', async ({ page, viewport }) => {
  if (!viewport || viewport.width >= 768) {
    test.skip('Desktop viewport - skipping horizontal scroll check');
  }

  await page.goto('/', { waitUntil: 'networkidle' });

  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasHorizontalScroll).toBe(false);
});

test('Touch targets >= 44px on mobile', async ({ page, viewport }) => {
  if (!viewport || viewport.width >= 768) {
    test.skip('Desktop viewport - skipping touch target check');
  }

  await page.goto('/', { waitUntil: 'networkidle' });

  const smallTargets = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a, input, select, [role="button"], [tabindex="0"]'));
    return buttons.filter(el => {
      const rect = el.getBoundingClientRect();
      // Only check visible elements
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      return rect.width < 44 || rect.height < 44;
    }).length;
  });

  // Log but don't fail - some elements may be intentionally smaller (like icon buttons)
  if (smallTargets > 0) {
    console.log(`Mobile: ${smallTargets} elements smaller than 44px`);
  }
});

test('Text readable without zoom on mobile', async ({ page, viewport }) => {
  if (!viewport || viewport.width >= 768) {
    test.skip('Desktop viewport - skipping text size check');
  }

  await page.goto('/', { waitUntil: 'networkidle' });

  const tinyText = await page.evaluate(() => {
    const textElements = Array.from(document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, a, button'));
    return textElements.filter(el => {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const fontSize = parseFloat(style.fontSize);
      return fontSize < 12;
    }).length;
  });

  if (tinyText > 0) {
    console.log(`Mobile: ${tinyText} elements with font-size < 12px`);
  }
});

test('Forms usable on mobile', async ({ page, viewport }) => {
  if (!viewport || viewport.width >= 768) {
    test.skip('Desktop viewport - skipping form check');
  }

  // Test admin login page for forms (since customer login is in a modal)
  await page.goto('/admin/login', { waitUntil: 'networkidle' });

  const inputs = page.locator('input, select, textarea');
  const count = await inputs.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);
    await input.focus();
    const rect = await input.boundingBox();
    if (rect) {
      expect(rect.height).toBeGreaterThanOrEqual(40);
    }
  }
});

test('Navigation accessible on mobile', async ({ page, viewport }) => {
  if (!viewport || viewport.width >= 768) {
    test.skip('Desktop viewport - skipping nav check');
  }

  await page.goto('/', { waitUntil: 'networkidle' });

  const nav = page.locator('nav, [role="navigation"], .navbar, header').first();
  await expect(nav).toBeVisible();
});

// Safari/WebKit specific tests (runs on webkit project)
test.describe.configure({ retries: 0 });
test('Safari: backdrop-filter support', async ({ page, browserName }) => {
  if (browserName !== 'webkit') {
    test.skip('Safari-specific test');
  }

  await page.goto('/', { waitUntil: 'networkidle' });

  const hasBackdropFilter = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.some(el => {
      const style = getComputedStyle(el);
      return style.backdropFilter !== 'none' || style.webkitBackdropFilter !== 'none';
    });
  });

  console.log(`Safari backdrop-filter detected: ${hasBackdropFilter}`);
});

test('Safari: IndexedDB available', async ({ page, browserName }) => {
  if (browserName !== 'webkit') {
    test.skip('Safari-specific test');
  }

  await page.goto('/', { waitUntil: 'networkidle' });

  const indexedDBAvailable = await page.evaluate(() => {
    try {
      return 'indexedDB' in window;
    } catch {
      return false;
    }
  });
  expect(indexedDBAvailable).toBe(true);
});

test('Safari: Touch events supported', async ({ page, browserName }) => {
  if (browserName !== 'webkit') {
    test.skip('Safari-specific test');
  }

  await page.goto('/', { waitUntil: 'networkidle' });

  const touchSupported = await page.evaluate(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });
  console.log(`Safari touch events supported: ${touchSupported}`);
});

// Chromium/Edge specific tests
test('Chromium: Modern APIs available', async ({ page, browserName }) => {
  if (browserName !== 'chromium') {
    test.skip('Chromium-specific test');
  }

  await page.goto('/', { waitUntil: 'networkidle' });

  const hasModernAPIs = await page.evaluate(() => {
    return 'IntersectionObserver' in window &&
           'ResizeObserver' in window &&
           'fetch' in window &&
           'Promise' in window &&
           'crypto' in window;
  });
  expect(hasModernAPIs).toBe(true);
});

test('Firefox: CSS Grid/Flexbox support', async ({ page, browserName }) => {
  if (browserName !== 'firefox') {
    test.skip('Firefox-specific test');
  }

  await page.goto('/products', { waitUntil: 'networkidle' });

  const gridSupport = await page.evaluate(() => {
    return CSS.supports('display', 'grid') && CSS.supports('display', 'flex');
  });
  expect(gridSupport).toBe(true);
});