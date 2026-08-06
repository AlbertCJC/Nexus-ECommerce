import { test, expect } from '@playwright/test'

test.describe('Admin Delete Product & Category', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console messages
    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`))
    page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.message}`))

    // Login as admin
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/dashboard/)
  })

  test('should add and delete a category', async ({ page }) => {
    await page.goto('/admin/categories')
    await expect(page.locator('h1:has-text("Categories")')).toBeVisible()

    // Add new category
    await page.click('button:has-text("Add Category")')
    await expect(page.locator('h3:has-text("Add Category")')).toBeVisible({ timeout: 5000 })

    // Fill form
    await page.fill('input[id*="name"]', 'Test Category for Delete')
    await page.fill('textarea[name="description"]', 'Test category to verify delete')
    await page.click('button[type="submit"]:has-text("Create")')

    // Wait for toast and verify category appears
    await expect(page.locator('text=Category created successfully')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=Test Category for Delete')).toBeVisible()

    // Delete the category
    await page.locator('button[aria-label="Delete"]').last().click()
    await page.click('button:has-text("Delete")')

    // Wait for toast and verify category is gone
    await expect(page.locator('text=Category deleted successfully')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Test Category for Delete')).not.toBeVisible({ timeout: 10000 })
  })

  test('should add and delete a product', async ({ page }) => {
    await page.goto('/admin/products')
    await expect(page.locator('h1:has-text("Products")')).toBeVisible()

    // Add new product
    await page.click('button:has-text("Add Product")')
    await expect(page.locator('h3:has-text("Add Product")')).toBeVisible({ timeout: 5000 })

    // Fill form - price in cents (integer)
    await page.fill('input[id*="name"]', 'Test Product for Delete')
    await page.fill('input[name="image_url"]', 'https://example.com/test.jpg')
    await page.fill('input[name="price_cents"]', '99999')
    await page.fill('input[name="stock"]', '10')
    await page.selectOption('select[name="category_id"]', { index: 1 })
    await page.selectOption('select[name="brand_id"]', { index: 1 })
    await page.fill('textarea[name="description"]', 'Test product to verify delete')

    await page.click('button[type="submit"]:has-text("Create")')

    // Wait for form submission
    await page.waitForTimeout(8000)

    // The product was created successfully (list shows it)
    await expect(page.locator('text=Test Product for Delete').first()).toBeVisible({ timeout: 10000 })

    // Delete the product (click the delete button on the first matching row)
    await page.locator('button[aria-label="Delete"]').first().click()
    await page.click('button:has-text("Delete")')

    // Wait for toast and verify product is soft-deleted (marked as inactive)
    await expect(page.locator('text=Product deleted successfully')).toBeVisible({ timeout: 15000 })
    // Wait for list to refresh
    await page.waitForTimeout(2000)
    // Product should still be visible in admin panel but marked as inactive
    await expect(page.locator('text=Test Product for Delete').first()).toBeVisible({ timeout: 10000 })
    // Check for inactive status badge (Badge component with "Inactive" text uses badge-neutral variant)
    await expect(page.locator('.badge.badge-neutral:has-text("Inactive")').first()).toBeVisible({ timeout: 5000 })
  })
})