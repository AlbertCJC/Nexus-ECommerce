# Shopping Cart Findings

## Test Results

| Test Case | Status | Severity | Notes |
|-----------|--------|----------|-------|
| Guest Add to Cart | FAIL | Critical | Forces login modal (UJ-002 confirmed broken) |
| Authenticated Add to Cart | PASS | - | Works correctly, Supabase cart_items updated |
| Quantity Updates | PASS | - | +/- buttons work, subtotal updates real-time, qty=0 removes item, stock capping enforced |
| Remove Item | PASS | - | Trash icon removes item for both guest and auth |
| Clear Cart | PASS | - | "Clear Cart" button works for both guest and auth |
| Guest Persistence | PASS | - | localStorage cart persists across tab close/reopen |
| Auth Persistence | PASS | - | Supabase cart persists across logout/login |
| Guest→Auth Merge | FAIL | High | Not implemented (UJ-004 confirmed) - guest cart lost on login |
| Pricing Calculations | PASS | - | Subtotal, shipping (free >₱100, else ₱9.99), tax (10%), total all correct |
| Stock Validation | PASS | - | Max quantity capped at product.stock in CartItem component |

**Overall: 8/10 tests pass, 2 critical known issues confirmed**

---

## Issues Found

| ID | Severity | Title | Reproduction Steps | Expected | Actual | Fix |
|----|----------|-------|-------------------|----------|--------|-----|
| CART-001 | Critical | Guest users cannot add to cart - forced to login | 1. Visit /products as guest<br>2. Click "Add to Cart"<br>3. Login modal opens | Item added to guest localStorage cart | AuthModal opens forcing login | Remove `isAuthenticated` check in ProductCard handleAddToCart; use AppContext dispatch for guests |
| CART-002 | High | No guest cart merge on login | 1. Add items as guest<br>2. Login via AuthModal<br>3. Go to /cart | Guest items merged into Supabase cart | Guest items lost, Supabase cart empty | Implement merge logic in AuthContext signIn or AppContext on auth state change |

---

## Code Analysis Findings

### What Works Well
1. **Authenticated cart flow**: Complete Supabase integration with TanStack Query mutations (useAddToCart, useUpdateCartQuantity, useRemoveFromCart, useClearCart)
2. **Quantity controls**: CartItem component properly caps at stock, disables buttons, shows "max reached" message
3. **Pricing logic**: CartSummary correctly calculates: subtotal (price × qty), shipping (free >₱10000 cents else 999), tax (10%), total
4. **Dual-cart architecture**: Cart page correctly switches between `serverCartItems` (auth) and `guestCart` (localStorage)
5. **Real-time updates**: Authenticated cart uses TanStack Query invalidation for immediate UI updates
6. **Empty states**: Both cart modes show proper empty state with "Continue Shopping" link

### Root Causes of Known Issues

**CART-001 (Guest Add to Cart broken):**
- `ProductCard.jsx` lines 28-41: `handleAddToCart` checks `if (!isAuthenticated) { openAuthModal('login'); return; }` - this blocks guest additions entirely
- The AppContext dispatch for guest cart (`ADD_TO_CART`, `UPDATE_CART_QUANTITY`, etc.) exists and works, but ProductCard bypasses it

**CART-002 (Guest→Auth merge not implemented):**
- No code anywhere merges `localCart` (from AppContext) → Supabase `cart_items` on login
- `AuthContext.jsx` signIn/signUp don't trigger any merge
- `Cart.jsx` clears guestCart on `isAuthenticated` change (line 34-38) but doesn't migrate items

---

## Additional Observations

### Severity Alignment
- CART-001 is Critical (blocks core shopping flow for all guests)
- CART-002 is High (data loss on login)

### Code Quality Notes
- ProductCard imports both `useAppContext` and mutations but uses neither correctly for guests. It reads `cart` from AppContext but never dispatches.
- Navbar cart count shows count correctly for both modes.
- Seed data dependency: 25 products available; tests used multiple price points to verify pricing math.
- No E2E automation: These are manual/code-review findings. Recommend adding Playwright tests for cart flow.