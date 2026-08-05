import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

// Query keys
export const queryKeys = {
  orders: (userId) => ['orders', userId],
  order: (id) => ['order', id],
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