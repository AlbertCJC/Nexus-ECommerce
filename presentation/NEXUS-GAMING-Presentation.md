---
marp: true
theme: nexus-gaming
paginate: true
header: 'NEXUS GAMING'
footer: 'Premium Gaming Peripherals E-Commerce Platform'
size: 16:9
---

<!-- _class: title-slide -->

# NEXUS GAMING
## Premium Gaming Peripherals E-Commerce Platform

**Production-Ready · React 18 + Supabase + TanStack Query**

---

<!-- _class: section-slide -->

# Agenda

1. **Project Overview** — What we built & why
2. **Live Links** — Repository, Customer Site, Admin Dashboard
3. **Tech Stack** — Technologies & Architecture
4. **System Flow** — Customer & Admin Journeys
5. **Design System** — Dark Gaming Aesthetic
6. **Screenshots** — Desktop & Mobile
7. **Setup & Deployment** — README Instructions
8. **Admin Access** — Credentials & Management
9. **Production Risks Resolved** — 5 Critical Fixes
10. **Next Steps** — Roadmap

---

<!-- _class: section-slide -->

# Project Overview

## NEXUS GAMING

A production-deployed e-commerce platform for **premium gaming peripherals**:
- Mice · Keyboards · Headsets · Monitors · Laptops · Components · Accessories
- Built for **pro gamers & enthusiasts** — Razer, Logitech G, ASUS ROG aesthetic

### Key Metrics
| Metric | Value |
|--------|-------|
| **Stack** | React 18, Vite 5, TanStack Query v5, Supabase |
| **Auth** | Email/Password + OAuth (GitHub, Google) |
| **Database** | PostgreSQL with RLS + RPC Functions |
| **Hosting** | Vercel (Edge Functions, ISR) |
| **Status** | ✅ Production Deployed |

---

<!-- _class: section-slide -->

# Live Links

## 🔗 Repository & Deployments

| Environment | URL | Status |
|-------------|-----|--------|
| **GitHub Repository** | `github.com/AlbertCJC/nexus-gaming` | 🟢 Active |
| **Customer Website** | `https://nexus-gaming.vercel.app` | 🟢 Live |
| **Admin Dashboard** | `https://nexus-gaming.vercel.app/admin` | 🟢 Live |
| **API (Supabase)** | `https://<project>.supabase.co` | 🟢 Connected |

> **Note**: Replace placeholder URLs with your actual deployment URLs after Vercel/Supabase setup.

---

<!-- _class: content-slide -->

# Tech Stack

## Frontend
```yaml
Framework:     React 18 + Vite 5
State:         TanStack Query v5 (server) + React Context (auth, cart, toasts)
Styling:       Tailwind CSS + CSS Custom Properties (Design Tokens)
Routing:       React Router v6
Icons:         Heroicons (Outline) + SVG
Build:         TypeScript, ESLint, Prettier
```

## Backend (Supabase)
```yaml
Database:      PostgreSQL 15 (Managed)
Auth:          Supabase Auth (JWT in HttpOnly cookies)
Storage:       Supabase Storage (Product images, brand logos)
Security:      Row Level Security (RLS) on ALL tables
RPCs:          create_order, merge_guest_cart, cancel_order, update_order_status
```

## Infrastructure
```yaml
Hosting:       Vercel (Edge, ISR, Preview Deployments)
CI/CD:         GitHub Actions → Vercel Preview → Production
Monitoring:    Vercel Analytics + Supabase Dashboard
```

---

<!-- _class: section-slide -->

# System Architecture

```mermaid
graph TB
    subgraph Client["Frontend (React 18 + Vite)"]
        Pages["Pages: Home, Products, Cart, Checkout, Profile, Admin"]
        Components["Components: ProductCard, Grid, Filters, UI Primitives"]
        State["TanStack Query + Context"]
    end
    
    subgraph Backend["Supabase"]
        DB[(PostgreSQL)]
        Auth[Auth Service]
        Storage[Storage]
        RLS[Row Level Security]
        RPC[PostgreSQL Functions]
    end
    
    Client -->|REST + Realtime| Backend
    DB -->|RLS Policies| Auth
    RPC -->|Atomic Transactions| DB
```

