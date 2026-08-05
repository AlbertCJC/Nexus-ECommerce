import { test } from '@playwright/test';

test('debug delete buttons', async ({ page }) => {
  await page.goto('http://localhost:3000/admin/login');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard', { timeout: 60000 });
  await page.waitForLoadState('networkidle');

  await page.goto('http://localhost:3000/admin/categories');
  await page.waitForLoadState('networkidle');

  // Check table content
  const tableRows = page.locator('main table tbody tr');
  const rowCount = await tableRows.count();
  console.log('Table rows:', rowCount);

  for (let i = 0; i < rowCount; i++) {
    const row = tableRows.nth(i);
    const cells = row.locator('td');
    const cellCount = await cells.count();
    const cellTexts = [];
    for (let j = 0; j < cellCount; j++) {
      cellTexts.push(await cells.nth(j).textContent());
    }
    console.log(`Row ${i}:`, cellTexts);
  }

  // Check all delete buttons
  const allDeleteButtons = page.locator('button[aria-label="Delete"]');
  const count = await allDeleteButtons.count();
  console.log('Total delete buttons:', count);

  for (let i = 0; i < count; i++) {
    const btn = allDeleteButtons.nth(i);
    const disabled = await btn.getAttribute('disabled');
    const ariaDisabled = await btn.getAttribute('aria-disabled');
    const className = await btn.getAttribute('class');
    const outerHTML = await btn.evaluate(el => el.outerHTML);
    console.log(`Button ${i}: disabled=${disabled}, aria-disabled=${ariaDisabled}, class=${className}, HTML=${outerHTML.substring(0, 200)}`);
  }

  // Check table delete buttons
  const tableDeleteButtons = page.locator('main table button[aria-label="Delete"]');
  const tableCount = await tableDeleteButtons.count();
  console.log('Table delete buttons:', tableCount);

  for (let i = 0; i < tableCount; i++) {
    const btn = tableDeleteButtons.nth(i);
    const disabled = await btn.getAttribute('disabled');
    const ariaDisabled = await btn.getAttribute('aria-disabled');
    const className = await btn.getAttribute('class');
    const outerHTML = await btn.evaluate(el => el.outerHTML);
    console.log(`Table Button ${i}: disabled=${disabled}, aria-disabled=${ariaDisabled}, class=${className}, HTML=${outerHTML.substring(0, 200)}`);
  }

  await page.waitForTimeout(5000);
});