import { Routes, Route, Navigate } from 'react-router-dom'
import { CustomerLayout } from '../components/layout/CustomerLayout'
import { AdminLayout } from '../components/layout/AdminLayout'
import { AdminProtectedRoute } from './AdminProtectedRoute'

// Customer pages
import { Home } from '../pages/customer/Home'
import { Products } from '../pages/customer/Products'
import { ProductDetail } from '../pages/customer/ProductDetail'
import { Cart } from '../pages/customer/Cart'
import { Checkout } from '../pages/customer/Checkout'
import { OrderConfirmation } from '../pages/customer/OrderConfirmation'

// Admin pages
import { AdminLogin } from '../pages/admin/AdminLogin'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { AdminProducts } from '../pages/admin/AdminProducts'
import { AdminCategories } from '../pages/admin/AdminCategories'
import { AdminOrders } from '../pages/admin/AdminOrders'
import { AdminOrderDetail } from '../pages/admin/AdminOrderDetail'
import { AdminCustomers } from '../pages/admin/AdminCustomers'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order/:id/confirmation" element={<OrderConfirmation />} />
      </Route>

      {/* Admin Login (Public) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}