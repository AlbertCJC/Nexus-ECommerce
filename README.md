
# CodeCraft Store - E-Commerce Web App

A fully responsive e-commerce application built with React + Vite, featuring a customer-facing storefront and an admin dashboard with shared state via LocalStorage.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

## 🔐 Admin Credentials

- **Email:** `admin@example.com`
- **Password:** `admin123`

Access the admin dashboard at `/admin/login` or click "Dashboard" in the navbar when logged in.

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, Vite 5 |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router 6 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| State | React Context + useReducer |
| Persistence | LocalStorage |
| Icons | Heroicons (inline SVG) |
| Date | date-fns |
| IDs | uuid |


## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # Primitive reusable components (Button, Input, Modal, Table, etc.)
│   ├── layout/       # Layout wrappers (Navbar, Footer, AdminSidebar, CustomerLayout, AdminLayout)
│   ├── products/     # Product display components (ProductCard, ProductGrid, ProductFilters, RelatedProducts)
│   ├── cart/         # Shopping cart components (CartItem, CartSummary)
│   ├── admin/        # Admin-specific components (StatsCard)
│   └── charts/       # Chart components (SalesChart)
├── pages/
│   ├── customer/     # Customer-facing pages (Home, Products, ProductDetail, Cart, Checkout, OrderConfirmation)
│   └── admin/        # Admin dashboard pages (AdminLogin, AdminDashboard, AdminProducts, AdminCategories, AdminOrders, AdminOrderDetail, AdminCustomers)
├── context/
│   └── AppContext.jsx # Global state management with LocalStorage sync
├── hooks/            # Custom React hooks (useLocalStorage, useDebounce, useMediaQuery)
├── data/
│   └── seedData.js   # Initial sample data (12 products, 4 categories, 2 orders, 2 customers)
├── utils/            # Helper functions & formatters (helpers, formatters, validation)
├── routes/           # Route configuration (AppRoutes, AdminProtectedRoute)
└── styles/           # Global styles (Tailwind imports + custom utilities)
```

## 🔄 Shared State Architecture

The application uses a **single React Context** (`AppContext`) with `useReducer` for global state management:

### State Structure
- **products** - All products (managed by admin, viewed by customers)
- **categories** - Product categories
- **orders** - All customer orders
- **customers** - Aggregated customer data (derived from orders)
- **cart** - Current user's shopping cart
- **auth** - Admin authentication state
- **ui** - Loading state, toast notifications

### Data Synchronization
1. **Hydration**: On app mount, reads from LocalStorage keys:
   - `ecommerce_products`
   - `ecommerce_categories`
   - `ecommerce_orders`
   - `ecommerce_cart`
   - `ecommerce_auth`

2. **Seeding**: If LocalStorage is empty, loads sample data from `seedData.js` (12 products, 4 categories, 2 orders, 2 customers)

3. **Persistence**: Debounced writes (300ms) to LocalStorage on state changes

4. **Cross-tab Sync**: Listens to `storage` events for real-time updates across browser tabs

### Shared State Guarantees
- ✅ Product added in Admin → Appears in Customer product listing
- ✅ Product set to "Inactive"/"Out of Stock" → Hidden/marked on Customer site
- ✅ Price/stock edits in Admin → Immediate reflection on Customer site
- ✅ Customer orders → Appear in Admin order list
- ✅ Admin order status changes → Reflected in Customer order view
- ✅ Cart persists across page refreshes

## 🎯 Features

### Customer Website
- **Home Page** - Hero banner, feature highlights, category grid, featured products
- **Products Listing** - 12 sample products with search, category filter, price/name sorting, responsive grid
- **Product Detail** - Image gallery, description, quantity selector, related products
- **Shopping Cart** - Persistent cart with quantity updates, line totals, order summary
- **Checkout** - Validated form (name, email, phone, address, payment method, notes)
- **Order Confirmation** - Order number, summary, customer info, shipping details

### Admin Dashboard
- **Login** - Simple authentication with hardcoded credentials
- **Dashboard** - Stats cards (products, orders, customers, sales), sales chart, recent orders
- **Product Management** - Full CRUD with search, category/status filters, status badges
- **Category Management** - CRUD with product count, deletion blocked if products exist
- **Order Management** - Table with filters, inline status updates, detail view
- **Order Details** - Complete order info, customer details, items, status management
- **Customer Management** - Aggregated list with order counts and total spend

## 📱 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Single column, hamburger menus, drawer filters |
| Tablet (640-1023px) | 2-col grids, collapsible admin sidebar |
| Desktop (≥1024px) | Full layouts, 3-4 col grids, persistent sidebar |

## 🌱 Seed Data

The app includes sample data on first load:

**Categories (4):**
- Electronics, Clothing, Books, Home & Garden

**Products (12):**
- 3 per category with varied prices ($10-$500), stock levels (0-100), and statuses

**Orders (2):**
- Different customers, statuses (pending, completed), 2-4 items each

**Customers (2):**
- Derived from order data with aggregated stats

## 🔧 Development

### Available Scripts
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Key Files to Modify
- `src/data/seedData.js` - Modify sample data
- `src/context/AppContext.jsx` - Add new state/actions
- `tailwind.config.js` - Customize design tokens
- `src/utils/validation.js` - Form validation schemas

## 📦 Deployment

```bash
npm run build
# Deploy the `dist` folder to any static hosting:
# - Vercel, Netlify, GitHub Pages, AWS S3, etc.
```

## 📝 License

MIT License - Feel free to use for learning or commercial projects.