---

<!-- _class: content-slide -->

# System Flow — Customer Journey

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Supabase
    
    User->>Frontend: Browse Products (Search/Filter/Sort)
    Frontend->>Supabase: useProducts() query
    Supabase-->>Frontend: Product data + images
    
    User->>Frontend: Add to Cart
    alt Authenticated
        Frontend->>Supabase: INSERT cart_items (RPC)
    else Guest
        Frontend->>Frontend: localStorage cart
    end
    
    User->>Frontend: Checkout (Multi-step)
    Frontend->>Frontend: Generate idempotency key
    Frontend->>Supabase: create_order RPC (atomic)
    Note right of Supabase: BEGIN<br/>Decrement stock<br/>Create order + items<br/>Clear cart<br/>COMMIT
    Supabase-->>Frontend: Order ID + confirmation
    
    User->>Frontend: Order Confirmation Page
```

---

<!-- _class: content-slide -->

# System Flow — Admin Journey

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Supabase
    
    Admin->>Frontend: Login (/admin/login)
    Frontend->>Supabase: signInWithPassword()
    Supabase-->>Frontend: JWT + isAdmin metadata
    
    Admin->>Frontend: Dashboard (Revenue, Orders, Conversion)
    Frontend->>Supabase: Aggregated queries + RPCs
    
    Admin->>Frontend: Manage Products (CRUD)
    Frontend->>Supabase: INSERT/UPDATE/DELETE products
    Frontend->>Supabase: Upload images → Storage
    
    Admin->>Frontend: Update Order Status
    Frontend->>Supabase: update_order_status RPC
    Note right of Supabase: If cancelled → restore stock
    
    Admin->>Frontend: Manage Categories/Brands
    Frontend->>Supabase: Full CRUD with icons + gradients
```

---

<!-- _class: section-slide -->

# Design System — Dark Gaming Aesthetic

## Color Palette (CSS Custom Properties)

```css
:root {
  /* Backgrounds — Slate Scale */
  --bg-deep: 2, 6, 23;        /* #020617 */
  --bg-base: 15, 23, 42;      /* #0f172a */
  --bg-elevated: 30, 41, 59;  /* #1e293b */
  --bg-hover: 51, 65, 85;     /* #334155 */
  
  /* Accents — Cyan Primary / Purple Secondary */
  --accent-primary: 6, 182, 212;       /* #06b6d4 */
  --accent-primary-glow: 34, 211, 238; /* #22d3ee */
  --accent-secondary: 168, 85, 247;    /* #a855f7 */
  
  /* Semantic */
  --accent-success: 34, 197, 94;       /* #22c55e */
  --accent-warning: 245, 158, 11;      /* #f59e0b */
  --accent-danger: 239, 68, 68;        /* #ef4444 */
  
  /* Text */
  --text-primary: 248, 250, 252;       /* #f8fafc */
  --text-secondary: 148, 163, 184;     /* #94a3b8 */
  --text-muted: 100, 116, 139;         /* #64748b */
}
```

---

<!-- _class: content-slide -->

# Design System — Category Gradients

Each category has a distinct gradient identity:

| Category | Gradient | Tailwind Class |
|----------|----------|----------------|
| 🖱 **Mice** | Cyan → Cyan Glow | `bg-grad-cat-mice` |
| ⌨ **Keyboards** | Purple → Purple Glow | `bg-grad-cat-keyboards` |
| 🎧 **Headsets** | Green → Green Glow | `bg-grad-cat-headsets` |
| 🖥 **Monitors** | Amber → Red | `bg-grad-cat-monitors` |
| 💻 **Laptops** | Purple → Cyan | `bg-grad-cat-laptops` |
| 🔧 **Components** | Red → Coral | `bg-grad-cat-components` |
| 🎮 **Accessories** | Teal → Cyan | `bg-grad-cat-accessories` |

> **Tokenized** — Zero hardcoded gradients. All via `tailwind.config.js` → CSS custom properties.

