# User Journey Findings

## Flow Test Results

| Flow | Status | Severity | Notes |
|------|--------|----------|-------|
| Home → Products → Detail → Cart → Checkout → Order | **FAIL** | Critical | Multiple blockers: OrderHistory broken, guest can't add to cart, checkout redirect broken |
| Guest Cart → Login Merge | **FAIL** | High | No merge logic implemented; guest cart lost on login |
| Order History Navigation | **FAIL** | Critical | OrderHistory component uses non-existent AppContext data (will crash) |
| Profile Edit & Password Change | **PARTIAL** | Medium | Profile edit works; password change not implemented |
| Empty States | **PARTIAL** | Low | Products/Cart/Orders empty states work; Newsletter missing |

---

## Issues Found

| ID | Severity | Title | Reproduction Steps | Expected | Actual | Fix |
|----|----------|-------|-------------------|----------|--------|-----|
| UJ-001 | Critical | **OrderHistory crashes - uses non-existent AppContext data** | 1. Login as customer<br>2. Navigate to `/orders` | Order history displays | Component throws error: `auth` and `orders` undefined from `useAppContext()` | Fix OrderHistory to use `useAuth()` + `useOrders(userId)` hook instead of `useAppContext()` |
| UJ-002 | High | **Guest users cannot add products to cart** | 1. Open site as guest (not logged in)<br>2. Navigate to any product detail page<br>3. Click "Add to Cart" | Item added to localStorage cart, toast shows | Auth modal opens forcing login; no guest cart support | Modify `ProductDetail.handleAddToCart` to add to localStorage cart via `useAppContext().dispatch({type: 'ADD_TO_CART', payload})` when not authenticated |
| UJ-003 | High | **Checkout redirects to non-existent `/auth` route for guests** | 1. Add items to cart as guest<br>2. Go to `/cart`<br>3. Click "Proceed to Checkout"<br>4. Click "Place Order" | Auth modal opens, then returns to checkout | Redirects to `/auth?redirect=checkout` (404 - route doesn't exist) | Replace `navigate('/auth?redirect=checkout')` with `openAuthModal('login')` and handle post-login redirect |
| UJ-004 | Medium | **No guest cart merge on login** | 1. Add 2 items to cart as guest<br>2. Click "Sign In" and login<br>3. Go to `/cart` | Cart shows 2 guest items + any existing server items | Cart only shows server cart items; guest items lost | Implement merge logic in Cart component or AuthContext: on login, POST guest cart items to `cart_items` table |
| UJ-005 | Low | **Newsletter signup form missing from Home page** | 1. Visit `/` (Home) | Newsletter signup form in footer or hero | No newsletter form present | Add newsletter signup component to Home page footer/hero |
| UJ-006 | Low | **Profile page lacks password change feature** | 1. Login and go to `/profile`<br>2. Look for password change option | "Change Password" section with current/new password fields | Only profile info and address editable; no password change | Add password change form to Profile component using `useAuth().updatePassword()` |
| UJ-007 | Low | **OrderHistory missing "Buy Again" functionality** | 1. Go to `/orders`<br>2. Click "View Details" on past order | "Buy Again" button adds items to cart | No "Buy Again" button exists | Add "Buy Again" button to OrderConfirmation/OrderHistory that calls `addToCart` for each item |
| UJ-008 | Medium | **ProductFilters component broken - reads categories/brands from wrong context** | 1. Go to `/products`<br>2. Open filters sidebar | Category and Brand dropdowns populated | Dropdowns empty (AppContext doesn't provide categories/brands) | Pass `categories` and `brands` as props from Products page, or fetch in ProductFilters |

---

## Additional Observations

### Working Correctly
- Home page loads hero, featured products, brand carousel ✅
- Products page: search, category filter, brand filter, sort (Price: Low to High) all functional ✅
- ProductDetail: images, description, price, quantity selector all display correctly ✅
- Cart (authenticated): quantity updates, subtotal recalculates, remove works ✅
- Checkout (authenticated): form validation, totals calculation, COD/E-Wallet/Bank options ✅
- OrderConfirmation: displays order details, items, totals, shipping address ✅
- Profile: displays current info, edit mode works for name/phone/address, save shows toast ✅
- Empty states: Products "No products found" with Clear Filters, Cart "Continue Shopping", Orders "Start Shopping" ✅
- Status badge colors: pending=amber/yellow, shipped=indigo/blue, completed=green ✅
- Session persistence: login survives refresh, protected routes work ✅

### Code Quality Notes
- **Form validation**: Uses Zod schemas (`checkoutSchema`, `profileSchema`) properly
- **Error handling**: Toast notifications for success/error states throughout
- **Loading states**: Spinners shown during data fetching
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation present
- **Responsive design**: Mobile-first with breakpoints (lg:, md:, sm:)

### Security Notes
- OrderConfirmation checks `order.user_id === session.user.id` before displaying (good)
- Checkout requires authentication (server-side RLS will enforce)
- Password validation in AuthModal (min 6 chars)

---

## Test Accounts Used
- **Customer**: `customer@test.com` / `test123` (may have existing orders)
- **Admin**: `admin@example.com` / `admin123` (separate admin flow)

---

## Recommendations Priority

1. **Fix UJ-001 immediately** - Blocks order history completely
2. **Fix UJ-002 & UJ-003** - Blocks guest purchase flow (critical for conversion)
3. **Fix UJ-004** - Improves UX for returning customers
4. **Fix UJ-008** - Breaks product filtering UX
5. **Implement UJ-005, UJ-006, UJ-007** - Nice-to-have features