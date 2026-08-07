import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

// Query keys
export const queryKeys = {
  products: (filters) => ['products', JSON.stringify(filters || {})],
  product: (id) => ['product', id],
  categories: () => ['categories'],
  brands: () => ['brands'],
  relatedProducts: (currentProductId, categoryId) => ['related-products', currentProductId, categoryId],
  searchProducts: (query, filters) => ['search-products', query, JSON.stringify(filters || {})],
}

// Products
export function useProducts(filters) {
  const { search, ...otherFilters } = filters || {}

  // If search query provided, use full-text search RPC (Risk 3)
  if (search && search.trim()) {
    return useSearchProducts(search.trim(), otherFilters)
  }

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
      if (otherFilters?.status && otherFilters.status !== 'all') {
        query = query.eq('status', otherFilters.status)
      } else if (!otherFilters?.status) {
        // Default to active products for public views
        query = query.eq('status', 'active')
      }
      // If status === 'all', don't apply any status filter

      if (otherFilters?.categoryId) {
        query = query.eq('category_id', otherFilters.categoryId)
      }

      if (otherFilters?.brandIds && otherFilters.brandIds.length > 0) {
        query = query.in('brand_id', otherFilters.brandIds)
      }

      // Sorting
      const sortBy = otherFilters?.sortBy || 'newest'
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

      if (otherFilters?.limit) {
        query = query.limit(otherFilters.limit)
      }

      if (otherFilters?.offset) {
        query = query.range(otherFilters.offset, otherFilters.offset + (otherFilters.limit || 20) - 1)
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

// Full-text search using search_products RPC (Risk 3)
export function useSearchProducts(query, filters = {}) {
  return useQuery({
    queryKey: queryKeys.searchProducts(query, filters),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_products', {
        p_query: query,
        p_limit: filters.limit || 20,
        p_offset: filters.offset || 0,
        p_category_id: filters.categoryId || null,
        p_brand_ids: filters.brandIds || null,
        p_status: filters.status || 'active',
      })

      if (error) {
        // Fallback to ILIKE if RPC doesn't exist (migration not applied yet)
        if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
          console.warn('search_products RPC not available, falling back to ILIKE')
          return fallbackSearch(query, filters)
        }
        throw error
      }
      return data
    },
    enabled: !!query && query.trim().length > 0,
  })
}

// Fallback search using ILIKE (for backward compatibility)
async function fallbackSearch(query, filters) {
  let q = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*)
    `)

  if (filters?.status && filters.status !== 'all') {
    q = q.eq('status', filters.status)
  } else if (!filters?.status) {
    q = q.eq('status', 'active')
  }

  if (filters?.categoryId) {
    q = q.eq('category_id', filters.categoryId)
  }

  if (filters?.brandIds && filters.brandIds.length > 0) {
    q = q.in('brand_id', filters.brandIds)
  }

  // Use ILIKE with trigram index (if available)
  q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`)

  const sortBy = filters?.sortBy || 'newest'
  switch (sortBy) {
    case 'price-asc':
      q = q.order('price_cents', { ascending: true })
      break
    case 'price-desc':
      q = q.order('price_cents', { ascending: false })
      break
    case 'name-asc':
      q = q.order('name', { ascending: true })
      break
    case 'name-desc':
      q = q.order('name', { ascending: false })
      break
    case 'newest':
    default:
      q = q.order('created_at', { ascending: false })
      break
  }

  if (filters?.limit) {
    q = q.limit(filters.limit)
  }

  if (filters?.offset) {
    q = q.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
  }

  const { data, error } = await q
  if (error) throw error
  return data
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