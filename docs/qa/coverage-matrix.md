# QA Coverage Matrix

## Pages Tested
| Page | Route | Agent | Tested | Pass | Fail | Blocked | Notes |
|------|-------|-------|--------|------|------|---------|-------|
| Home | `/` | User Journey | ✅ | 1 | 0 | 0 | Hero, featured products, brand carousel load |
| Products | `/products` | User Journey | ✅ | 1 | 0 | 0 | Search, filter, sort work; ProductFilters has bug (UJ-008) |
| Product Detail | `/products/:id` | User Journey | ✅ | 1 | 1 | 0 | Images, desc, price OK; Guest can't add to cart (UJ-002) |
| Cart | `/cart` | User Journey | ✅ | 1 | 1 | 0 | Qty update, subtotal work; guest cart merge missing (UJ-004) |
| Checkout | `/checkout` | Checkout & Payment | ✅ | 6 | 3 | 0 | Profile prefill, payment methods, totals, duplicate prevention work; guest redirect broken (UJ-003/CHK-002), payment validation default (CHK-001), test data issue (CHK-003) |
| Order Confirmation | `/order/:id/confirmation` | User Journey | ✅ | 1 | 0 | 0 | Order details, items, totals display correctly |
| Order History | `/orders` | User Journey | ❌ | 0 | 1 | 1 | **Crashes** - uses non-existent AppContext data (UJ-001) |
| Profile | `/profile` | User Journey | ✅ | 1 | 1 | 0 | Edit profile works; password change missing (UJ-006) |
| Admin Login | `/admin/login` | Auth Agent | ✅ | 1 | 0 | 0 | Admin credentials work, redirects to dashboard |
| Admin Dashboard | `/admin/dashboard` | Admin Panel | ☐ | | | | |
| Admin Products | `/admin/products` | Admin Panel | ☐ | | | | |
| Admin Categories | `/admin/categories` | Admin Panel | ☐ | | | | |
| Admin Brands | `/admin/brands` | Admin Panel | ☐ | | | | |
| Admin Orders | `/admin/orders` | Admin Panel | ☐ | | | | |
| Admin Order Detail | `/admin/orders/:id` | Admin Panel | ☐ | | | | |
| Admin Customers | `/admin/customers` | Admin Panel | ☐ | | | | |

## Components Tested (25+)
| Component | Category | Agent | Tested | Pass | Fail | Blocked |
|-----------|----------|-------|--------|------|------|---------|
| Button | UI | Functional | ☐ | | | |
| Input | UI | Functional | ☐ | | | |
| Select | UI | Functional | ☐ | | | |
| Checkbox | UI | Functional | ☐ | | | |
| Modal | UI | Functional | ☐ | | | |
| Toast | UI | Functional | ☐ | | | |
| Card | UI | Functional | ☐ | | | |
| Table | UI | Functional | ☐ | | | |
| Badge | UI | Functional | ☐ | | | |
| Spinner | UI | Functional | ☐ | | | |
| AuthModal | UI | Auth | ✅ | 1 | 0 | 0 |
| Navbar | Layout | UI/UX | ✅ | 1 | 0 | 0 | Navigation, user menu, cart count work |
| Footer | Layout | UI/UX | ☐ | | | |
| CustomerLayout | Layout | UI/UX | ☐ | | | |
| AdminLayout | Layout | UI/UX | ☐ | | | |
| AdminSidebar | Layout | UI/UX | ☐ | | | |
| ProductCard | Products | Product Catalog | ☐ | | | |
| ProductGrid | Products | Product Catalog | ☐ | | | |
| ProductFilters | Products | Product Catalog | ✅ | 0 | 1 | 0 | **Broken** - reads categories/brands from wrong context (UJ-008) |
| RelatedProducts | Products | Product Catalog | ☐ | | | |
| CartItem | Cart | Shopping Cart | ✅ | 1 | 0 | 0 | Qty controls, stock cap, remove work |
| CartSummary | Cart | Shopping Cart | ✅ | 1 | 0 | 0 | Subtotal, shipping, tax, total correct |
| StatsCard | Admin | Admin Panel | ☐ | | | |
| SalesChart | Charts | Performance | ☐ | | | |

## Workflows Tested
| Workflow | Agent | Tested | Pass | Fail | Blocked |
|----------|-------|--------|------|------|---------|
| Customer Signup → Login → Browse → Cart → Checkout → Order | User Journey | ✅ | 0 | 1 | 1 | Guest checkout broken (UJ-002, UJ-003) |
| Guest → Add to Cart → Login → Cart Persisted | Shopping Cart | ✅ | 0 | 1 | 0 | No merge logic (UJ-004) |
| Admin Login → Dashboard → Manage Products | Admin Panel | ☐ | | | |
| Order Lifecycle: Pending → Confirmed → Shipped → Completed | Admin Panel | ☐ | | | |
| Password Reset Flow | Auth | ✅ | 1 | 0 | 0 |
| Customer Signup Flow | Auth | ✅ | 1 | 0 | 0 |
| Customer Login/Logout Flow | Auth | ✅ | 1 | 0 | 0 |
| Session Persistence Flow | Auth | ✅ | 1 | 0 | 0 |
| Admin Role Validation | Auth | ✅ | 1 | 0 | 0 |
| Authorization Boundaries | Auth | ✅ | 1 | 0 | 0 |
| OAuth Login | Auth | ☐ | | | 1 |

## API/Queries Tested
| Hook/Query | Agent | Tested | Pass | Fail | Blocked |
|------------|-------|--------|------|------|---------|
| useProducts | API Verification | ☐ | | | |
| useProduct | API Verification | ☐ | | | |
| useCategories | API Verification | ☐ | | | |
| useBrands | API Verification | ☐ | | | |
| useOrders | API Verification | ☐ | | | |
| useOrder | API Verification | ☐ | | | |
| useCart | API Verification | ☐ | | | |
| useProfile | API Verification | ☐ | | | |
| useAdminStats | API Verification | ☐ | | | |
| useAdminCustomers | API Verification | ☐ | | | |
| useAddToCart | API Verification | ☐ | | | |
| useUpdateCartQuantity | API Verification | ☐ | | | |
| useRemoveFromCart | API Verification | ☐ | | | |
| useClearCart | API Verification | ☐ | | | |
| useCreateOrder | API Verification | ☐ | | | |
| useUpdateOrderStatus | API Verification | ☐ | | | |
| useCreateProduct | API Verification | ☐ | | | |
| useUpdateProduct | API Verification | ☐ | | | |
| useDeleteProduct | API Verification | ☐ | | | |
| useCreateCategory | API Verification | ☐ | | | |
| useUpdateCategory | API Verification | ☐ | | | |
| useDeleteCategory | API Verification | ☐ | | | |
| useCreateBrand | API Verification | ☐ | | | |
| useUpdateBrand | API Verification | ☐ | | | |
| useDeleteBrand | API Verification | ☐ | | | |
| useUpdateProfile | API Verification | ☐ | | | |
| useUploadImage | API Verification | ☐ | | | |