import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

// Query keys
export const queryKeys = {
  products: (filters) => ['products', JSON.stringify(filters || {})],
  product: (id) => ['product', id],
  categories: () => ['categories'],
  brands: () => ['brands'],
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

      // Return null for 404 (not found) instead of throwing
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
          return null
        }
        throw error
      }
      return data
    },
    enabled: !!id,
    throwOnError: false,
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