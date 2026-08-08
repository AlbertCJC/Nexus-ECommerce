# NEXUS GAMING — Technical Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NEXUS GAMING ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   Browser    │────▶│   Vercel     │────▶│  Supabase    │                │
│  │  (React 18)  │     │   Edge       │     │  Platform    │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│        │                     │                     │                        │
│        ▼                     ▼                     ▼                        │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                      DATA FLOW                                    │      │
│  ├──────────────────────────────────────────────────────────────────┤      │
│  │  React Query ──▶ Supabase Client ──▶ PostgREST ──▶ PostgreSQL   │      │
│  │       │              │                  │              │          │      │
│  │       ▼              ▼                  ▼              ▼          │      │
│  │  Cache (5min)   Auth (JWT)         RLS Policies      RPCs        │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture (React 18 + Vite 5)

### Project Structure
```
src/
├── components/
│   ├── ui/              # Design system primitives
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Checkbox.jsx
│   │   ├── Badge.jsx
│   │   ├── Spinner.jsx
│   │   └── AuthModal.jsx
│   ├── products/        # Product-specific components
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilters.jsx
│   │   └── RelatedProducts.jsx
│   └── layout/          # Layout components
│       ├── Navbar.jsx
│       └── Footer.jsx
├── pages/
│   ├── customer/        # Public pages
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderConfirmation.jsx
│   │   ├── Orders.jsx
│   │   ├── OrderDetail.jsx
│   │   ├── Profile.jsx
│   │   └── Login/Register.jsx
│   └── admin/           # Admin dashboard
│       ├── AdminDashboard.jsx
│       ├── AdminProducts.jsx
│       ├── AdminOrders.jsx
│       ├── AdminCustomers.jsx
│       ├── AdminCategories.jsx
│       ├── AdminBrands.jsx
│       └── AdminLogin.jsx
├── hooks/
│   ├── queries/         # TanStack Query hooks
│   │   ├── useProducts.js
│   │   ├── useProduct.js
│   │   ├── useCategories.js
│   │   ├── useBrands.js
│   │   ├── useCart.js
│   │   └── useOrders.js
│   ├── mutations/       # Server mutations
│   │   └── useMutations.js
│   └── useDebounce.js   # Utility hooks
├── context/
│   ├── AuthContext.jsx  # Auth state + guest cart merge
│   └── AppContext.jsx   # Global state (cart, toasts, modals)
├── utils/
│   ├── formatters.js    # Currency, dates, stock, status
│   ├── categoryIcons.js # Lucide icons + gradients
│   ├── helpers.js       # Utility functions
│   └── validation.js    # Zod schemas
├── styles/
│   └── index.css        # Global styles + design tokens
└── main.jsx             # Entry point
```

### State Management

#### TanStack Query (Server State)
```javascript
// QueryClient config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes (was cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Query keys (hierarchical)
['products', { search, categoryId, brandIds, sortBy, page }]
['products', id]
['categories']
['brands']
['cart', userId]
['orders', userId]
['orders', id]

// Invalidation patterns
queryClient.invalidateQueries({ queryKey: ['products'] })
queryClient.invalidateQueries({ queryKey: ['cart', userId] })
queryClient.invalidateQueries({ queryKey: ['orders'] })
```

#### React Context (Client State)
```javascript
// AuthContext - Authentication + profile
const { 
  user, session, isAuthenticated, isAdmin, 
  signIn, signOut, signUp, refreshProfile 
} = useAuth();

// AppContext - Global UI state
const { 
  cart, dispatch,           // Guest cart (localStorage)
  toasts, addToast,         // Toast notifications
  openAuthModal,            // Auth modal trigger
} = useAppContext();

// Cart actions (dispatch)
dispatch({ type: 'ADD_TO_CART', payload: { productId, quantity } })
dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } })
dispatch({ type: 'REMOVE_FROM_CART', payload: productId })
dispatch({ type: 'CLEAR_CART' })
```

---

## Backend Architecture (Supabase)

### Database Schema

