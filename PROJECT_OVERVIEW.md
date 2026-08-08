# NEXUS GAMING — Project Overview

## Executive Summary

**NEXUS GAMING** is a production-ready e-commerce platform for premium gaming peripherals (mice, keyboards, headsets, monitors, laptops, components, accessories). Built with modern React architecture, Supabase backend, and a distinctive dark gaming aesthetic.

**Status**: Production-deployed on Vercel with Supabase (PostgreSQL, Auth, Storage, RLS)
**Stack**: React 18 + Vite 5 + TanStack Query v5 + Supabase + Tailwind CSS
**Primary Goal**: High-performance, accessible, scalable gaming gear store

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXUS GAMING                              │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React 18 + Vite 5)                                   │
│  ├── Pages: Home, Products, ProductDetail, Cart, Checkout       │
│  ├── Components: ProductCard, ProductGrid, ProductFilters       │
│  ├── UI System: Button, Card, Modal, Toast, Input, Select       │
│  ├── State: TanStack Query (server) + Context (auth, cart)      │
│  └── Styling: Tailwind CSS + CSS Custom Properties (Design Tokens)│
├─────────────────────────────────────────────────────────────────┤
│  Backend (Supabase)                                             │
│  ├── PostgreSQL: products, orders, cart_items, categories, brands│
│  ├── Auth: Email/password + OAuth (GitHub, Google)              │
│  ├── Storage: Product images, brand logos                       │
│  ├── RLS: Row Level Security on all tables                      │
│  └── RPCs: create_order, merge_guest_cart, cancel_order         │
├─────────────────────────────────────────────────────────────────┤
│  Infrastructure                                                  │
│  ├── Hosting: Vercel (edge functions, ISR)                     │
│  ├── Database: Supabase (managed PostgreSQL)                   │
│  ├── CDN: Supabase Storage + Vercel Edge                       │
│  └── CI/CD: GitHub Actions → Vercel Preview → Production       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### Customer-Facing
- **Home Page**: Hero banner, feature highlights, category grid, featured products, brand showcase
- **Product Catalog**: Search, filter (category, brand, price), sort, infinite scroll pagination
- **Product Detail**: Image gallery, quantity selector, add to cart, related products
- **Shopping Cart**: Persistent (localStorage for guests, Supabase for authenticated), quantity updates
- **Checkout**: Multi-step form, shipping calculation, tax, payment methods (COD, E-Wallet, Bank Transfer), idempotency protection
- **Orders**: Order history, confirmation page, status tracking
- **Authentication**: Login/register, OAuth, guest checkout with cart merge on login
- **Profile**: Address management, order history, settings

### Admin Dashboard
- **Products CRUD**: Create, edit, delete, bulk actions, image upload
- **Orders Management**: View, update status (pending→confirmed→preparing→shipped→completed/cancelled)
- **Categories & Brands**: Full CRUD with icons and gradients
- **Customers**: View users, order history, metrics
- **Analytics**: Revenue, orders, conversion funnels

---

## Design System

### Color Palette (CSS Custom Properties)
```css
/* Backgrounds */
--bg-deep: 2, 6, 23;           /* Deepest background */
--bg-base: 15, 23, 42;         /* Main background */
--bg-elevated: 30, 41, 59;     /* Cards, modals */
--bg-hover: 51, 65, 85;        /* Hover states */
--bg-card: 30, 41, 59;         /* Card backgrounds */

/* Accents */
--accent-primary: 6, 182, 212;      /* Cyan - primary brand */
--accent-primary-glow: 34, 211, 238;
--accent-primary-dim: 8, 145, 178;

--accent-secondary: 168, 85, 247;   /* Purple - secondary */
--accent-secondary-glow: 192, 132, 252;

/* Semantic */
--accent-success: 34, 197, 94;
--accent-warning: 245, 158, 11;
--accent-danger: 239, 68, 68;
--accent-info: 99, 102, 241;

/* Text */
--text-primary: 248, 250, 252;
--text-secondary: 148, 163, 184;
--text-muted: 100, 116, 139;

/* Borders */
--border-subtle: 51, 65, 85;
--border-hover: 71, 85, 105;
--border-focus: 6, 182, 212;
```

