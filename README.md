# NEXUS Gaming E-Commerce

A modern full-stack gaming e-commerce platform with React 18, Supabase (PostgreSQL), and real-time capabilities. Features a customer storefront, admin dashboard, and secure authentication with rate limiting.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (uses Vite + Supabase)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run unit tests (Vitest)
npm test

# Run E2E tests (Playwright)
npx playwright test
```

The app runs at `http://localhost:3000`

## 🔐 Authentication & Roles

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | `admin@example.com` | `admin123` | Full admin panel at `/admin/*` |
| Customer | Sign up at `/auth/register` | Your password | Customer storefront |

**Admin access is database-driven**: Set `role = 'admin'` in `user_profiles` table and `auth.users.raw_user_meta_data.role = 'admin'`

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, Vite 6 |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Styling | Tailwind CSS 3.4 (CSS custom properties, dark gaming theme) |
| Routing | React Router 6 (code splitting via React.lazy + Suspense) |
| State/Query | TanStack Query v5 (server state) + React Context (UI state) |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Testing | Vitest (unit) + Playwright (E2E) |
| Icons | Heroicons (inline SVG) |
| Date | date-fns |
| IDs | uuid (client-side generation) |

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # Primitive components (Button, Input, Modal, Table, Badge, Spinner, Toast, Select, Card)
│   ├── layout/       # Layout wrappers (Navbar, Footer, AdminSidebar, CustomerLayout, AdminLayout)
│   ├── products/     # Product display (ProductCard, ProductGrid, ProductFilters, RelatedProducts)
│   ├── cart/         # Cart components (CartItem, CartSummary)
│   ├── admin/        # Admin-specific (StatsCard)
│   └── charts/       # Chart components (SalesChart)
├── pages/
│   ├── customer/     # Customer pages (Home, Products, ProductDetail, Cart, Checkout, OrderConfirmation, OrderHistory, Profile)
│   ├── admin/        # Admin pages (AdminLogin, AdminDashboard, AdminProducts, AdminCategories, AdminBrands, AdminOrders, AdminOrderDetail, AdminCustomers)
│   └── auth/         # Auth pages (AuthCallback for email verification)
├── context/
│   ├── AuthContext.jsx    # Supabase auth + profile + guest cart merge
│   └── AppContext.jsx     # UI state (modals, toasts, mobile menus)
├── hooks/
│   ├── queries/      # TanStack Query hooks (useProducts, useOrders, useCart, useProfile, useAdmin, useCategories, useBrands)
│   ├── mutations/    # TanStack Mutation hooks (useAddToCart, useCreateOrder, useCreateProduct, useDeleteProduct, etc.)
│   └── useLocalStorage.js
├── lib/
│   └── supabase.js   # Supabase client with token refresh error handling
├── routes/
│   ├── AppRoutes.jsx         # All routes with lazy loading + Suspense
│   ├── AdminProtectedRoute.jsx
│   └── CustomerProtectedRoute.jsx
├── utils/
│   ├── auth.js         # Auth helpers
│   ├── formatters.js   # Currency, status formatting
│   ├── helpers.js      # getCategoryName, getBrandName
│   ├── validation.js   # Zod schemas
│   └── rateLimit.ts    # Edge Function rate limiting client
├── styles/
│   └── index.css       # Tailwind + custom utilities (gradients, buttons, inputs, cards, animations)
├── test/
│   └── api-verification.test.jsx  # 220 unit tests for all hooks/mutations
├── integration/
│   └── *.test.jsx      # Integration tests
├── e2e-tests/
│   └── *.spec.ts       # Playwright E2E tests (143 tests)
└── main.jsx            # Entry point with providers

supabase/
├── migration.sql           # Complete schema (tables, enums, indexes, RLS, triggers, RPCs)
├── functions/
│   └── rate-limit-auth/    # Edge Function for auth rate limiting
└── migrations/
    └── 20260806002418_add_order_items_insert_policy.sql

