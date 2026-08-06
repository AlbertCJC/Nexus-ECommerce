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
  if (stock <= 0) return { text: 'Out of Stock', class: 'bg-red-100 text-red-700' }
  if (stock <= 10) return { text: `Only ${stock} left`, class: 'bg-amber-100 text-amber-700' }
  return { text: 'In Stock', class: 'bg-green-100 text-green-700' }
}

export const formatProductStatus = (status) => {
  const statuses = {
    active: { text: 'Active', class: 'bg-green-100 text-green-700' },
    inactive: { text: 'Inactive', class: 'bg-slate-100 text-slate-700' },
    out_of_stock: { text: 'Out of Stock', class: 'bg-red-100 text-red-700' }
  }
  return statuses[status] || { text: status, class: 'bg-slate-100 text-slate-700' }
}

export const formatOrderStatus = (status) => {
  const statuses = {
    pending: { text: 'Pending', class: 'bg-amber-100 text-amber-700' },
    confirmed: { text: 'Confirmed', class: 'bg-blue-100 text-blue-700' },
    preparing: { text: 'Preparing', class: 'bg-purple-100 text-purple-700' },
    shipped: { text: 'Shipped', class: 'bg-indigo-100 text-indigo-700' },
    completed: { text: 'Completed', class: 'bg-green-100 text-green-700' },
    cancelled: { text: 'Cancelled', class: 'bg-red-100 text-red-700' }
  }
  return statuses[status] || { text: status, class: 'bg-slate-100 text-slate-700' }
}