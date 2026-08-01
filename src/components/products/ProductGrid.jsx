import { ProductCard } from './ProductCard'

export function ProductGrid({ products, categories, title, emptyMessage = 'No products found', compact = false }) {
  if (!products.length) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        <h3 className="mt-4 text-lg font-medium text-slate-900">{emptyMessage}</h3>
        <p className="mt-2 text-sm text-slate-500">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div>
      {title && <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>}
      <div className={`grid gap-4 sm:gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {products.map(product => {
          const category = categories.find(c => c.id === product.categoryId)
          return <ProductCard key={product.id} product={product} categoryName={category?.name} compact={compact} />
        })}
      </div>
    </div>
  )
}