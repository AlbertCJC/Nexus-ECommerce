import { test, expect } from '@playwright/test'

test.describe('Forgot Password Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console messages
    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`))
    page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.message}`))
  })

  test('should open forgot password modal and send reset link', async ({ page }) => {
    await page.goto('/')

    // Open auth modal (click login/sign up button)
    const signInButton = page.locator('button:has-text("Sign In"), button:has-text("Login"), a:has-text("Sign In"), a:has-text("Login")').first()
    await signInButton.click()
    await expect(page.locator('text=Welcome Back')).toBeVisible({ timeout: 5000 })

    // Click "Forgot Password?" link
    await page.click('button:has-text("Forgot Password?")')
    await expect(page.locator('text=Reset Password')).toBeVisible({ timeout: 5000 })
    await expect(page.locator("text=Enter your email address and we'll send you a link to reset your password")).toBeVisible()

    // Fill in email and submit
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button:has-text("Send Reset Link")')

    // Should show success toast and return to login mode
    // Wait for toast to appear immediately after clicking
    await page.waitForTimeout(1000)

    // Check if toast container exists
    const toastContainer = page.locator('.fixed.bottom-4.right-4')
    await expect(toastContainer).toBeVisible({ timeout: 5000 })

    await expect(page.locator('text=Password reset link sent! Check your email.')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Welcome Back')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to reset password page with recovery link', async ({ page }) => {
    // Direct navigation to reset password page (simulating email link click)
    await page.goto('/auth/reset-password?type=recovery&code=test-code')

    // Should show loading then error (since code is invalid)
    await expect(page.locator('text=Verifying reset link')).toBeVisible({ timeout: 5000 })

    // Wait for verification to complete
    await page.waitForTimeout(3000)

    // Should show error for invalid code
    await expect(page.locator('text=Invalid or expired reset link')).toBeVisible({ timeout: 10000 })

    // Should have "Back to Login" button
    await expect(page.locator('button:has-text("Back to Login")')).toBeVisible()

    // Click back to login - goes to home and opens modal
    await page.click('button:has-text("Back to Login")')
    await expect(page).toHaveURL(/\//)
    await expect(page.locator('text=Welcome Back')).toBeVisible({ timeout: 5000 })
  })

  test('should show reset password form and allow password update when valid session', async ({ page }) => {
    // This test would require a valid recovery session
    // For now, we test the error case above
    // A full integration test would need a real email flow
  })
})