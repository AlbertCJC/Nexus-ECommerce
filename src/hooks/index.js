// Query hooks
export {
  useProducts,
  useProduct,
  useRelatedProducts,
  useCategories,
  useBrands,
} from './queries/useProducts'
export { queryKeys as productQueryKeys } from './queries/useProducts'

export {
  useOrders,
  useOrder,
} from './queries/useOrders'
export { queryKeys as orderQueryKeys } from './queries/useOrders'

export {
  useCart,
} from './queries/useCart'
export { queryKeys as cartQueryKeys } from './queries/useCart'

export {
  useProfile,
} from './queries/useProfile'
export { queryKeys as profileQueryKeys } from './queries/useProfile'

export {
  useAdminStats,
  useAdminCustomers,
} from './queries/useAdmin'
export { queryKeys as adminQueryKeys } from './queries/useAdmin'

export {
  useInvalidateQueries,
} from './queries/useInvalidateQueries'

// Mutation hooks
export {
  useAddToCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
  useClearCart,
  useCreateOrder,
  useUpdateOrderStatus,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
  useUpdateProfile,
  useUploadImage,
} from './mutations/useMutations'