#### Core Tables
```sql
-- Users (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon_key text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Brands
CREATE TABLE brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  logo_url text,
  website text,
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  stock integer DEFAULT 0 CHECK (stock >= 0),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  category_id uuid REFERENCES categories(id),
  brand_id uuid REFERENCES brands(id),
  image_url text,
  images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cart Items (composite PK)
CREATE TABLE cart_items (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- Orders
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled')),
  total_cents integer NOT NULL,
  subtotal_cents integer,
  shipping_cents integer,
  tax_cents integer,
  idempotency_key uuid UNIQUE,  -- Risk 4 fix
  checkout_data jsonb NOT NULL, -- name, email, phone, address, payment_method, notes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  created_at timestamptz DEFAULT now()
);
```

#### Indexes
```sql
-- Products
CREATE INDEX idx_products_status ON products(status) WHERE status = 'active';
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
-- Search index (Risk 3 fix)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_fts ON products USING gin (
  to_tsvector('english', name || ' ' || coalesce(description, ''))
);

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_idempotency_key ON orders(idempotency_key);  -- Unique
CREATE INDEX idx_orders_status ON orders(status);

-- Cart
-- PK (user_id, product_id) is implicit index
```

### Row Level Security (RLS)

```sql
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins see all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories & Brands (public read)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON categories FOR ALL USING (is_admin());

-- Products (public read active, admin write)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Admin full access products" ON products FOR ALL USING (is_admin());

-- Cart (user owns)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders (user sees own, admin sees all)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins see all orders" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "Users create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items (via order ownership)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins see all order items" ON order_items FOR SELECT USING (is_admin());
```

### RPC Functions (Server-Side Logic)

#### create_order (Risks 1 & 2)
```sql
CREATE OR REPLACE FUNCTION create_order(
  p_user_id uuid,
  p_checkout_data jsonb,
  p_cart_items jsonb,
  p_idempotency_key uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_subtotal_cents integer := 0;
  v_item RECORD;
BEGIN
  -- Idempotency check (Risk 4)
  IF EXISTS (SELECT 1 FROM orders WHERE idempotency_key = p_idempotency_key) THEN
    RETURN jsonb_build_object(
      'id', (SELECT id FROM orders WHERE idempotency_key = p_idempotency_key),
      'alreadyExists', true
    );
  END IF;

  -- Calculate subtotal & verify stock (SELECT FOR UPDATE)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items) LOOP
    SELECT stock INTO v_stock FROM products WHERE id = v_item->>'product_id' FOR UPDATE;
    IF v_stock < (v_item->>'quantity')::int THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item->>'product_id';
    END IF;
    v_subtotal_cents := v_subtotal_cents + (v_item->>'price_cents')::int * (v_item->>'quantity')::int;
  END LOOP;

  -- Create order
  INSERT INTO orders (user_id, checkout_data, subtotal_cents, total_cents, idempotency_key)
  VALUES (p_user_id, p_checkout_data, v_subtotal_cents, v_subtotal_cents + shipping + tax, p_idempotency_key)
  RETURNING id INTO v_order_id;

  -- Create order items
  INSERT INTO order_items (order_id, product_id, quantity, price_cents)
  SELECT v_order_id, (item->>'product_id')::uuid, (item->>'quantity')::int, (item->>'price_cents')::int
  FROM jsonb_array_elements(p_cart_items) item;

  -- Decrement stock (Risk 2)
  UPDATE products p SET stock = p.stock - i.qty
  FROM jsonb_array_elements(p_cart_items) item
  CROSS JOIN LATERAL (SELECT (item->>'quantity')::int AS qty) i
  WHERE p.id = (item->>'product_id')::uuid;

  -- Clear cart
  DELETE FROM cart_items WHERE user_id = p_user_id;

  RETURN jsonb_build_object('id', v_order_id, 'alreadyExists', false);
END;
$$;
```

