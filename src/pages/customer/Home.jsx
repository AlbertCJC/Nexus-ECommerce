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
      <div className="min-h-screen bg-[rgb(var(--bg-base))] text-[rgb(var(--text-primary))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))] text-[rgb(var(--text-primary))]">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-grad-hero">
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22rgb(var(--accent-primary))%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%2E')] opacity-50 animate-pulse-slow" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[rgb(var(--accent-primary))/0.2] rounded-full blur-3xl animate-float will-change-transform-opacity" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[rgb(var(--accent-secondary))/0.2] rounded-full blur-3xl animate-float-delayed will-change-transform-opacity" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[rgb(var(--accent-success))/0.15] rounded-full blur-3xl animate-pulse will-change-opacity" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgb(var(--accent-primary))/0.1] border border-[rgb(var(--accent-primary))/0.3] text-[rgb(var(--accent-primary))] text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-[rgb(var(--accent-primary))] animate-pulse" />
              New RGB Collection Just Dropped
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[rgb(var(--text-primary))] mb-6">
              NEXUS <span className="text-[rgb(var(--accent-primary))]">GAMING</span>
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-[rgb(var(--text-secondary))] max-w-xl">Premium gaming gear from Razer, Logitech G, ASUS ROG & more. Built for pros, priced for everyone.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary px-8 py-4 text-lg font-semibold shadow-glow hover:scale-[1.02]">
                <ArrowRightIcon className="w-5 h-5 ml-2" />
                Shop Battle Station
              </Link>
              <Link to="/products?category=cat-mice" className="btn-outline border-[rgb(var(--accent-primary))/0.5] text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))/0.1] px-8 py-4 text-lg font-medium transition-all duration-300">
                Gaming Mice
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-[rgb(var(--bg-base))/0.5] border-y border-[rgb(var(--border-subtle))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(f => (
              <div key={f.title} className="text-center group">
                <div className="mx-auto w-14 h-14 bg-grad-primary/20 border border-[rgb(var(--accent-primary))/0.3] rounded-2xl flex items-center justify-center mb-4 group-hover:border-[rgb(var(--accent-primary))] group-hover:shadow-lg group-hover:shadow-[rgb(var(--accent-primary))/0.2] transition-all duration-300">
                  <f.icon className="w-7 h-7 text-[rgb(var(--accent-primary))]" />
                </div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))]">{f.title}</h3>
                <p className="text-sm text-[rgb(var(--text-muted))] mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Tech Style */}
      <section className="py-20 bg-[rgb(var(--bg-deep))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--text-primary))]">Shop by Category</h2>
            <p className="mt-3 text-lg text-[rgb(var(--text-secondary))] max-w-2xl mx-auto">Curated collections for every gamer's arsenal</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map(category => {
              const count = categoryCounts[category.id] || 0
              const IconComponent = getCategoryIcon(category)
              const gradient = getCategoryGradient(category)
              return (
                <Link key={category.id} to={`/products?category=${category.id}`} className="group relative aspect-square rounded-2xl overflow-hidden bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent-primary))/0.5] transition-all duration-500 min-w-0">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[rgb(var(--bg-base))/0.5] to-[rgb(var(--bg-deep))/0.8]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--bg-deep))/0.8] via-transparent to-transparent" />

                  {/* Category icon with glow */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/50`}>
                      <IconComponent className="w-6 h-6 text-[rgb(var(--text-primary))]" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent-primary))] transition-colors duration-300">{category.name}</h3>
                    <p className="text-[rgb(var(--accent-primary))] text-xs mt-1 font-medium">{count} products</p>
                    {category.description && <p className="text-[rgb(var(--text-muted))] text-xs mt-1 line-clamp-1">{category.description}</p>}
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--accent-primary))/0.2] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[rgb(var(--bg-base))/0.5] border-y border-[rgb(var(--border-subtle))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--text-primary))]">Featured Gear</h2>
              <p className="mt-1 text-[rgb(var(--text-secondary))]">Hand-picked favorites from top brands</p>
            </div>
            <Link to="/products" className="btn-outline border-[rgb(var(--accent-primary))/0.5] text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))/0.1]">
              View All <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <ProductGrid products={featured} categories={categories} brands={brands} />
        </div>
      </section>

      {/* Brand Showcase */}
      <section className="py-16 bg-[rgb(var(--bg-deep))] border-y border-[rgb(var(--border-subtle))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Trusted by Champions</h2>
            <p className="mt-2 text-[rgb(var(--text-secondary))]">Official gear from the world's top gaming brands</p>
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