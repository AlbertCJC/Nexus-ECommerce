import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { queryKeys as productQueryKeys } from '../queries/useProducts'
import { queryKeys as orderQueryKeys } from '../queries/useOrders'
import { queryKeys as cartQueryKeys } from '../queries/useCart'
import { queryKeys as adminQueryKeys } from '../queries/useAdmin'
import { v4 as uuidv4 } from 'uuid'

// Helper to detect permission denied errors (RLS 403)
function isPermissionError(error) {
  if (!error) return false
  // Supabase PostgREST returns 403 as code '42501' or status 403
  return error.code === '42501' || error.status === 403 || error.message?.includes('permission denied') || error.message?.includes('row-level security')
}

// Helper to make permission-denied error user-friendly
function ensurePermissionError(error) {
  if (isPermissionError(error)) {
    const err = new Error('Permission denied. Admin access required.')
    err.code = 'PERMISSION_DENIED'
    err.status = 403
    throw err
  }
  throw error
}

// Cart Mutations
export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, productId, quantity, guestCartDispatcher }) => {
      // If userId provided, use Supabase (authenticated)
      if (userId) {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('quantity')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .single()

        if (existing) {
          const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('user_id', userId)
            .eq('product_id', productId)
            .select()
            .single()

          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase
            .from('cart_items')
            .insert({ user_id: userId, product_id: productId, quantity })
            .select()
            .single()

          if (error) throw error
          return data
        }
      }

      // If no userId, guest user - use guestCartDispatcher callback
      if (guestCartDispatcher) {
        guestCartDispatcher({ productId, quantity })
        return { localOnly: true }
      }

      throw new Error('No userId or guestCartDispatcher provided')
    },
    onSuccess: (_, vars) => {
      if (vars.userId) {
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart(vars.userId) })
      }
    },
  })
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, productId, quantity }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId)

        if (error) throw error
        return { deleted: true }
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('product_id', productId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart(vars.userId) })
    },
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, productId }) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)

      if (error) throw error
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart(vars.userId) })
    },
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart(userId) })
    },
  })
}

// Order Mutations
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, checkoutData, cartItems, idempotencyKey }) => {
      // Prepare cart items for RPC
      // Checkout.jsx passes: { product_id, product, quantity }
      const rpcCartItems = cartItems.map(({ product_id, product, quantity }) => ({
        product_id,
        product_name: product.name,
        product_image: product.image_url,
        unit_price_cents: product.price_cents,
        quantity,
        product: {
          price_cents: product.price_cents,
        },
      }))

      const { data, error } = await supabase.rpc('create_order', {
        p_user_id: userId,
        p_checkout_data: checkoutData,
        p_cart_items: rpcCartItems,
        p_idempotency_key: idempotencyKey,
      })

      if (error) throw error

      // Handle idempotent response (order already exists)
      if (data?.already_exists) {
        return { id: data.id, alreadyExists: true }
      }

      return { id: data.id, alreadyExists: false }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.orders(vars.userId) })
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart(vars.userId) })
      // Also invalidate products since stock may have changed
      queryClient.invalidateQueries({ queryKey: productQueryKeys.products() })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, status, userId }) => {
      // If cancelling, use cancel_order RPC to restore stock
      if (status === 'cancelled') {
        const { data, error } = await supabase.rpc('cancel_order', {
          p_order_id: orderId,
          p_user_id: userId,
        })

        if (error) throw error
        return data
      }

      // Otherwise, just update the status
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.orders() })
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.order(vars.orderId) })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminStats() })
      // Invalidate products in case stock was restored
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error) => ensurePermissionError(error),
  })
}

// Product Mutations (Admin)
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (product) => {
      const { data, error } = await supabase
        .from('products')
        .insert({ ...product, id: uuidv4() })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminStats() })
    },
    onError: (error) => ensurePermissionError(error),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates) => {
      const id = updates.id
      delete updates.id
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: productQueryKeys.product(vars.id) })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminStats() })
    },
    onError: (error) => ensurePermissionError(error),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      // Soft delete: mark as inactive instead of hard delete (preserves order history AND keeps product row in admin panel)
      const { error } = await supabase
        .from('products')
        .update({ status: 'inactive' })
        .eq('id', id)

      if (error) throw error

      // Cascade delete cart_items for this product (prevent ghost items in carts)
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', id)

      if (cartError) throw cartError

      return { softDeleted: true }
    },
    onSuccess: () => {
      // Invalidate all product queries regardless of filters
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminStats() })
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() })
    },
    onError: (error) => ensurePermissionError(error),
  })
}

// Category Mutations (Admin)
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (category) => {
      const { data, error } = await supabase
        .from('categories')
        .insert({ ...category, id: uuidv4() })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories() })
    },
    onError: (error) => ensurePermissionError(error),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates) => {
      const id = updates.id
      delete updates.id
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories() })
    },
    onError: (error) => ensurePermissionError(error),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      // Check if products exist
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id)

      if (count && count > 0) {
        throw new Error('Cannot delete category with existing products')
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories() })
    },
    onError: (error) => ensurePermissionError(error),
  })
}

// Brand Mutations (Admin)
export function useCreateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (brand) => {
      const { data, error } = await supabase
        .from('brands')
        .insert({ ...brand, id: uuidv4() })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.brands() })
    },
    onError: (error) => ensurePermissionError(error),
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates) => {
      const id = updates.id
      delete updates.id
      const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.brands() })
    },
    onError: (error) => ensurePermissionError(error),
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      // Check if products exist
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', id)

      if (count && count > 0) {
        throw new Error('Cannot delete brand with existing products')
      }

      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.brands() })
    },
    onError: (error) => ensurePermissionError(error),
  })
}

// Profile Mutations
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, updates }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.profile(vars.userId) })
    },
  })
}

// Image Upload
export function useUploadImage() {
  return useMutation({
    mutationFn: async ({ bucket, path, file }) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return publicUrlData.publicUrl
    },
  })
}