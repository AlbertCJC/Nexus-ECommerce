import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

// Query keys
export const queryKeys = {
  cart: (userId) => ['cart', userId],
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