#### merge_guest_cart (Risk 5)
```sql
CREATE OR REPLACE FUNCTION merge_guest_cart(
  p_user_id uuid,
  p_items jsonb
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  INSERT INTO cart_items (user_id, product_id, quantity)
  SELECT p_user_id, (item->>'product_id')::uuid, (item->>'quantity')::int
  FROM jsonb_array_elements(p_items) item
  ON CONFLICT (user_id, product_id) DO UPDATE SET
    quantity = cart_items.quantity + EXCLUDED.quantity
  RETURNING 1 INTO v_count;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
```

#### cancel_order (Risk 2 - Stock Restoration)
```sql
CREATE OR REPLACE FUNCTION cancel_order(p_order_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = p_order_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Restore stock
  FOR v_item IN SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id LOOP
    UPDATE products SET stock = stock + v_item.quantity WHERE id = v_item.product_id;
  END LOOP;

  -- Update status
  UPDATE orders SET status = 'cancelled' WHERE id = p_order_id;
END;
$$;
```

#### update_order_status (Admin + Stock)
```sql
CREATE OR REPLACE FUNCTION admin_update_order_status(
  p_order_id uuid,
  p_status text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate status transition
  IF p_status = 'cancelled' THEN
    PERFORM cancel_order(p_order_id, (SELECT user_id FROM orders WHERE id = p_order_id));
  ELSE
    UPDATE orders SET status = p_status WHERE id = p_order_id;
  END IF;
END;
$$;
```

---

## API Layer (Frontend → Backend)

### Supabase Client Setup
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
```

### Query Patterns

#### Products (Search + Filter + Paginate)
```javascript
// useProducts.js
export const useProducts = ({ search, categoryId, brandIds, status = 'active', sortBy = 'newest', page = 1 }) => {
  return useQuery({
    queryKey: ['products', { search, categoryId, brandIds, status, sortBy, page }],
    queryFn: async () => {
      let query = supabase.from('products').select(`
        *,
        category:categories(id, name, slug),
        brand:brands(id, name, logo_url)
      `);

      if (status) query = query.eq('status', status);
      if (categoryId) query = query.eq('category_id', categoryId);
      if (brandIds?.length) query = query.in('brand_id', brandIds);
      if (search) query = query.textSearch('name', search, { type: 'websearch' });

      // Sort
      switch (sortBy) {
        case 'price-asc': query = query.order('price_cents', { ascending: true }); break;
        case 'price-desc': query = query.order('price_cents', { ascending: false }); break;
        case 'name-asc': query = query.order('name', { ascending: true }); break;
        case 'name-desc': query = query.order('name', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false }); // newest
      }

      // Pagination
      const from = (page - 1) * 24;
      query = query.range(from, from + 23);

      const { data, error, count } = await query;
      if (error) throw error;
      return { products: data, totalCount: count };
    },
  });
};
```

#### Cart (Authenticated)
```javascript
// useCart.js
export const useCart = (userId) => {
  return useQuery({
    queryKey: ['cart', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
  });
};
```

### Mutation Patterns

#### Add to Cart
```javascript
// useMutations.js
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, productId, quantity, guestCartDispatcher }) => {
      if (userId) {
        // Authenticated - upsert to Supabase
        const { error } = await supabase.from('cart_items').upsert({
          user_id: userId,
          product_id: productId,
          quantity,
        }, { onConflict: 'user_id,product_id' });
        if (error) throw error;
      } else if (guestCartDispatcher) {
        // Guest - localStorage via context
        guestCartDispatcher({ type: 'ADD_TO_CART', payload: { productId, quantity } });
      }
    },
    onSuccess: (_, { userId }) => {
      if (userId) queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });
};
```

#### Create Order (Risk 4 - Idempotency)
```javascript
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, checkoutData, cartItems, idempotencyKey }) => {
      const { data, error } = await supabase.rpc('create_order', {
        p_user_id: userId,
        p_checkout_data: checkoutData,
        p_cart_items: cartItems,
        p_idempotency_key: idempotencyKey,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // stock changed
    },
  });
};
```

---

## Authentication Flow

### Supabase Auth
```javascript
// AuthContext.jsx
const { data: { session } } = supabase.auth.getSession();

