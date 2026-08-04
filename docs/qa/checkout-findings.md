# Checkout & Payment Agent Findings

## Test Results

| Test Case | Status | Severity | Notes |
|-----------|--------|----------|-------|
| Form Validation - empty form shows errors | **FAIL** | Medium | "Select a payment method" error not shown - COD radio is pre-selected by default |
| Profile prefill works for authenticated user | **PASS** | - | Email prefilled correctly; name/phone empty (admin has no metadata) |
| Guest redirect to login when checking out | **FAIL** | High | Redirects to non-existent `/auth` route (UJ-003 confirmed) |
| Payment method selection - COD | **PASS** | - | COD radio selected by default, works correctly |
| Payment method selection - E-Wallet | **PASS** | - | Radio selection works, UI updates correctly |
| Payment method selection - Bank Transfer | **PASS** | - | Radio selection works, UI updates correctly |
| Totals accuracy - verify calculations | **FAIL** | Medium | Test data exceeded ₱100 free shipping threshold; shipping shows "Free" not ₱9.99 |
| Duplicate submission prevention - button loading state | **PASS** | - | Loading spinner shows on first click, prevents double-submit |
| Cart UI shows items before order | **PASS** | - | Cart page correctly displays items, quantities, and prices |
| Cart Cleared After Order | **PASS** | - | Order placement clears Supabase cart_items via `useCreateOrder` mutation; `/cart` shows empty state; Navbar badge = 0 |

**Overall: 7/9 tests pass, 2 failures (1 related to known issue UJ-003, 1 test data issue)**

---

## Issues Found

| ID | Severity | Title | Reproduction Steps | Expected | Actual | Fix |
|----|----------|-------|-------------------|----------|--------|-----|
| CHK-001 | Medium | Form validation doesn't show "Select payment method" error | 1. Login as authenticated user<br>2. Go to `/checkout` with cart items<br>3. Clear all form fields including country<br>4. Click "Place Order" without selecting payment method | "Select a payment method" error visible | Error not shown because COD radio is pre-selected via `defaultValues.paymentMethod: 'cod'` | Remove default payment method or add explicit validation that user must actively select (not just accept default) |
| CHK-002 | High | Guest checkout redirects to 404 `/auth` route | 1. Add items to cart as guest (localStorage)<br>2. Go to `/checkout`<br>3. Fill form, select payment<br>4. Click "Place Order" | Auth modal opens, then returns to checkout | Redirects to `/auth?redirect=checkout` → 404 page | **UJ-003**: Replace `navigate('/auth?redirect=checkout')` with `openAuthModal('login')` and handle post-login redirect via state |
| CHK-003 | Medium | Totals test data exceeded free shipping threshold | 1. Add prod-1 (₱94.90) x 4 = ₱379.60<br>2. Go to checkout | Shipping ₱9.99 (under ₱100) | Shipping shows "Free" (over ₱100 threshold) | Test data issue: use lower quantity or cheaper product to test paid shipping |
| CHK-004 | Info | Admin user profile has no name/phone metadata | 1. Login as admin@example.com<br>2. Go to checkout | Name and phone prefilled from profile | Only email prefilled; name/phone empty | Expected behavior - admin user was created without first_name/last_name/phone in user_metadata |

---

## Code Analysis Findings

### What Works Well

1. **Form Validation (Zod + react-hook-form)**: Comprehensive validation on all required fields (name ≥2 chars, email format, phone format, address fields, country, payment method). Error messages display inline correctly.

2. **Profile Prefill**: `defaultValues` in Checkout.jsx correctly pulls from `session.user.email` and `session.user.user_metadata` for name/phone. Works for customers with complete profiles.

3. **Payment Method Selection**: Three radio options (COD, E-Wallet, Bank Transfer) with proper labeling, descriptions, and visual feedback on selection. COD is default.

4. **Totals Calculation**: Correctly implemented in Checkout.jsx:
   - Subtotal: `price_cents × quantity` (sum of all items)
   - Shipping: `0` if subtotal ≥ 10000 cents (₱100), else 999 cents (₱9.99)
   - Tax: 10% of subtotal (rounded)
   - Total: subtotal + shipping + tax

