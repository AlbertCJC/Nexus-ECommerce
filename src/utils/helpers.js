import { v4 as uuidv4 } from 'uuid'

export const generateId = (prefix = '') => `${prefix}${uuidv4().slice(0, 8)}`

export const filterProducts = (products, { search = '', categoryId = '', status = '' }) => {
  return products.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryId || p.categoryId === categoryId
    const matchesStatus = !status || p.status === status
    return matchesSearch && matchesCategory && matchesStatus
  })
}

export const sortProducts = (products, sortBy) => {
  const sorted = [...products]
  switch (sortBy) {
    case 'price-asc': return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc': return sorted.sort((a, b) => b.price - a.price)
    case 'name-asc': return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc': return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case 'newest': return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    default: return sorted
  }
}

export const getCategoryName = (categories, categoryId) => {
  const cat = categories.find(c => c.id === categoryId)
  return cat?.name || 'Unknown'
}

export const calculateOrderTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export const formatOrderNumber = (id) => `ORD-${id.toUpperCase().slice(0, 8)}`