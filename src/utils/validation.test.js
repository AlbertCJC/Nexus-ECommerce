import { describe, it, expect } from 'vitest'
import { checkoutSchema, loginSchema, productSchema, categorySchema } from '../../src/utils/validation'

describe('validation schemas', () => {
  describe('checkoutSchema', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
      paymentMethod: 'cod',
    }

    it('passes with valid data', () => {
      expect(() => checkoutSchema.parse(validData)).not.toThrow()
    })

    it('fails with short name', () => {
      const data = { ...validData, name: 'A' }
      expect(() => checkoutSchema.parse(data)).toThrow('Name must be at least 2 characters')
    })

    it('fails with invalid email', () => {
      const data = { ...validData, email: 'invalid' }
      expect(() => checkoutSchema.parse(data)).toThrow('Invalid email address')
    })

    it('fails with invalid phone', () => {
      const data = { ...validData, phone: '123' }
      expect(() => checkoutSchema.parse(data)).toThrow('Invalid phone number')
    })

    it('fails with short street address', () => {
      const data = { ...validData, address: { ...validData.address, street: '123' } }
      expect(() => checkoutSchema.parse(data)).toThrow('Street address is required')
    })

    it('fails with short city', () => {
      const data = { ...validData, address: { ...validData.address, city: 'A' } }
      expect(() => checkoutSchema.parse(data)).toThrow('City is required')
    })

    it('fails with invalid zip', () => {
      const data = { ...validData, address: { ...validData.address, zip: '123' } }
      expect(() => checkoutSchema.parse(data)).toThrow('Invalid ZIP code')
    })

    it('fails with invalid payment method', () => {
      const data = { ...validData, paymentMethod: 'invalid' }
      expect(() => checkoutSchema.parse(data)).toThrow('Invalid enum value')
    })

    it('accepts optional notes', () => {
      const data = { ...validData, notes: 'Please deliver after 5pm' }
      expect(() => checkoutSchema.parse(data)).not.toThrow()
    })

    it('accepts all payment methods', () => {
      ;['cod', 'ewallet', 'bank'].forEach(method => {
        const data = { ...validData, paymentMethod: method }
        expect(() => checkoutSchema.parse(data)).not.toThrow()
      })
    })
  })

  describe('loginSchema', () => {
    it('passes with valid credentials', () => {
      const data = { email: 'admin@example.com', password: 'password123' }
      expect(() => loginSchema.parse(data)).not.toThrow()
    })

    it('fails with invalid email', () => {
      const data = { email: 'invalid', password: 'password123' }
      expect(() => loginSchema.parse(data)).toThrow('Invalid email')
    })

    it('fails with empty password', () => {
      const data = { email: 'admin@example.com', password: '' }
      expect(() => loginSchema.parse(data)).toThrow('Password is required')
    })
  })

  describe('productSchema', () => {
    const validProduct = {
      name: 'Test Product',
      image_url: 'https://example.com/image.jpg',
      category_id: 'cat1',
      brand_id: 'brand1',
      description: 'A test product',
      price_cents: 9999,
      stock: 10,
      status: 'active',
    }

    it('passes with valid product data', () => {
      expect(() => productSchema.parse(validProduct)).not.toThrow()
    })

    it('fails with short name', () => {
      const data = { ...validProduct, name: 'A' }
      expect(() => productSchema.parse(data)).toThrow('Name must be at least 2 characters')
    })

    it('fails with invalid image URL', () => {
      const data = { ...validProduct, image_url: 'not-a-url' }
      expect(() => productSchema.parse(data)).toThrow('Valid image URL required')
    })

    it('fails with missing category', () => {
      const data = { ...validProduct, category_id: '' }
      expect(() => productSchema.parse(data)).toThrow('Category is required')
    })

    it('fails with negative price', () => {
      const data = { ...validProduct, price_cents: -10 }
      expect(() => productSchema.parse(data)).toThrow('Price must be a positive integer in cents')
    })

    it('fails with zero price', () => {
      const data = { ...validProduct, price_cents: 0 }
      expect(() => productSchema.parse(data)).toThrow('Price must be a positive integer in cents')
    })

    it('fails with negative stock', () => {
      const data = { ...validProduct, stock: -1 }
      expect(() => productSchema.parse(data)).toThrow('Stock cannot be negative')
    })

    it('fails with non-integer stock', () => {
      const data = { ...validProduct, stock: 10.5 }
      expect(() => productSchema.parse(data)).toThrow('Expected integer')
    })

    it('fails with invalid status', () => {
      const data = { ...validProduct, status: 'invalid' }
      expect(() => productSchema.parse(data)).toThrow()
    })

    it('accepts all valid statuses', () => {
      ;['active', 'inactive', 'out_of_stock'].forEach(status => {
        const data = { ...validProduct, status }
        expect(() => productSchema.parse(data)).not.toThrow()
      })
    })

    it('accepts optional description', () => {
      const data = { ...validProduct, description: undefined }
      expect(() => productSchema.parse(data)).not.toThrow()
    })
  })

  describe('categorySchema', () => {
    it('passes with valid category', () => {
      const data = { name: 'Electronics', description: 'Electronic devices' }
      expect(() => categorySchema.parse(data)).not.toThrow()
    })

    it('fails with short name', () => {
      const data = { name: 'A' }
      expect(() => categorySchema.parse(data)).toThrow('Name must be at least 2 characters')
    })

    it('accepts optional description', () => {
      const data = { name: 'Electronics' }
      expect(() => categorySchema.parse(data)).not.toThrow()
    })
  })
})