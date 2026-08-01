import { useAppContext } from '../../context/AppContext'
import { ProductGrid } from './ProductGrid'
import { filterProducts } from '../../utils/helpers'

export function RelatedProducts({ currentProductId, categoryId, limit = 4 }) {
  const { products, categories } = useAppContext()
  const related = filterProducts(products, { categoryId, status: 'active' })
    .filter(p => p.id !== currentProductId && p.stock > 0)
    .slice(0, limit)

  if (!related.length) return null

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">You May Also Like</h2>
      <ProductGrid products={related} categories={categories} />
    </section>
  )
}