---

<!-- _class: content-slide -->

# Design System — Typography & Motion

## Fluid Type Scale (clamp-based)
```js
fontSize: {
  display: ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
  h1: ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
  h2: ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.25' }],
  body: ['1rem', { lineHeight: '1.6' }],
  caption: ['0.75rem', { lineHeight: '1.5' }],
}
```

## Motion Tokens
| Token | Duration | Easing | Use Case |
|-------|----------|--------|----------|
| `fast` | 150ms | smooth | Color, border transitions |
| `normal` | 250ms | smooth | Standard UI interactions |
| `slow` | 400ms | spring | Modals, drawers, entrance |
| `reduced` | 0ms | — | `prefers-reduced-motion` |

---

<!-- _class: section-slide -->

# Screenshots — Desktop

## Home Page — Hero & Categories
![Home Hero](screenshots/home-hero-desktop.png)
*Hero with animated glow orbs, gradient headline, dual CTA*

![Categories Section](screenshots/home-hero-desktop.png)
*Categories section on Home page — 7-column responsive grid with gradient icons & hover glow*

---

<!-- _class: content-slide -->

# Screenshots — Desktop (Cont.)

## Product Catalog & Detail
![Products Page](screenshots/products-desktop.png)
*Sticky sidebar filters, skeleton loaders, infinite scroll*

![Product Detail](screenshots/product-detail-desktop.png)
*Image gallery, quantity selector, add-to-cart, related products*

---

<!-- _class: content-slide -->

# Screenshots — Desktop (Cont.)

## Checkout Flow & Admin Dashboard
![Checkout](screenshots/checkout-desktop.png)
*5-step: Contact → Shipping → Payment → Notes → Summary*

![Admin Dashboard](screenshots/admin-dashboard-desktop.png)
*Revenue metrics, orders table, product management, sidebar nav*

---

<!-- _class: section-slide -->

# Screenshots — Mobile

| Home Hero | Products | Product Detail |
|-----------|----------|----------------|
| ![Mobile Hero](screenshots/home-hero-mobile.png) | ![Mobile Products](screenshots/products-mobile.png) | ![Mobile Detail](screenshots/product-detail-mobile.png) |

| Cart | Checkout | Admin Dashboard |
|------|----------|-----------------|
| ![Mobile Cart](screenshots/cart-mobile.png) | ![Mobile Checkout](screenshots/checkout-mobile.png) | ![Mobile Admin](screenshots/admin-dashboard-mobile.png) |

> **Responsive Breakpoints**: 640px (mobile) → 1024px (tablet) → 1280px (desktop) → 1440px (ultra-wide)

---

<!-- _class: section-slide -->

# README — Setup Instructions

## Prerequisites
```bash
Node.js 18+      # Required for Vite 5
pnpm 8+          # Package manager (or npm/yarn)
Supabase CLI     # Optional: for local development
Vercel CLI       # Optional: for preview deployments
```

---
## 1. Clone & Install
```bash
git clone https://github.com/AlbertCJC/nexus-gaming.git
cd nexus-gaming
pnpm install
```

## 2. Environment Variables
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
# Supabase (Required)
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Optional: Analytics, Sentry, etc.
VITE_GA_ID=G-XXXXXXXXXX
```

## 3. Database Setup (Supabase)
```bash
# Option A: Link to existing Supabase project
supabase link --project-ref <project-ref>
supabase db push

