import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatStock,
  formatProductStatus,
  formatOrderStatus,
} from '../../src/utils/formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers as PHP currency (default)', () => {
      expect(formatCurrency(100)).toBe('₱100.00')
      expect(formatCurrency(99.99)).toBe('₱99.99')
      expect(formatCurrency(0)).toBe('₱0.00')
    })

    it('formats with custom currency', () => {
      expect(formatCurrency(100, 'EUR')).toBe('€100.00')
      expect(formatCurrency(100, 'GBP')).toBe('£100.00')
      expect(formatCurrency(100, 'USD')).toBe('$100.00')
    })

    it('handles large numbers', () => {
      expect(formatCurrency(1000000)).toBe('₱1,000,000.00')
    })
  })

  describe('formatDate', () => {
    it('formats valid date strings', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024')
      expect(formatDate('2024-12-31')).toBe('Dec 31, 2024')
    })

    it('formats Date objects', () => {
      expect(formatDate(new Date('2024-06-15'))).toBe('Jun 15, 2024')
    })

    it('returns empty string for invalid dates', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
      expect(formatDate('invalid')).toBe('')
      expect(formatDate(new Date('invalid'))).toBe('')
    })

    it('accepts custom pattern', () => {
      expect(formatDate('2024-01-15', 'yyyy-MM-dd')).toBe('2024-01-15')
      expect(formatDate('2024-01-15', 'd MMM yyyy')).toBe('15 Jan 2024')
    })
  })

  describe('formatDateTime', () => {
    it('formats date with time', () => {
      expect(formatDateTime('2024-01-15T14:30:00')).toMatch(/Jan 15, 2024.*2:30/)
      expect(formatDateTime(new Date('2024-06-15T09:00:00'))).toMatch(/Jun 15, 2024.*9:00/)
    })

    it('returns empty string for invalid dates', () => {
      expect(formatDateTime(null)).toBe('')
      expect(formatDateTime('invalid')).toBe('')
    })
  })

  describe('formatRelativeTime', () => {
    it('formats relative time', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 5 * 60 * 1000)
      expect(formatRelativeTime(past)).toMatch(/minutes? ago/)

      const future = new Date(now.getTime() + 5 * 60 * 1000)
      expect(formatRelativeTime(future)).toMatch(/in.*minutes?/)
    })

    it('returns empty string for invalid dates', () => {
      expect(formatRelativeTime(null)).toBe('')
      expect(formatRelativeTime('invalid')).toBe('')
    })
  })

  describe('formatStock', () => {
    it('returns out of stock for zero or negative', () => {
      expect(formatStock(0)).toEqual({ text: 'Out of Stock', class: 'bg-red-100 text-red-700' })
      expect(formatStock(-5)).toEqual({ text: 'Out of Stock', class: 'bg-red-100 text-red-700' })
    })

    it('returns low stock warning for 1-10', () => {
      expect(formatStock(1)).toEqual({ text: 'Only 1 left', class: 'bg-amber-100 text-amber-700' })
      expect(formatStock(5)).toEqual({ text: 'Only 5 left', class: 'bg-amber-100 text-amber-700' })
      expect(formatStock(10)).toEqual({ text: 'Only 10 left', class: 'bg-amber-100 text-amber-700' })
    })

    it('returns in stock for > 10', () => {
      expect(formatStock(11)).toEqual({ text: 'In Stock', class: 'bg-green-100 text-green-700' })
      expect(formatStock(100)).toEqual({ text: 'In Stock', class: 'bg-green-100 text-green-700' })
    })
  })

  describe('formatProductStatus', () => {
    it('returns correct status for known values', () => {
      expect(formatProductStatus('active')).toEqual({ text: 'Active', class: 'bg-green-100 text-green-700' })
      expect(formatProductStatus('inactive')).toEqual({ text: 'Inactive', class: 'bg-slate-100 text-slate-700' })
      expect(formatProductStatus('out_of_stock')).toEqual({ text: 'Out of Stock', class: 'bg-red-100 text-red-700' })
    })

    it('returns fallback for unknown status', () => {
      expect(formatProductStatus('unknown')).toEqual({ text: 'unknown', class: 'bg-slate-100 text-slate-700' })
      expect(formatProductStatus('')).toEqual({ text: '', class: 'bg-slate-100 text-slate-700' })
    })
  })

  describe('formatOrderStatus', () => {
    it('returns correct status for all order statuses', () => {
      expect(formatOrderStatus('pending')).toEqual({ text: 'Pending', class: 'bg-amber-100 text-amber-700' })
      expect(formatOrderStatus('confirmed')).toEqual({ text: 'Confirmed', class: 'bg-blue-100 text-blue-700' })
      expect(formatOrderStatus('preparing')).toEqual({ text: 'Preparing', class: 'bg-purple-100 text-purple-700' })
      expect(formatOrderStatus('shipped')).toEqual({ text: 'Shipped', class: 'bg-indigo-100 text-indigo-700' })
      expect(formatOrderStatus('completed')).toEqual({ text: 'Completed', class: 'bg-green-100 text-green-700' })
      expect(formatOrderStatus('cancelled')).toEqual({ text: 'Cancelled', class: 'bg-red-100 text-red-700' })
    })

    it('returns fallback for unknown status', () => {
      expect(formatOrderStatus('unknown')).toEqual({ text: 'unknown', class: 'bg-slate-100 text-slate-700' })
    })
  })
})