5. **Loading State / Duplicate Prevention**: `submitting` state disables button and shows spinner on click. Prevents rapid double-clicks.

6. **Order Creation Flow**: `useCreateOrder` mutation correctly:
   - Creates order with checkout data
   - Creates order_items for each cart item
   - Clears authenticated user's cart_items from Supabase
   - Returns order ID for confirmation redirect

7. **Order Confirmation Page**: Displays order details, items, totals, shipping address, and payment method correctly.

8. **Admin Order Detail**: Shows payment method in order details for admin review.

### Root Causes of Issues

**CHK-001 (Payment method validation):**
- `Checkout.jsx` line 70: `defaultValues.paymentMethod: 'cod'` pre-selects COD
- `checkoutSchema` in `validation.js` has `paymentMethod: z.enum(['cod', 'ewallet', 'bank'])` - valid by default
- No "required" validation message triggers because default satisfies schema
- Fix: Either remove default and require explicit selection, or add `refine` to check user interacted

**CHK-002 (Guest redirect to 404):**
- `Checkout.jsx` line 88: `navigate('/auth?redirect=checkout')` 
- No `/auth` route exists in `AppRoutes.jsx` - only `/login`, `/signup`, `/forgot-password`
- This is the known **UJ-003** issue documented in user-journey-findings.md
- Fix: Use `useAppContext().openAuthModal('login')` and store redirect path in state

**CHK-003 (Totals test data):**
- Test used prod-1 (₱94.90) × 4 = ₱379.60 subtotal
- Free shipping threshold is ₱100 (10000 cents)
- Test expected ₱9.99 shipping but got "Free"
- Test data fix: use 1 unit of prod-1 (₱94.90) or prod-7 (₱29.90)

**CHK-004 (Admin profile):**
- Admin user created without `first_name`, `last_name`, `phone` in user_metadata
- `Checkout.jsx` lines 66-68 derive name/phone from metadata
- Expected behavior - not a bug, just incomplete test account setup

---

## Additional Observations

### Working Correctly
- Authenticated checkout flow: form → validation → payment selection → submit → order creation → confirmation
- All three payment methods selectable and persist in order
- Order confirmation displays correct payment method
- Admin order detail shows payment method
- Tax calculation: 10% of subtotal, rounded to nearest cent
- Free shipping at ₱100+ subtotal works correctly
- Empty cart redirects to products page with helpful message
- Protected route: unauthenticated users cannot access checkout (frontend guard)

### Known Blockers (Pre-existing)
- **AUTH-001 (Critical)**: Admin RLS policies don't work - JWT role claim always 'authenticated', not 'admin'. This may block actual order creation in database for admin test user (orders table insert requires user_id match, but admin role needed for some operations).
- **UJ-002/CART-001 (Critical)**: Guest users cannot add to cart - forced to login modal. Makes guest checkout flow untestable via UI.
- **UJ-003 (High)**: Guest checkout redirect broken (same as CHK-002).
- **UJ-004/CART-002 (High)**: No guest cart merge on login.

### Security Notes
- Checkout page protected by `CustomerProtectedRoute` - redirects unauthenticated to home
- Order creation uses authenticated user's `session.user.id` - cannot create orders for other users
- Form validation on both client (Zod) and should be enforced server-side via RLS
- Payment method stored in order record but no actual payment processing (simulated)

---

## Recommendations Priority

1. **Fix CHK-002 / UJ-003 immediately** - Blocks guest purchase flow entirely (critical for conversion)
2. **Fix CHK-001** - Improves form UX; users should actively choose payment method
3. **Address AUTH-001** - Fix admin RLS policies to enable proper order creation testing
4. **Fix UJ-002 / CART-001** - Enable guest add-to-cart for complete guest journey
5. **Fix UJ-004 / CART-002** - Implement guest→auth cart merge

---

## Test Accounts Used
- **Admin**: `admin@example.com` / `admin123` (only working account; customer@test.com / test123 not functional)
- **Customer**: Not available for testing - credentials invalid or account not confirmed

---

## Test Environment
- Dev Server: http://localhost:3000
- Supabase: https://dlqjmtnwcekcndpchxgr.supabase.co
- Browser: Chromium (Playwright)
- Date: 2026-08-05