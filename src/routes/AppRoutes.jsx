import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { CustomerLayout } from '../components/layout/CustomerLayout'
import { AdminLayout } from '../components/layout/AdminLayout'
import { AdminProtectedRoute } from './AdminProtectedRoute'
import { CustomerProtectedRoute } from './CustomerProtectedRoute'

// Loading spinner component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-base))]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" />
    </div>
  )
}

// Customer pages - lazy loaded
const Home = lazy(() => import('../pages/customer/Home'))
const Products = lazy(() => import('../pages/customer/Products'))
const ProductDetail = lazy(() => import('../pages/customer/ProductDetail'))
const Cart = lazy(() => import('../pages/customer/Cart'))
const Checkout = lazy(() => import('../pages/customer/Checkout'))
const OrderConfirmation = lazy(() => import('../pages/customer/OrderConfirmation'))
const OrderHistory = lazy(() => import('../pages/customer/OrderHistory'))
const Profile = lazy(() => import('../pages/customer/Profile'))

// Auth pages - lazy loaded
const AuthCallback = lazy(() => import('../pages/auth/AuthCallback'))
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'))

// Admin pages - lazy loaded
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'))
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'))
const AdminBrands = lazy(() => import('../pages/admin/AdminBrands'))
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'))
const AdminOrderDetail = lazy(() => import('../pages/admin/AdminOrderDetail'))
const AdminCustomers = lazy(() => import('../pages/admin/AdminCustomers'))

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
      {/* Public Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />

        {/* Auth callback for email verification */}
        <Route path="auth/callback" element={<AuthCallback />} />

        {/* Password reset */}
        <Route path="auth/reset-password" element={<ResetPassword />} />

        {/* Public Customer Routes (Cart & Checkout accessible to guests - localStorage based) */}
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />

        {/* Protected Customer Routes (require authentication) */}
        <Route element={<CustomerProtectedRoute />}>
          <Route path="order/:id/confirmation" element={<OrderConfirmation />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin Login (Public) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
)
}