import { Link } from 'react-router-dom'
import { useProducts, useCategories, useBrands } from '../../hooks'
import { ProductGrid } from '../../components/products/ProductGrid'
import { ArrowRightIcon, SparklesIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { getCategoryIcon, getCategoryGradient } from '../../utils/categoryIcons'

const features = [
  { icon: TruckIcon, title: 'Free Shipping', desc: 'On orders over ₱5,000' },
  { icon: ShieldCheckIcon, title: 'Secure Payment', desc: 'Multiple payment options' },
  { icon: ArrowPathIcon, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: SparklesIcon, title: 'Authentic Gear', desc: 'Official brand products' },
]

export default function Home() {
  const { data: products = [], isLoading: productsLoading } = useProducts({ status: 'active' })
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: brands = [], isLoading: brandsLoading } = useBrands()

  // Calculate product counts per category from actual products
  const categoryCounts = products.reduce((acc, p) => {
    if (p.category_id) acc[p.category_id] = (acc[p.category_id] || 0) + 1
    return acc
  }, {})

  const featured = products.filter(p => p.stock > 0).slice(0, 6)
  const isLoading = productsLoading || categoriesLoading || brandsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%2300ffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%2E')] opacity-50 animate-pulse-slow" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-500/15 rounded-full blur-3xl animate-pulse" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              New RGB Collection Just Dropped
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-300 to-purple-300 bg-clip-text text-transparent">
              NEXUS <span className="text-cyan-400">GAMING</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-xl">Premium gaming gear from Razer, Logitech G, ASUS ROG & more. Built for pros, priced for everyone.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/products" className="btn bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-slate-950 px-8 py-4 text-lg font-semibold shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02]">
                <ArrowRightIcon className="w-5 h-5 ml-2" />
                Shop Battle Station
              </Link>
              <Link to="/products?category=cat-mice" className="btn border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-4 text-lg font-medium transition-all duration-300">
                Gaming Mice
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(f => (
              <div key={f.title} className="text-center group">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-4 group-hover:border-cyan-500 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                  <f.icon className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Tech Style */}
      <section className="py-20 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Shop by Category</h2>
            <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">Curated collections for every gamer's arsenal</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map(category => {
              const count = categoryCounts[category.id] || 0
              const IconComponent = getCategoryIcon(category)
              const gradient = getCategoryGradient(category)
              return (
                <Link key={category.id} to={`/products?category=${category.id}`} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-500">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/50 to-black/80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Category icon with glow */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/50`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">{category.name}</h3>
                    <p className="text-cyan-400 text-xs mt-1 font-medium">{count} products</p>
                    {category.description && <p className="text-slate-500 text-xs mt-1 line-clamp-1">{category.description}</p>}
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Featured Gear</h2>
              <p className="mt-1 text-slate-400">Hand-picked favorites from top brands</p>
            </div>
            <Link to="/products" className="btn-outline border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
              View All <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <ProductGrid products={featured} categories={categories} brands={brands} />
        </div>
      </section>

      {/* Brand Showcase */}
      <section className="py-16 bg-slate-950 border-y border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Trusted by Champions</h2>
            <p className="mt-2 text-slate-400">Official gear from the world's top gaming brands</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-300">
            {brands.slice(0, 9).map(brand => (
              <img key={brand.id} src={brand.logo_url || brand.logo} alt={brand.name} className="h-8 sm:h-10 filter grayscale transition-all duration-300 hover:grayscale-0 hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}