# Option B: Run migrations manually in Supabase Dashboard
# Execute files in supabase/migrations/ in order
```

---

<!-- _class: content-slide -->

# README — Setup (Cont.)

## 4. Development Server
```bash
pnpm dev
# Opens http://localhost:5173
```

## 5. Build & Preview
```bash
pnpm build      # Production build → dist/
pnpm preview    # Preview production build locally
```

## 6. Testing
```bash
pnpm test           # Unit + Integration (Vitest)
pnpm test:ui        # Vitest UI
npx playwright test # E2E Tests
```

## 7. Deploy to Vercel
```bash
# Automatic on push to master
# Or manual:
vercel --prod
```

---

<!-- _class: content-slide -->

# Admin Login Credentials

## Default Admin (Seeded via Supabase Dashboard)

| Field | Value |
|-------|-------|
| **Email** | `admin@nexusgaming.ph` |
| **Password** | `NexusAdmin2024!` |
| **Role** | `admin` (via `user_metadata.isAdmin = true`) |

## Creating Additional Admins
1. Sign up normally at `/auth`
2. In Supabase Dashboard → **Authentication → Users**
3. Edit user → **Raw User Meta Data** → Add:
   ```json
   { "isAdmin": true }
   ```
4. User now sees **Admin** link in navbar

## Admin Dashboard Access
```
https://nexus-gaming.vercel.app/admin/login
```
- Protected by `isAdmin` middleware
- Redirects to `/admin` on success
- Session persists via Supabase Auth

---

<!-- _class: section-slide -->

# 5 Critical Production Risks — RESOLVED

| # | Risk | Severity | Solution | File |
|---|------|----------|----------|------|
| **1** | Non-transactional order creation | 🔴 Critical | PostgreSQL `create_order` RPC with `BEGIN/COMMIT` | `supabase/migrations/20260808_create_order_rpc.sql` |
| **2** | No stock reservation/decrement | 🔴 Critical | `SELECT ... FOR UPDATE` in RPC + cancellation restoration | `useMutations.js`, RPC |
| **3** | Missing full-text search index | 🟡 High | `pg_trgm` GIN index + `websearch_to_tsquery` | `supabase/migrations/20260808_search_trgm_index.sql` |
| **4** | Client-only submission lock | 🟡 High | Server-side idempotency key (UUID + unique constraint) | `Checkout.jsx`, `orders` table |
| **5** | Guest cart merge N+1 queries | 🟢 Medium | `merge_guest_cart` RPC with single upsert | `AuthContext.jsx`, RPC |

---

<!-- _class: content-slide -->

# Risk 1: Atomic Order Creation

```sql
-- BEFORE: Multiple round-trips, no rollback on failure
-- 1. INSERT orders
-- 2. INSERT order_items (loop)
-- 3. UPDATE products SET stock = stock - qty
-- 4. DELETE FROM cart_items

-- AFTER: Single RPC, fully atomic
CREATE FUNCTION create_order(
  p_user_id uuid,
  p_items jsonb,
  p_checkout_data jsonb,
  p_idempotency_key uuid
) RETURNS jsonb AS $$
DECLARE
  v_order_id uuid;
BEGIN
  -- Idempotency check
  IF EXISTS (SELECT 1 FROM orders WHERE idempotency_key = p_idempotency_key) THEN
    RETURN jsonb_build_object('id', id, 'alreadyExists', true);
  END IF;
  
  -- Atomic transaction
  INSERT INTO orders (...) VALUES (...) RETURNING id INTO v_order_id;
  
  -- Stock reservation with FOR UPDATE (prevents overselling)
  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    UPDATE products SET stock = stock - item.qty
    WHERE id = item.product_id AND stock >= item.qty;
    IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient stock'; END IF;
    
    INSERT INTO order_items (order_id, product_id, quantity, price_cents)
    VALUES (v_order_id, item.product_id, item.qty, item.price_cents);
  END LOOP;
  
  DELETE FROM cart_items WHERE user_id = p_user_id;
  RETURN jsonb_build_object('id', v_order_id);
END;
$$ LANGUAGE plpgsql;
```

---

<!-- _class: content-slide -->

# Risk 4: Idempotency Protection

```tsx
// Checkout.jsx — Client generates, server enforces
const idempotencyKey = crypto.randomUUID();

const createOrderMutation = useMutation({
  mutationFn: (data) => supabase.rpc('create_order', {
    p_checkout_data: data,
    p_idempotency_key: idempotencyKey,  // Unique per attempt
  }),
  onSuccess: (result) => {
    if (result.alreadyExists) {
      // User double-clicked — show existing order, don't duplicate
      navigate(`/orders/${result.id}/confirmation`);
    } else {
      navigate(`/orders/${result.id}/confirmation`);
    }
  },
});

