import { format, formatDistanceToNow } from 'date-fns'

export const formatCurrency = (amount, currency = 'PHP') => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(amount)
}

export const formatDate = (date, pattern = 'MMM d, yyyy') => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return isNaN(d.getTime()) ? '' : format(d, pattern)
}

export const formatDateTime = (date) => formatDate(date, 'MMM d, yyyy h:mm a')

export const formatRelativeTime = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return isNaN(d.getTime()) ? '' : formatDistanceToNow(d, { addSuffix: true })
}

export const formatStock = (stock) => {
  if (stock <= 0) return { text: 'Out of Stock', class: 'badge-danger' }
  if (stock <= 10) return { text: `Only ${stock} left`, class: 'badge-warning' }
  return { text: 'In Stock', class: 'badge-success' }
}

export const formatProductStatus = (status) => {
  const statuses = {
    active: { text: 'Active', class: 'badge-success' },
    inactive: { text: 'Inactive', class: 'badge-neutral' },
    out_of_stock: { text: 'Out of Stock', class: 'badge-danger' }
  }
  return statuses[status] || { text: status, class: 'badge-neutral' }
}

export const formatOrderStatus = (status) => {
  const statuses = {
    pending: { text: 'Pending', class: 'bg-[rgb(var(--accent-warning))/0.1] text-[rgb(var(--accent-warning))] border border-[rgb(var(--accent-warning))/0.3]' },
    confirmed: { text: 'Confirmed', class: 'bg-[rgb(var(--accent-primary))/0.1] text-[rgb(var(--accent-primary))] border border-[rgb(var(--accent-primary))/0.3]' },
    preparing: { text: 'Preparing', class: 'bg-[rgb(var(--accent-secondary))/0.1] text-[rgb(var(--accent-secondary))] border border-[rgb(var(--accent-secondary))/0.3]' },
    shipped: { text: 'Shipped', class: 'bg-[rgb(var(--accent-info))/0.1] text-[rgb(var(--accent-info))] border border-[rgb(var(--accent-info))/0.3]' },
    completed: { text: 'Completed', class: 'bg-[rgb(var(--accent-success))/0.1] text-[rgb(var(--accent-success))] border border-[rgb(var(--accent-success))/0.3]' },
    cancelled: { text: 'Cancelled', class: 'bg-[rgb(var(--accent-danger))/0.1] text-[rgb(var(--accent-danger))] border border-[rgb(var(--accent-danger))/0.3]' }
  }
  return statuses[status] || { text: status, class: 'bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-muted))] border border-[rgb(var(--border-subtle))]' }
}