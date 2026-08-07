// Database types matching Supabase schema

export type UserRole = 'customer' | 'admin'
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'completed' | 'cancelled'
export type PaymentMethod = 'cod' | 'ewallet' | 'bank'

export interface Category {
  id: string
  name: string
  description: string | null
  icon_key: string | null
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  logo_url: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  image_url: string
  category_id: string
  brand_id: string
  description: string | null
  price_cents: number
  stock: number
  status: ProductStatus
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  brand?: Brand
}

export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: UserRole
  address: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  subtotal_cents: number
  shipping_cents: number
  tax_cents: number
  total_cents: number
  payment_method: PaymentMethod
  status: OrderStatus
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  idempotency_key?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image: string
  unit_price_cents: number
  quantity: number
  created_at: string
  product?: Product
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

// Form/Input types
export interface CreateProductInput {
  name: string
  image_url: string
  category_id: string
  brand_id: string
  description?: string
  price_cents: number
  stock: number
  status?: ProductStatus
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string
}

export interface CreateCategoryInput {
  name: string
  description?: string
  icon_key?: string
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string
}

export interface CreateBrandInput {
  name: string
  logo_url?: string
  description?: string
}

export interface UpdateBrandInput extends Partial<CreateBrandInput> {
  id: string
}

export interface CheckoutInput {
  name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  payment_method: PaymentMethod
  notes?: string
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}