import { z } from 'zod'

export const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]{10,}$/, 'Invalid phone number'),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zip: z.string().regex(/^\d{4,6}$/, 'Invalid ZIP code (4-6 digits)'),
    country: z.string().min(2, 'Country is required')
  }),
  paymentMethod: z.enum(['cod', 'ewallet', 'bank'], { required_error: 'Select a payment method' }),
  notes: z.string().optional()
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
})

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  image_url: z.string().url('Valid image URL required'),
  category_id: z.string().min(1, 'Category is required'),
  brand_id: z.string().min(1, 'Brand is required'),
  description: z.string().optional(),
  price_cents: z.number().int().positive('Price must be a positive integer in cents'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  status: z.enum(['active', 'inactive', 'out_of_stock'])
})

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  icon_key: z.string().optional()
})

export const brandSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  logo_url: z.string().url('Valid logo URL required'),
  description: z.string().optional()
})