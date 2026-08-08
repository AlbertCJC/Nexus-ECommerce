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

The app runs at `http://localhost:5173`

## 🔐 Authentication & Roles

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@nexus.com` | `admin123` | Full admin panel at `/admin/*` |
| **Customer** | `user@nexus.com` | `user123` | Customer storefront |

> **Note:** Demo credentials are seeded on first run. In production, use the registration flow or configure via Supabase Auth.

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

## 🔄 System Flow

### Customer Journey

```
1. LANDING (Home)
   ├── Hero section with CTA → Products
   ├── Featured categories (from DB)
   └── Featured products (quick access)

2. PRODUCT DISCOVERY (Products Page)
   ├── URL-synced filters (search, category, brand, sort)
   ├── Debounced search (300ms, no page refresh)
   ├── Skeleton loaders during fetch
   └── Responsive grid (1/2/3/4 columns)

3. PRODUCT DETAIL (/products/:id)
   ├── Image gallery with thumbnails
   ├── Full description + specs
   ├── Stock status badge
   ├── Add to Cart (toast confirmation)
   └── Related products

4. CART (/cart)
   ├── Quantity adjustment (+/-)
   ├── Persistent guest cart (localStorage)
   ├── Authenticated cart (Supabase synced)
   └── Proceed to Checkout

5. CHECKOUT (/checkout)
   ├── Shipping form (validated)
   ├── Order summary with totals
   ├── Payment methods: COD / E-Wallet / Bank Transfer
   └── Order confirmation page

6. ACCOUNT
   ├── /orders — Order history with status tracking
   ├── /profile — Edit info, change password
   └── Protected routes (require auth)
```

### Admin Journey

```
1. /admin/login → Auth gate (admin role required)

2. ADMIN DASHBOARD
   ├── Sales overview (Recharts area chart)
   ├── Revenue metrics cards
   ├── Recent orders table
   └── Quick actions

3. PRODUCT MANAGEMENT (/admin/products)
   ├── Full CRUD: Create, Read, Update, Delete
   ├── Image upload (Supabase Storage)
   ├── Stock management
   └── Category/Brand assignment

4. ORDER MANAGEMENT (/admin/orders)
   ├── All orders with filters
   ├── Status transitions (pending → processing → shipped → delivered)
   └── Order detail modal

5. CATEGORY & BRAND MANAGEMENT
   ├── Category CRUD with icons
   ├── Brand CRUD with logos
   └── Delete blocked if products exist
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE (PostgreSQL)                  │
├─────────────────────────────────────────────────────────────┤
│  Tables: users, products, categories, brands, orders,       │
│  order_items, cart_items (authenticated only)               │
│  RLS Policies: admin full access, customer own data only    │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ Supabase JS Client
                              │ (REST + Realtime)
              ┌───────────────┴───────────────┐
              ▼                               ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │  Guest (localStorage)│       │  Authenticated User   │
    │  Cart persisted     │         │  Cart from DB       │
    │  Synced on login    │         │  Realtime updates   │
    └─────────────────────┘         └─────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
              ┌─────────────────────────────┐
              │      React + TanStack Query │
              │  - Optimistic updates       │
              │  - Auto-refetch on mutate   │
              │  - Cache invalidation       │
              └─────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Guest-first cart** | Immediate shopping without signup friction; merges on auth |
| **URL-synced filters** | Shareable, bookmarkable product views; browser back/forward works |
| **Debounced search (300ms)** | Reduces API load; no full-page reloads |
| **TanStack Query** | Eliminates manual loading/error states; handles race conditions |
| **Supabase RLS** | Security at database level; no backend API to maintain |
| **CSS Variables + Tailwind** | Theming without runtime overhead; design tokens in one place |
| **Syne font** | Distinctive gaming/tech identity; variable weights for hierarchy |
| **44×44px touch targets** | Mobile accessibility compliance |

---

## 📄 License

MIT License - Free for learning and commercial use.