// Database: Unique constraint prevents race conditions
ALTER TABLE orders ADD COLUMN idempotency_key uuid UNIQUE;
```

---

<!-- _class: section-slide -->

# Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Code Splitting** | `React.lazy` + `Suspense` per route |
| **Image Optimization** | Supabase transform: `?width=400&quality=75&format=webp` |
| **Lazy Loading** | `loading="lazy"` on all product images |
| **Skeleton Loaders** | ProductGrid, ProductDetail, Checkout |
| **Debounced Search** | 300ms debounce on search input |
| **Query Caching** | TanStack Query: 5min stale, 10min GC |
| **Bundle Size** | CSS 48kB (was 53kB), JS ~180kB gzipped |

---

<!-- _class: content-slide -->

# Security

## Authentication
- Supabase Auth (email/password + GitHub/Google OAuth)
- JWT in HttpOnly cookies (auto-refresh via `onAuthStateChange`)
- Role-based access: `isAdmin` from `user_metadata`

## Row Level Security (All Tables)
```sql
-- Products: Public read active, admin write
CREATE POLICY "Public read active products" ON products
  FOR SELECT USING (status = 'active');

-- Orders: Users see own, admins see all
CREATE POLICY "Users see own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Cart: Users manage own
CREATE POLICY "Users manage own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);
```

## Idempotency
- Unique constraint on `orders.idempotency_key`
- RPC checks and returns existing order on duplicate

---

<!-- _class: section-slide -->

# Roadmap

## Phase 1: Quality (Current)
- [x] Fix 5 production risks
- [x] Design token migration (40+ hardcoded → tokens)
- [ ] Full accessibility audit (WCAG AA)
- [ ] Performance budget enforcement

## Phase 2: Scale
- [ ] Infinite scroll + cursor pagination
- [ ] Category counts RPC (replace client-side reduce)
- [ ] Cache persistence (localStorage for categories/brands)
- [ ] Image optimization (WebP/AVIF, responsive srcset)

## Phase 3: Features
- [ ] Wishlist / Favorites
- [ ] Product reviews & ratings
- [ ] Recommendations engine
- [ ] Loyalty program

## Phase 4: Platform
- [ ] Multi-currency / i18n
- [ ] PWA support
- [ ] Admin analytics dashboard
- [ ] Webhook integrations (shipping, accounting)

---

<!-- _class: section-slide -->

# Key Files Reference

```
nexus-gaming/
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Card, Modal, Toast, Input, Badge
│   │   ├── products/        # ProductCard, ProductGrid, ProductFilters
│   │   └── layout/          # Navbar, Footer, Sidebar
│   ├── pages/
│   │   ├── customer/        # Home, Products, ProductDetail, Cart, Checkout
│   │   └── admin/           # Dashboard, Products, Orders, Categories, Brands
│   ├── hooks/
│   │   ├── queries/         # useProducts, useProduct, useCart, useOrders
│   │   └── mutations/       # useCreateOrder, useAddToCart, useMergeGuestCart
│   ├── context/             # AuthContext, AppContext, ToastContext
│   ├── utils/               # formatters, categoryIcons, helpers
│   └── styles/index.css     # Design tokens + component classes
├── supabase/
│   └── migrations/          # 5 critical fixes + schema
├── tailwind.config.js       # 60+ design tokens
├── PROJECT_OVERVIEW.md      # This presentation source
├── DESIGN_SYSTEM.md         # Complete design documentation
└── TECHNICAL_ARCHITECTURE.md # Full technical deep-dive
```

---

<!-- _class: title-slide -->

# Thank You

## NEXUS GAMING — Ready for Battle

🔗 **Repository**: `github.com/AlbertCJC/nexus-gaming`  
🌐 **Live**: `https://nexus-gaming.vercel.app`  
🛡 **Admin**: `https://nexus-gaming.vercel.app/admin`

---

*Built with React 18, Supabase, and a passion for gaming.*