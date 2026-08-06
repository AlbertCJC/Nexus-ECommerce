import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

// Query keys
export const queryKeys = {
  adminStats: () => ['admin', 'stats'],
  adminCustomers: () => ['admin', 'customers'],
}

// Admin Stats - uses RPC for single query
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats')
      if (error) throw error
      return data
    },
  })
}

// Admin Customers with order aggregates - uses RPC
export function useAdminCustomers() {
  return useQuery({
    queryKey: queryKeys.adminCustomers(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_customers')
      if (error) throw error
      return data || []
    },
  })
}