import { describe, it, expect, vi } from 'vitest'
import {
  generateId,
  filterProducts,
  sortProducts,
  getCategoryName,
  getBrandName,
  calculateOrderTotal,
  formatOrderNumber,
} from '../../src/utils/helpers'

vi.mock('uuid', () => ({
  v4: () => 'abcdef1234567890',
}))

describe('helpers', () => {
  describe('generateId', () => {
    it('generates ID with prefix', () => {
      expect(generateId('prefix-')).toBe('prefix-abcdef12')
    })

    it('generates ID without prefix', () => {
      expect(generateId()).toBe('abcdef12')
    })
  })

  describe('filterProducts', () => {
    const mockProducts = [
      { id: '1', name: 'Razer DeathAdder', description: 'Gaming mouse', categoryId: 'cat-mice', brandId: 'brand-razer', status: 'active' },
      { id: '2', name: 'Logitech G Pro', description: 'Wireless mouse', categoryId: 'cat-mice', brandId: 'brand-logitech', status: 'active' },
      { id: '3', name: 'Razer BlackWidow', description: 'Mechanical keyboard', categoryId: 'cat-keyboards', brandId: 'brand-razer', status: 'inactive' },
      { id: '4', name: 'ASUS ROG Monitor', description: 'Gaming monitor', categoryId: 'cat-monitors', brandId: 'brand-asus', status: 'active' },
    ]

    it('returns all products when no filters', () => {
      expect(filterProducts(mockProducts, {})).toHaveLength(4)
    })

    it('filters by search term in name', () => {
      const result = filterProducts(mockProducts, { search: 'DeathAdder' })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Razer DeathAdder')
    })

    it('filters by search term in description', () => {
      const result = filterProducts(mockProducts, { search: 'Wireless' })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Logitech G Pro')
    })

    it('is case insensitive', () => {
      const result = filterProducts(mockProducts, { search: 'RAZER' })
      expect(result).toHaveLength(2)
    })

    it('filters by category', () => {
      const result = filterProducts(mockProducts, { categoryId: 'cat-mice' })
      expect(result).toHaveLength(2)
      expect(result.every(p => p.categoryId === 'cat-mice')).toBe(true)
    })

    it('filters by brand', () => {
      const result = filterProducts(mockProducts, { brandIds: ['brand-razer'] })
      expect(result).toHaveLength(2)
      expect(result.every(p => p.brandId === 'brand-razer')).toBe(true)
    })

    it('filters by multiple brands', () => {
      const result = filterProducts(mockProducts, { brandIds: ['brand-razer', 'brand-logitech'] })
      expect(result).toHaveLength(3)
    })

    it('filters by status', () => {
      const result = filterProducts(mockProducts, { status: 'active' })
      expect(result).toHaveLength(3)
      expect(result.every(p => p.status === 'active')).toBe(true)
    })

    it('combines multiple filters', () => {
      const result = filterProducts(mockProducts, { search: 'Razer', categoryId: 'cat-mice', brandIds: ['brand-razer'], status: 'active' })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Razer DeathAdder')
    })

    it('returns empty array when no matches', () => {
      const result = filterProducts(mockProducts, { search: 'NonExistent' })
      expect(result).toHaveLength(0)
    })
  })

  describe('sortProducts', () => {
    const mockProducts = [
      { id: '1', name: 'C Product', price: 300, createdAt: '2024-01-01' },
      { id: '2', name: 'A Product', price: 100, createdAt: '2024-01-03' },
      { id: '3', name: 'B Product', price: 200, createdAt: '2024-01-02' },
    ]

    it('sorts by price ascending', () => {
      const result = sortProducts(mockProducts, 'price-asc')
      expect(result.map(p => p.price)).toEqual([100, 200, 300])
    })

    it('sorts by price descending', () => {
      const result = sortProducts(mockProducts, 'price-desc')
      expect(result.map(p => p.price)).toEqual([300, 200, 100])
    })

    it('sorts by name ascending', () => {
      const result = sortProducts(mockProducts, 'name-asc')
      expect(result.map(p => p.name)).toEqual(['A Product', 'B Product', 'C Product'])
    })

    it('sorts by name descending', () => {
      const result = sortProducts(mockProducts, 'name-desc')
      expect(result.map(p => p.name)).toEqual(['C Product', 'B Product', 'A Product'])
    })

    it('sorts by newest first', () => {
      const result = sortProducts(mockProducts, 'newest')
      expect(result.map(p => p.id)).toEqual(['2', '3', '1'])
    })

    it('returns original order for unknown sortBy', () => {
      const result = sortProducts(mockProducts, 'unknown')
      expect(result.map(p => p.id)).toEqual(['1', '2', '3'])
    })

    it('does not mutate original array', () => {
      const original = [...mockProducts]
      sortProducts(mockProducts, 'price-asc')
      expect(mockProducts).toEqual(original)
    })
  })

  describe('getCategoryName', () => {
    const mockCategories = [
      { id: 'cat-mice', name: 'Gaming Mice' },
      { id: 'cat-keyboards', name: 'Keyboards' },
    ]

    it('returns category name for valid ID', () => {
      expect(getCategoryName(mockCategories, 'cat-mice')).toBe('Gaming Mice')
      expect(getCategoryName(mockCategories, 'cat-keyboards')).toBe('Keyboards')
    })

    it('returns Unknown for invalid ID', () => {
      expect(getCategoryName(mockCategories, 'cat3')).toBe('Unknown')
      expect(getCategoryName(mockCategories, '')).toBe('Unknown')
      expect(getCategoryName([], 'cat-mice')).toBe('Unknown')
    })
  })

  describe('getBrandName', () => {
    const mockBrands = [
      { id: 'brand-razer', name: 'Razer' },
      { id: 'brand-logitech', name: 'Logitech G' },
    ]

    it('returns brand name for valid ID', () => {
      expect(getBrandName(mockBrands, 'brand-razer')).toBe('Razer')
      expect(getBrandName(mockBrands, 'brand-logitech')).toBe('Logitech G')
    })

    it('returns Unknown for invalid ID', () => {
      expect(getBrandName(mockBrands, 'brand3')).toBe('Unknown')
      expect(getBrandName(mockBrands, '')).toBe('Unknown')
      expect(getBrandName([], 'brand-razer')).toBe('Unknown')
    })
  })

  describe('calculateOrderTotal', () => {
    it('calculates total for multiple items', () => {
      const items = [
        { price: 100, quantity: 2 },
        { price: 50, quantity: 3 },
      ]
      expect(calculateOrderTotal(items)).toBe(350)
    })

    it('returns 0 for empty array', () => {
      expect(calculateOrderTotal([])).toBe(0)
    })

    it('handles single item', () => {
      expect(calculateOrderTotal([{ price: 99.99, quantity: 1 }])).toBe(99.99)
    })
  })

  describe('formatOrderNumber', () => {
    it('formats order number correctly', () => {
      expect(formatOrderNumber('abc12345')).toBe('ORD-ABC12345')
      expect(formatOrderNumber('order-123')).toBe('ORD-ORDER-12')
    })

    it('handles short IDs', () => {
      expect(formatOrderNumber('ab')).toBe('ORD-AB')
    })
  })
})