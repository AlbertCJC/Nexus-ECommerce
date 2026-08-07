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
      expect(formatStock(0)).toEqual({ text: 'Out of Stock', class: 'badge-danger' })
      expect(formatStock(-5)).toEqual({ text: 'Out of Stock', class: 'badge-danger' })
    })

    it('returns low stock warning for 1-10', () => {
      expect(formatStock(1)).toEqual({ text: 'Only 1 left', class: 'badge-warning' })
      expect(formatStock(5)).toEqual({ text: 'Only 5 left', class: 'badge-warning' })
      expect(formatStock(10)).toEqual({ text: 'Only 10 left', class: 'badge-warning' })
    })

    it('returns in stock for > 10', () => {
      expect(formatStock(11)).toEqual({ text: 'In Stock', class: 'badge-success' })
      expect(formatStock(100)).toEqual({ text: 'In Stock', class: 'badge-success' })
    })
  })

  describe('formatProductStatus', () => {
    it('returns correct status for known values', () => {
      expect(formatProductStatus('active')).toEqual({ text: 'Active', class: 'badge-success' })
      expect(formatProductStatus('inactive')).toEqual({ text: 'Inactive', class: 'badge-neutral' })
      expect(formatProductStatus('out_of_stock')).toEqual({ text: 'Out of Stock', class: 'badge-danger' })
    })

    it('returns fallback for unknown status', () => {
      expect(formatProductStatus('unknown')).toEqual({ text: 'unknown', class: 'badge-neutral' })
      expect(formatProductStatus('')).toEqual({ text: '', class: 'badge-neutral' })
    })
  })

  describe('formatOrderStatus', () => {
    it('returns correct status for all order statuses', () => {
      expect(formatOrderStatus('pending')).toEqual({ text: 'Pending', class: 'bg-[rgb(var(--accent-warning))/0.1] text-[rgb(var(--accent-warning))] border border-[rgb(var(--accent-warning))/0.3]' })
      expect(formatOrderStatus('confirmed')).toEqual({ text: 'Confirmed', class: 'bg-[rgb(var(--accent-primary))/0.1] text-[rgb(var(--accent-primary))] border border-[rgb(var(--accent-primary))/0.3]' })
      expect(formatOrderStatus('preparing')).toEqual({ text: 'Preparing', class: 'bg-[rgb(var(--accent-secondary))/0.1] text-[rgb(var(--accent-secondary))] border border-[rgb(var(--accent-secondary))/0.3]' })
      expect(formatOrderStatus('shipped')).toEqual({ text: 'Shipped', class: 'bg-[rgb(var(--accent-info))/0.1] text-[rgb(var(--accent-info))] border border-[rgb(var(--accent-info))/0.3]' })
      expect(formatOrderStatus('completed')).toEqual({ text: 'Completed', class: 'bg-[rgb(var(--accent-success))/0.1] text-[rgb(var(--accent-success))] border border-[rgb(var(--accent-success))/0.3]' })
      expect(formatOrderStatus('cancelled')).toEqual({ text: 'Cancelled', class: 'bg-[rgb(var(--accent-danger))/0.1] text-[rgb(var(--accent-danger))] border border-[rgb(var(--accent-danger))/0.3]' })
    })

    it('returns fallback for unknown status', () => {
      expect(formatOrderStatus('unknown')).toEqual({ text: 'unknown', class: 'bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-muted))] border border-[rgb(var(--border-subtle))]' })
    })
  })
})