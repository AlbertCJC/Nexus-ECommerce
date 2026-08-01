import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { filterProducts } from '../../utils/helpers'
import { ProductGrid } from '../../components/products/ProductGrid'
import { ArrowRightIcon, SparklesIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const features = [
  { icon: TruckIcon, title: 'Free Shipping', desc: 'On orders over $100' },
  { icon: ShieldCheckIcon, title: 'Secure Payment', desc: 'Multiple payment options' },
  { icon: ArrowPathIcon, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: SparklesIcon, title: 'Quality Guaranteed', desc: 'Curated selection' },
]

const categories = [
  { id: 'cat-1', name: 'Electronics', image: 'https://picsum.photos/seed/electronics/400/300.jpg', count: 3 },
  { id: 'cat-2', name: 'Clothing', image: 'https://picsum.photos/seed/clothing/400/300.jpg', count: 3 },
  { id: 'cat-3', name: 'Books', image: 'https://picsum.photos/seed/books/400/300.jpg', count: 3 },
  { id: 'cat-4', name: 'Home & Garden', image: 'https://picsum.photos/seed/home/400/300.jpg', count: 3 },
]

export function Home() {
  const { products, categories: allCategories } = useAppContext()
  const featured = filterProducts(products, { status: 'active' }).filter(p => p.stock > 0).slice(0, 6)

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">CodeCraft Store</h1>
            <p className="mt-6 text-lg sm:text-xl text-primary-100 max-w-xl">Discover curated tech, fashion, books & home essentials. Quality products, fair prices, delivered to your door.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products" className="btn bg-white text-primary-600 hover:bg-primary-50 px-6 py-3 text-lg">Shop Now <ArrowRightIcon className="w-5 h-5 ml-2" /></Link>
              <Link to="/products?category=cat-1" className="btn border-2 border-white text-white hover:bg-primary-700 px-6 py-3 text-lg">Electronics</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(f => (
              <div key={f.title} className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-primary-600" /></div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Shop by Category</h2>
            <p className="mt-2 text-lg text-slate-500">Explore our curated collections</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(cat => {
              const category = allCategories.find(c => c.id === cat.id)
              return (
                <Link key={cat.id} to={`/products?category=${cat.id}`} className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold text-white">{cat.name}</h3>
                    <p className="text-primary-200 text-sm">{category?.description || ''}</p>
                    <p className="text-white/80 text-sm mt-1">{cat.count} products</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Featured Products</h2>
              <p className="mt-1 text-slate-500">Hand-picked favorites from our collection</p>
            </div>
            <Link to="/products" className="btn-outline">View All <ArrowRightIcon className="w-4 h-4 ml-2" /></Link>
          </div>
          <ProductGrid products={featured} categories={allCategories} />
        </div>
      </section>
    </div>
  )
}