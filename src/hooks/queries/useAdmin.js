import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

// Query keys
export const queryKeys = {
  adminStats: () => ['admin', 'stats'],
  adminCustomers: () => ['admin', 'customers'],
}

// Admin Stats
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: async () => {
      const [products, orders, categories, customers] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total_cents, status', { count: 'exact' }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      ])

      const totalSales = orders.data?.reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0
      const pendingOrders = orders.data?.filter(o => o.status === 'pending').length || 0
      const completedOrders = orders.data?.filter(o => o.status === 'completed').length || 0

      if (products.error) throw products.error
      if (orders.error) throw orders.error
      if (categories.error) throw categories.error
      if (customers.error) throw customers.error

      return {
        totalProducts: products.count || 0,
        totalOrders: orders.count || 0,
        pendingOrders,
        completedOrders,
        totalCustomers: customers.count || 0,
        totalSales,
      }
    },
  })
}

// Admin Customers with order aggregates
export function useAdminCustomers() {
  return useQuery({
    queryKey: queryKeys.adminCustomers(),
    queryFn: async () => {
      // Fetch all user profiles with role 'customer'
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name, phone, created_at')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Fetch all orders for these users
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, user_id, total_cents')
        .in('user_id', profiles?.map(p => p.id) || [])

      if (ordersError) throw ordersError

      // Aggregate orders by user
      const ordersByUser = (orders || []).reduce((acc, order) => {
        if (!acc[order.user_id]) {
          acc[order.user_id] = { orderCount: 0, totalSpent: 0 }
        }
        acc[order.user_id].orderCount++
        acc[order.user_id].totalSpent += order.total_cents || 0
        return acc
      }, {})

      // Combine profiles with order data
      return (profiles || []).map(profile => {
        const orderData = ordersByUser[profile.id] || { orderCount: 0, totalSpent: 0 }
        return {
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
          email: profile.email,
          phone: profile.phone || '—',
          orderCount: orderData.orderCount,
          totalSpent: orderData.totalSpent,
          status: orderData.orderCount > 0 ? 'active' : 'inactive',
          createdAt: profile.created_at,
        }
      })
    },
  })
}