### Typography Scale (Tailwind + Fluid)
| Token | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `display` | clamp(2.5rem, 5vw, 4rem) | 1.1 | Hero headlines |
| `h1` | clamp(2rem, 4vw, 3rem) | 1.2 | Page titles |
| `h2` | clamp(1.5rem, 3vw, 2.25rem) | 1.25 | Section headers |
| `h3` | clamp(1.25rem, 2.5vw, 1.5rem) | 1.3 | Card titles |
| `body-lg` | 1.125rem | 1.6 | Lead text |
| `body` | 1rem | 1.6 | Body copy |
| `body-sm` | 0.875rem | 1.5 | Secondary text |
| `caption` | 0.75rem | 1.5 | Labels, hints |

### Motion System
| Token | Duration | Easing | Use Case |
|-------|----------|--------|----------|
| `fast` | 150ms | smooth | Color transitions |
| `normal` | 250ms | smooth (cubic-bezier(0.16, 1, 0.3, 1)) | Standard interactions |
| `slow` | 400ms | spring (cubic-bezier(0.34, 1.56, 0.64, 1)) | Modals, drawers |

### Shadow Scale
- `sm` - Subtle elevation
- `md` - Default cards
- `lg` - Elevated panels
- `xl` - Modals
- `glow` - Primary accent glow
- `card` / `card-hover` - Product cards

---

## 5 Critical Production Risks — RESOLVED

| Risk | Severity | Solution | File |
|------|----------|----------|------|
| **1. Non-transactional order creation** | 🔴 Critical | PostgreSQL `create_order` RPC with BEGIN/COMMIT | `supabase/migrations/20260808_create_order_rpc.sql` |
| **2. No stock reservation/decrement** | 🔴 Critical | `SELECT ... FOR UPDATE` in RPC + cancellation restoration | `useMutations.js`, RPC |
| **3. Missing full-text search index** | 🟡 High | pg_trgm GIN index + `websearch_to_tsquery` | `supabase/migrations/20260808_search_trgm_index.sql` |
| **4. Client-only submission lock** | 🟡 High | Server-side idempotency key (UUID + unique constraint) | `Checkout.jsx`, `orders` table |
| **5. Guest cart merge N+1 queries** | 🟢 Medium | `merge_guest_cart` RPC with single upsert | `AuthContext.jsx`, RPC |

---

## Data Model (Key Tables)

### Products
```sql
products (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  stock integer DEFAULT 0,
  status text CHECK (status IN ('active','inactive','out_of_stock')),
  category_id uuid REFERENCES categories(id),
  brand_id uuid REFERENCES brands(id),
  image_url text,
  created_at timestamptz DEFAULT now()
)
```

### Orders
```sql
orders (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',
  total_cents integer NOT NULL,
  subtotal_cents integer,
  shipping_cents integer,
  tax_cents integer,
  idempotency_key uuid UNIQUE,  -- Risk 4 fix
  checkout_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
)
```

### Order Items
```sql
order_items (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  price_cents integer NOT NULL
)
```

### Cart Items
```sql
cart_items (
  user_id uuid REFERENCES auth.users(id),
  product_id uuid REFERENCES products(id),
  quantity integer DEFAULT 1,
  PRIMARY KEY (user_id, product_id)
)
```

---

## API / Query Layer

### TanStack Query Hooks (`src/hooks/queries/`)
| Hook | Purpose | Invalidation |
|------|---------|--------------|
| `useProducts` | Search, filter, paginate products | `['products']` |
| `useProduct` | Single product detail | `['products', id]` |
| `useCategories` | Category list for filters/nav | `['categories']` |
| `useBrands` | Brand list for filters | `['brands']` |
| `useCart` | Authenticated user's cart | `['cart', userId]` |
| `useOrders` | User order history | `['orders', userId]` |
| `useOrder` | Single order detail | `['orders', id]` |

### Mutations (`src/hooks/mutations/useMutations.js`)
| Mutation | RPC Call | Invalidation |
|----------|----------|--------------|
| `useCreateOrder` | `create_order` | orders, cart, products |
| `useUpdateOrderStatus` | `update_order_status` + stock restore | orders, products |
| `useAddToCart` | INSERT cart_items | cart |
| `useUpdateCartQuantity` | UPDATE cart_items | cart |
| `useRemoveFromCart` | DELETE cart_items | cart |
| `useMergeGuestCart` | `merge_guest_cart` | cart |

---

## Security

