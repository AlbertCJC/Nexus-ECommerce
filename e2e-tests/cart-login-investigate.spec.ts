import { test, expect } from '@playwright/test'

test.describe('Cart Button - Login Investigation', () => {
  test('check cart button before and after login', async ({ page }) => {
    // Go to home page
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForLoadState('networkidle')
    
    // Check cart button BEFORE login (guest)
    const cartLinkBefore = page.locator('a[href="/cart"]').first()
    const visibleBefore = await cartLinkBefore.isVisible()
    console.log('Cart button visible BEFORE login:', visibleBefore)
    
    const svgBefore = cartLinkBefore.locator('svg').first()
    await expect(svgBefore).toBeVisible()
    const strokeBefore = await svgBefore.evaluate(el => window.getComputedStyle(el).color)
    console.log('SVG stroke color BEFORE login:', strokeBefore)
    
    await page.screenshot({ path: 'test-results/before-login.png', fullPage: true })
    
    // Click Sign In button
    const signInBtn = page.locator('button:has-text("Sign In")').first()
    await expect(signInBtn).toBeVisible({ timeout: 10000 })
    await signInBtn.click({ force: true })
    
    // Wait for modal
    await page.waitForSelector('h2:has-text("Welcome Back")', { timeout: 10000 })
    
    // Fill with credentials
    await page.fill('input[id="email"]', 'customer@test.com')
    await page.fill('input[id="password"]', 'test123')
    await page.click('button:has-text("Sign In")', { force: true })
    
    // Wait for login response
    await page.waitForTimeout(5000)
    
    // Check if modal closed (login success)
    const modalClosed = await page.locator('h2:has-text("Welcome Back")').count() === 0
    console.log('Login success (modal closed):', modalClosed)
    
    // Check for errors
    const errorToast = page.locator('[class*="toast-error"]').first()
    if (await errorToast.count() > 0) {
      const errorText = await errorToast.textContent()
      console.log('Login error toast:', errorText)
    }
    
    // Wait for auth state to propagate
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Check cart button AFTER login
    const cartLinkAfter = page.locator('a[href="/cart"]').first()
    const visibleAfter = await cartLinkAfter.isVisible()
    console.log('Cart button visible AFTER login:', visibleAfter)
    
    if (visibleAfter) {
      const svgAfter = cartLinkAfter.locator('svg').first()
      const svgVisible = await svgAfter.isVisible()
      console.log('Cart SVG visible AFTER login:', svgVisible)
      const strokeAfter = await svgAfter.evaluate(el => window.getComputedStyle(el).color)
      console.log('SVG stroke color AFTER login:', strokeAfter)
      
      // Also check if user menu is visible (confirms authenticated)
      const userMenu = page.locator('button[aria-label="User account"]').first()
      const userMenuVisible = await userMenu.isVisible()
      console.log('User menu visible:', userMenuVisible)
    } else {
      console.log('❌ CART BUTTON DISAPPEARED AFTER LOGIN!')
      // Check what's in the nav area
      const navContent = await page.locator('nav').innerHTML()
      console.log('Nav HTML length:', navContent.length)
      
      // Check if isAdmin might be true
      const isAdmin = await page.evaluate(() => {
        // Check if there's an admin dashboard link
        return document.querySelector('a[href="/admin/dashboard"]') !== null
      })
      console.log('Is admin dashboard link present:', isAdmin)
    }
    
    await page.screenshot({ path: 'test-results/after-login.png', fullPage: true })
  })
})
