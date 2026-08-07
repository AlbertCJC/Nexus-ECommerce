import { ProductCard } from './ProductCard'

export function ProductGrid({ products, categories, brands = [], title, emptyMessage = 'No products found', compact = false, isLoading = false }) {
  if (!products.length && !isLoading) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-16 w-16 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8-4v10M4 7v10l8 4" /></svg>
        <h3 className="mt-4 text-lg font-medium text-[rgb(var(--text-primary))]">{emptyMessage}</h3>
        <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div>
      {title && <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">{title}</h2>}
      <div className={`grid gap-4 sm:gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {isLoading && products.length === 0 && (
          <>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-[rgb(var(--bg-muted))]" />
                <div className="mt-3 h-4 w-3/4 bg-[rgb(var(--bg-muted))] rounded" />
                <div className="mt-2 h-4 w-1/2 bg-[rgb(var(--bg-muted))] rounded" />
                <div className="mt-2 h-4 w-1/3 bg-[rgb(var(--bg-muted))] rounded" />
              </div>
            ))}
          </>
        )}
        {products.map(product => {
          const category = categories.find(c => c.id === product.category_id)
          return <ProductCard key={product.id} product={product} categoryName={category?.name} brands={brands} compact={compact} />
        })}
      </div>
    </div>
  )
}