### Authentication
- Supabase Auth (email/password + OAuth)
- JWT in HttpOnly cookies
- Auto-refresh via `onAuthStateChange`
- Role-based access: `isAdmin` from user metadata

### Row Level Security (RLS)
```sql
-- Products: public read, admin write
CREATE POLICY "Public read active products" ON products
  FOR SELECT USING (status = 'active');

-- Orders: users see own, admins see all
CREATE POLICY "Users see own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Cart: users manage own
CREATE POLICY "Users manage own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);
```

### Idempotency (Risk 4)
```sql
-- Unique constraint prevents duplicate orders
ALTER TABLE orders ADD COLUMN idempotency_key uuid UNIQUE;

-- RPC checks and returns existing order
CREATE FUNCTION create_order(...) RETURNS jsonb AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM orders WHERE idempotency_key = p_key) THEN
    RETURN jsonb_build_object('id', id, 'alreadyExists', true);
  END IF;
  -- ... create order
END;
$$;
```

---

## Performance Optimizations

### Frontend
- **Code Splitting**: Route-based (`React.lazy` + `Suspense`)
- **Image Optimization**: Supabase transform params (`?width=400&quality=75&format=webp`)
- **Lazy Loading**: `loading="lazy"` on all product images
- **Skeleton Loaders**: Product grid, product detail, checkout
- **Debounced Search**: 300ms debounce on search input
- **Query Caching**: TanStack Query (5min stale, 10min garbage collection)

### Database
- **Indexes**: 
  - `products.status` (partial for 'active')
  - `products.category_id`
  - `products.brand_id`
  - `products.name` (pg_trgm GIN for search)
  - `cart_items(user_id, product_id)` PK
  - `orders.user_id`, `orders.idempotency_key` UNIQUE
- **RPCs**: Reduce round-trips (create_order, merge_guest_cart)

---

## Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
1. Push to feature branch
2. GitHub Actions: lint → test → typecheck → build
3. Vercel Preview Deployment (auto on PR)
4. Code review + approval
5. Merge to master
6. Vercel Production Deployment (auto on master)
7. Supabase migrations (manual via CLI or included in build)
```

### Environment Variables (Vercel + Supabase)
| Variable | Scope | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Build + Runtime | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Build + Runtime | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin operations |
| `DATABASE_URL` | Supabase | PostgreSQL connection |

---

## Testing Strategy

| Level | Tool | Coverage |
|-------|------|----------|
| Unit | Vitest | Formatters, hooks, utilities (220 tests) |
| Integration | Vitest + MSW | Auth flow, cart operations, mutations |
| E2E | Playwright | Checkout, auth, cart merge, admin CRUD |
| Visual | Chromatic (planned) | Component stories |

**Run Commands**:
```bash
npm test           # Unit + integration
npx playwright test # E2E
npm run build      # TypeScript + production build
```

---

## Recent Improvements (Latest Session)

1. **Fixed layout-shift bug** — Removed `transform: translateY(-4px)` from `.card:hover` that pushed entire grid
2. **Migrated to unified design token system** — 40+ hardcoded Tailwind colors → CSS custom properties + Tailwind tokens
3. **Extended Tailwind config** — 60+ tokens (colors, spacing, typography, transitions, shadows, gradients)
4. **Category gradients tokenized** — 7 hardcoded gradients → `bg-grad-cat-*` utilities
5. **Order status badges unified** — Semantic colors using design tokens
6. **Build verified** — 10.6s, no regressions, CSS reduced from 53kB → 48kB

---

## Roadmap

### Phase 1: Quality (Current)
- [x] Fix 5 production risks
- [x] Design token migration
- [ ] Full accessibility audit (WCAG AA)
- [ ] Performance budget enforcement

### Phase 2: Scale
- [ ] Infinite scroll + cursor pagination
- [ ] Category counts RPC (replace client-side reduce)
- [ ] Cache persistence (localStorage for categories/brands)
- [ ] Image optimization (WebP/AVIF, responsive srcset)

### Phase 3: Features
- [ ] Wishlist / favorites
- [ ] Product reviews & ratings
- [ ] Recommendations engine
- [ ] Loyalty program

### Phase 4: Platform
- [ ] Multi-currency / i18n
- [ ] PWA support
- [ ] Admin analytics dashboard
- [ ] Webhook integrations (shipping, accounting)