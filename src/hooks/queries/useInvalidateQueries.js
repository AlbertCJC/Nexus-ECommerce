import { useQueryClient } from '@tanstack/react-query'

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
    invalidateAdminCustomers: () => queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] }),
  }
}