vercel.json                 # Vercel deployment config (SPA routing, headers, env vars)
```

## 🗄 Database Schema (Supabase)

### Core Tables
- **categories** — id (text PK), name, description
- **brands** — id (text PK), name, logo_url, description
- **products** — id (text PK), name, image_url, category_id (FK), brand_id (FK), price_cents, stock, status
- **user_profiles** — id (uuid PK, references auth.users), email, first_name, last_name, phone, role (customer/admin), address
- **orders** — id (uuid PK), user_id, customer info, shipping_address, totals, payment_method, status
- **order_items** — id (uuid PK), order_id, product_id, product snapshot, unit_price_cents, quantity
- **cart_items** — id (uuid PK), user_id, product_id, quantity (unique per user+product)

### Security (RLS)
- Public read: categories, brands, active products
- Admin full access: all tables (checked via `auth.jwt() ->> 'role' = 'admin'`)
- Users: own profile, orders, cart items

### Performance (RPC Functions)
- `get_admin_stats()` — single query for dashboard stats
- `get_admin_customers()` — customers with order aggregates

## ⚡ Key Features

### Customer Storefront
- **Home** — Hero, dynamic category grid (from DB), featured products, brand carousel
- **Products** — Infinite scroll, search, category/brand filters, sorting, URL-synced state
- **Product Detail** — Image gallery, thumbnails, description, related products, add to cart
- **Cart** — Guest (localStorage) + Authenticated (Supabase) with auto-merge on login
- **Checkout** — Form validation, 3 payment methods (COD, E-Wallet, Bank Transfer), totals calculation
- **Orders** — History, detail view, order confirmation
- **Profile** — Editable info, address management

### Admin Dashboard
- **Login** — Separate route (`/admin/login`) with rate limiting
- **Dashboard** — Stats cards, sales chart (Recharts), recent orders
- **Products** — Full CRUD, search/filter/pagination, image upload, price in PHP (stored as cents)
- **Categories** — CRUD, product counts, delete blocked if products exist
- **Brands** — CRUD with logo upload, product counts, delete blocked if products exist
- **Orders** — List with filters, detail view, status management (pending→confirmed→preparing→shipped→completed/cancelled)
- **Customers** — Aggregated list with order counts & total spend

### Security & Reliability
- **Auth Rate Limiting** — Edge Function (3 requests/15min per IP, lower than Supabase defaults)
- **Token Refresh Handling** — Suppresses 400 errors from useSession on tab wake
- **Guest Cart Merge** — Seamless localStorage → Supabase on login
- **Duplicate Submission Prevention** — React Query `mutationKey` + submission locks
- **Referential Integrity** — Admin deletion blocked for categories/brands/products with dependencies

## 📱 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Single column, hamburger menus, drawer filters, bottom-sheet modals |
| Tablet (640-1023px) | 2-col grids, collapsible admin sidebar |
| Desktop (≥1024px) | Full layouts, 3-4 col grids, persistent sidebar |

## 🧪 Quality Assurance

```bash
# Unit tests (220 tests)
npm test

# E2E tests (143 tests across 8 spec files)
npx playwright test --project=chromium

# Test categories:
# - admin-panel.spec.ts (13 tests) — admin login, CRUD, referential integrity, sign out
# - checkout-admin.spec.ts (9 tests) — form validation, COD/E-Wallet/Bank flows
# - checkout-final.spec.ts — full checkout with prefill
# - catalog.spec.ts — products listing, filters, sorting, detail, images
# - edge-cases.spec.ts — boundaries, rapid actions, network failures
# - test-cart-cleared.spec.ts, test-guest-cart.spec.ts, test-logout.spec.ts
# - browser-compatibility.spec.ts — cross-browser features
```

## 🌱 Getting Production Ready

### Supabase Setup
1. **Run migration**: Execute `supabase/migration.sql` in SQL Editor
2. **Deploy Edge Function**: `supabase functions deploy rate-limit-auth`
3. **Storage Buckets**: Create `product-images` (public) and `brand-logos` (public)
4. **Auth Settings**:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: include `/auth/callback`
   - Email templates configured

### Environment Variables (Vercel/Production)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1
```

### Vercel Deployment
```bash
npm run build
# Deploy dist/ folder - vercel.json handles SPA routing, headers, caching
```

## 📝 Key Files to Modify

| File | Purpose |
|------|---------|
| `supabase/migration.sql` | Database schema changes |
| `supabase/functions/rate-limit-auth/index.ts` | Rate limit adjustments |
| `src/utils/validations.js` | Form rules |
| `src/styles/index.css` | Theme tokens (CSS variables) |
| `src/hooks/queries/*.js` | Query logic |
| `src/hooks/mutations/useMutations.js` | Mutation logic |
| `vercel.json` | Deployment config |

## 📄 License

MIT License - Free for learning and commercial use.