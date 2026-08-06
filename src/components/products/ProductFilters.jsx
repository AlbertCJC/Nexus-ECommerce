import { useSearchParams } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'
import Select from '../ui/Select'
import Checkbox from '../ui/Checkbox'
import { useState } from 'react'

export function ProductFilters({ onFilterChange, categories = [], brands = [], products = [] }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const brandParams = searchParams.getAll('brand')
  const sort = searchParams.get('sort') || 'newest'
  const debouncedSearch = useDebounce(search, 300)
  const [expandedBrands, setExpandedBrands] = useState(false)

  // Calculate product counts per brand
  const brandCounts = products.reduce((acc, p) => {
    if (p.brand_id) acc[p.brand_id] = (acc[p.brand_id] || 0) + 1
    return acc
  }, {})

  const handleSearchChange = (e) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams)
    if (value) params.set('search', value)
    else params.delete('search')
    params.delete('page')
    setSearchParams(params)
  }

  const handleCategoryChange = (e) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams)
    if (value) params.set('category', value)
    else params.delete('category')
    params.delete('page')
    setSearchParams(params)
  }

  const handleBrandChange = (brandId) => {
    const params = new URLSearchParams(searchParams)
    const current = params.getAll('brand')
    if (current.includes(brandId)) {
      params.delete('brand', brandId)
    } else {
      params.append('brand', brandId)
    }
    params.delete('page')
    setSearchParams(params)
  }

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', e.target.value)
    params.delete('page')
    setSearchParams(params)
  }

  const hasFilters = debouncedSearch || category || brandParams.length > 0
  const clearFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.delete('category')
    params.delete('brand')
    params.delete('page')
    setSearchParams(params)
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="search" className="sr-only">Search products</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" id="search" value={search} onChange={handleSearchChange} placeholder="Search products..." className="input pl-10" />
        </div>
      </div>
      <Select label="Category" id="category" options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} value={category} onChange={handleCategoryChange} placeholder="All Categories" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label">Brand</label>
          <button type="button" onClick={() => setExpandedBrands(!expandedBrands)} className="text-sm text-[rgb(var(--accent-primary))] hover:underline">
            {expandedBrands ? 'Show less' : `Show all (${brands.length})`}
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {brands.slice(0, expandedBrands ? brands.length : 6).map(brand => (
            <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox value={brand.id} checked={brandParams.includes(brand.id)} onChange={() => handleBrandChange(brand.id)} />
              <span className="text-sm text-[rgb(var(--text-secondary))]">{brand.name}</span>
              <span className="text-xs text-[rgb(var(--text-muted))] ml-auto">({brandCounts[brand.id] || 0})</span>
            </label>
          ))}
        </div>
      </div>

      <Select label="Sort By" id="sort" options={[
        { value: 'newest', label: 'Newest' },
        { value: 'price-asc', label: 'Price: Low to High' },
        { value: 'price-desc', label: 'Price: High to Low' },
        { value: 'name-asc', label: 'Name: A-Z' },
        { value: 'name-desc', label: 'Name: Z-A' }
      ]} value={sort} onChange={handleSortChange} />
      {hasFilters && <button onClick={clearFilters} className="w-full btn-outline text-sm"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Clear Filters</button>}
    </div>
  )
}