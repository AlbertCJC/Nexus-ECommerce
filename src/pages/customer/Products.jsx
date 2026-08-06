import { useSearchParams } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'
import { useProducts, useCategories, useBrands } from '../../hooks'
import { ProductGrid } from '../../components/products/ProductGrid'
import { ProductFilters } from '../../components/products/ProductFilters'
import { useState } from 'react'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const brandParams = searchParams.getAll('brand')
  const sort = searchParams.get('sort') || 'newest'
  const debouncedSearch = useDebounce(search, 300)

  const { data: products = [], isLoading: productsLoading } = useProducts({
    search: debouncedSearch,
    categoryId: category,
    brandIds: brandParams,
    status: 'active',
    sortBy: sort,
  })

  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: brands = [], isLoading: brandsLoading } = useBrands()

  const isLoading = productsLoading || categoriesLoading || brandsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      <div className="bg-[rgb(var(--bg-card))] border-b border-[rgb(var(--border-subtle))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">All Products</h1>
          <p className="mt-1 text-[rgb(var(--text-muted))]">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Filters</h2>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]" aria-label="Close filters">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <ProductFilters onFilterChange={setSearchParams} categories={categories} brands={brands} products={products} />
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-outline flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg> Filters ({products.length})
          </button>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="mt-4 text-lg font-medium text-[rgb(var(--text-primary))]">No products found</h3>
                <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">Try adjusting your search or filters</p>
                <button onClick={() => setSearchParams({})} className="mt-4 btn-primary">Clear All Filters</button>
              </div>
            ) : (
              <ProductGrid products={products} categories={categories} brands={brands} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}