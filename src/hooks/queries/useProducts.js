import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

// Query keys
export const queryKeys = {
  products: (filters) => ['products', JSON.stringify(filters || {})],
  product: (id) => ['product', id],
  categories: () => ['categories'],
  brands: () => ['brands'],
  orders: (userId) => ['orders', userId],
  order: (id) => ['order', id],
  cart: (userId) => ['cart', userId],
  profile: (userId) => ['profile', userId],
  adminStats: () => ['admin', 'stats'],
  adminCustomers: () => ['admin', 'customers'],
  relatedProducts: (currentProductId, categoryId) => ['related-products', currentProductId, categoryId],
}

// Products
export function useProducts(filters) {
  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      } else if (!filters?.status) {
        // Default to active products for public views
        query = query.eq('status', 'active')
      }
      // If status === 'all', don't apply any status filter

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      if (filters?.brandIds && filters.brandIds.length > 0) {
        query = query.in('brand_id', filters.brandIds)
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      // Sorting
      const sortBy = filters?.sortBy || 'newest'
      switch (sortBy) {
        case 'price-asc':
          query = query.order('price_cents', { ascending: true })
          break
        case 'price-desc':
          query = query.order('price_cents', { ascending: false })
          break
        case 'name-asc':
          query = query.order('name', { ascending: true })
          break
        case 'name-desc':
          query = query.order('name', { ascending: false })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: true, // Always enabled for product listings
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useRelatedProducts(currentProductId, categoryId, limit = 4) {
  return useQuery({
    queryKey: queryKeys.relatedProducts(currentProductId, categoryId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .eq('category_id', categoryId)
        .neq('id', currentProductId)
        .eq('status', 'active')
        .limit(limit)

      if (error) throw error
      return data
    },
    enabled: !!currentProductId && !!categoryId,
  })
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data
    },
  })
}

// Brands
export function useBrands() {
  return useQuery({
    queryKey: queryKeys.brands(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data
    },
  })
}

// Orders
export function useOrders(userId) {
  return useQuery({
    queryKey: queryKeys.orders(userId),
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: !userId || !!userId,
  })
}

export function useOrder(id) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Cart
export function useCart(userId) {
  return useQuery({
    queryKey: queryKeys.cart(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            *,
            category:categories(*),
            brand:brands(*)
          )
        `)
        .eq('user_id', userId)

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

// Profile
export function useProfile(userId) {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
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

// Invalidation helpers
export function useInvalidateQueries() {
  const queryClient = useQueryClient()

  return {
    invalidateProducts: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    invalidateCategories: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    invalidateBrands: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
    invalidateOrders: (userId) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['orders', userId] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      }
    },
    invalidateCart: (userId) => queryClient.invalidateQueries({ queryKey: ['cart', userId] }),
    invalidateProfile: (userId) => queryClient.invalidateQueries({ queryKey: ['profile', userId] }),
    invalidateAdminStats: () => queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
  }
}