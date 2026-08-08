# Setup Guide — NEXUS Gaming E-Commerce

Complete step-by-step instructions to get the application running locally and deployed to production.

---

## 1. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **npm** | 9+ | Included with Node.js |
| **Git** | Latest | [git-scm.com](https://git-scm.com) |
| **Supabase CLI** | Latest | `npm i -g supabase` |

---

## 2. Local Development Setup

### 2.1 Clone & Install

```bash
git clone https://github.com/AlbertCJC/Nexus-ECommerce.git
cd Nexus-ECommerce
npm install
```

### 2.2 Configure Environment

Create `.env.local` in project root:

```env
# Required - Get from Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Optional - For Edge Functions
VITE_SUPABASE_FUNCTIONS_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1
```

> **Get Supabase credentials:** Create a project at [supabase.com](https://supabase.com) → Settings → API → copy URL and `anon` `public` key.

### 2.3 Set Up Supabase Database

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project → **SQL Editor**
2. Copy the entire contents of `/supabase/migration.sql`
3. Paste and **Run** — this creates:
   - All tables (categories, brands, products, orders, cart_items, user_profiles)
   - RLS policies
   - Indexes & triggers
   - RPC functions (`get_admin_stats`, `get_admin_customers`)
   - Enum types (`product_status`, `order_status`, `payment_method`)

#### Option B: Using Supabase CLI

```bash
# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### 2.4 Create Storage Buckets

In Supabase Dashboard → **Storage** → **New Bucket** (create both):

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| `product-images` | ✅ Yes | Product image uploads |
| `brand-logos` | ✅ Yes | Brand logo uploads |

### 2.5 Configure Authentication

In Supabase Dashboard → **Authentication** → **Settings**:

1. **Site URL**: `http://localhost:5173`
2. **Redirect URLs**: Add `http://localhost:5173/auth/callback`
3. **Email Templates** (optional): Customize confirmation/recovery emails

### 2.6 Deploy Edge Function (Rate Limiting)

```bash
# Install Supabase CLI if not done
npm i -g supabase

# Link and deploy
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy rate-limit-auth
```

This deploys `/supabase/functions/rate-limit-auth` — limits auth attempts to 3 per 15 min per IP.

### 2.7 Create Admin User

After running migrations, create an admin user:

1. Sign up normally at `http://localhost:5173/auth/register` with `admin@nexus.com`
2. In Supabase Dashboard → **Authentication** → **Users**, find the user
3. Click the user → **Raw User Meta Data** → Edit → add:
   ```json
   { "role": "admin" }
   ```
4. In **Table Editor** → `user_profiles`, find the row and set `role = 'admin'`

Or run this SQL in SQL Editor:

```sql
-- Replace 'USER_ID_HERE' with the UUID from auth.users
UPDATE user_profiles SET role = 'admin' WHERE id = 'USER_ID_HERE';
```

### 2.8 Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 3. Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@nexus.com` | `admin123` |
| **Customer** | `user@nexus.com` | `user123` |

> These are created automatically if you run the seed script (see below).

---

## 4. Optional: Seed Demo Data

Run in Supabase SQL Editor to populate sample categories, brands, and products:

```sql
-- Categories
INSERT INTO categories (id, name, description) VALUES
  ('cat-peripherals', 'Peripherals', 'Mice, keyboards, headsets'),
  ('cat-components', 'Components', 'GPUs, CPUs, RAM, storage'),
  ('cat-monitors', 'Monitors', 'Gaming monitors, ultrawides'),
  ('cat-accessories', 'Accessories', 'Mousepads, cables, stands');

-- Brands
INSERT INTO brands (id, name, logo_url, description) VALUES
  ('brand-asus', 'ASUS ROG', '/images/brands/asus.svg', 'Republic of Gamers'),
  ('brand-msi', 'MSI', '/images/brands/msi.svg', 'True Gaming'),
  ('brand-razer', 'Razer', '/images/brands/razer.svg', 'For Gamers. By Gamers.'),
  ('brand-logitech', 'Logitech G', '/images/brands/logitech.svg', 'Play to Win');

-- Sample Products
INSERT INTO products (id, name, image_url, category_id, brand_id, price_cents, stock, status) VALUES
  ('prod-1', 'ROG Gladius III Wireless', '/images/products/gladius3.jpg', 'cat-peripherals', 'brand-asus', 899900, 15, 'active'),
  ('prod-2', 'MSI GeForce RTX 4070 Ti SUPER 16G', '/images/products/4070ti.jpg', 'cat-components', 'brand-msi', 5999000, 4, 'active'),
  ('prod-3', 'Razer DeathAdder V3 Pro', '/images/products/deathadder.jpg', 'cat-peripherals', 'brand-razer', 899900, 22, 'active'),
  ('prod-4', 'ROG Swift PG27AQDP', '/images/products/pg27aqdp.jpg', 'cat-monitors', 'brand-asus', 4999900, 3, 'active');
```

---

## 5. Production Deployment

### 5.1 Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard:
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_FUNCTIONS_URL
```

The `vercel.json` handles:
- SPA routing (fallback to `index.html`)
- Security headers
- Cache headers for static assets

### 5.2 Netlify

```bash
npm run build
# Deploy dist/ folder
# Add environment variables in Netlify Dashboard
```

### 5.3 Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
docker build -t nexus-gaming .
docker run -p 8080:80 nexus-gaming
```

---

## 6. Verification Checklist

After setup, verify these work:

| Feature | Test |
|---------|------|
| ✅ Home page loads | Hero, categories, featured products |
| ✅ Products page | Search, filter, sort, pagination |
| ✅ Product detail | Images, description, add to cart |
| ✅ Guest cart | Add items, persist on refresh |
| ✅ Sign up / Login | Email/password auth |
| ✅ Cart merge | Guest → authenticated sync |
| ✅ Checkout | All 3 payment methods |
| ✅ Order confirmation | Order ID displayed |
| ✅ Order history | `/orders` shows past orders |
| ✅ Admin login | `/admin/login` with admin creds |
| ✅ Admin dashboard | Stats, chart, recent orders |
| ✅ Admin products | CRUD with image upload |
| ✅ Admin orders | Status transitions |
| ✅ Rate limiting | 3 failed logins → 429 error |

---

## 7. Common Issues

| Issue | Solution |
|-------|----------|
| `VITE_SUPABASE_URL` not found | Check `.env.local` exists and restart dev server |
| Auth not working | Verify Site URL & Redirect URLs in Supabase Auth settings |
| Images not uploading | Ensure storage buckets exist and are **public** |
| Admin panel 403 | User must have `role = 'admin'` in both `auth.users.raw_user_meta_data` AND `user_profiles` |
| Rate limit too strict | Edit `supabase/functions/rate-limit-auth/index.ts` → adjust `MAX_ATTEMPTS` / `WINDOW_MS` |
| CORS errors | Check Supabase API settings → add your domain to allowed origins |

---

## 8. Project Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest unit tests |
| `npx playwright test` | Run E2E tests |
| `supabase db push` | Push migrations to linked project |
| `supabase functions deploy` | Deploy Edge Functions |
| `supabase db diff` | View pending schema changes |

---

## 9. Support

- **Issues:** [GitHub Issues](https://github.com/AlbertCJC/Nexus-ECommerce/issues)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vite Docs:** [vitejs.dev](https://vitejs.dev)
- **Tailwind Docs:** [tailwindcss.com](https://tailwindcss.com)