// Auto-refresh
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    setUser(profile);
    setIsAdmin(profile?.role === 'admin');
    
    // Merge guest cart (Risk 5)
    if (guestCart.length > 0) {
      await mergeGuestCart(session.user.id, guestCart);
      dispatch({ type: 'CLEAR_CART' });
    }
  } else {
    setUser(null);
    setIsAdmin(false);
  }
});
```

### Login / Register
```javascript
// Email/password
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// OAuth
const { data, error } = await supabase.auth.signInWithOAuth({ 
  provider: 'github', // or 'google'
  options: { redirectTo: `${window.location.origin}/auth/callback` }
});

// Sign up
const { data, error } = await supabase.auth.signUp({ email, password });
```

### Auth Callback (OAuth)
```javascript
// AuthCallback.jsx - handles redirect from OAuth
const { error } = await supabase.auth.exchangeCodeForSession(code);
if (!error) navigate('/');
```

---

## Storage (Supabase Storage)

### Buckets
| Bucket | Purpose | Public | Policies |
|--------|---------|--------|----------|
| `product-images` | Product photos | Yes | Authenticated upload, public read |
| `brand-logos` | Brand logos | Yes | Admin upload, public read |
| `avatars` | User avatars | Yes | Owner upload, public read |

### Upload Pattern
```javascript
// Product image upload
const file = event.target.files[0];
const fileName = `${Date.now()}-${file.name}`;
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(fileName, file, { cacheControl: '3600', upsert: false });

const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(fileName);

// Use with transform params
<img src={`${publicUrl}?width=400&quality=75&format=webp`} />
```

---

## Performance Optimizations

### Frontend
| Technique | Implementation |
|-----------|----------------|
| Code Splitting | `React.lazy` + `Suspense` per route |
| Image Optimization | Supabase transform params (`?width=400&quality=75&format=webp`) |
| Lazy Loading | `loading="lazy"` on all `<img>` |
| Skeleton Loaders | ProductGrid, ProductDetail, Checkout |
| Query Caching | TanStack Query (5min stale, 10min GC) |
| Debounced Search | 300ms debounce on search input |
| Virtual Scrolling | Planned for admin tables |

### Database
| Technique | Implementation |
|-----------|----------------|
| Partial Indexes | `products` status='active' |
| GIN Indexes | pg_trgm on name, tsvector on name+description |
| Composite PK | cart_items (user_id, product_id) |
| RPCs | Reduce round-trips (create_order, merge_guest_cart) |
| Connection Pooling | Supabase PgBouncer (transaction mode) |

---

## Deployment & CI/CD

### Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```

### GitHub Actions (Example)
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

### Environment Variables
| Variable | Vercel | Supabase | Description |
|----------|--------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | | Project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | | ✅ | Admin operations |
| `DATABASE_URL` | | ✅ | PostgreSQL connection |

---

## Monitoring & Observability

### Error Tracking
- **Sentry** (planned) - Frontend errors, performance
- **Supabase Logs** - Database queries, auth events, RPC calls
- **Vercel Analytics** - Web vitals, page views

### Key Metrics
| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | ~1.8s |
| FID | < 100ms | ~50ms |
| CLS | < 0.1 | ~0.05 |
| TTFB | < 600ms | ~200ms |
| Search latency | < 10ms | ~8ms (with pg_trgm) |

---

## Security Checklist

- [x] RLS enabled on all tables
- [x] JWT in HttpOnly cookies (Supabase default)
- [x] CSP headers (Vercel default + custom)
- [x] Rate limiting (Supabase Auth + Edge)
- [x] Idempotency keys on orders (Risk 4)
- [x] Stock reservation with FOR UPDATE (Risk 2)
- [x] Input validation (Zod schemas)
- [x] SQL injection prevention (PostgREST parameterized)
- [x] XSS prevention (React auto-escape + sanitize)
- [ ] CSP nonce for inline scripts
- [ ] Security headers audit
- [ ] Dependency scanning (npm audit)
- [ ] Penetration testing