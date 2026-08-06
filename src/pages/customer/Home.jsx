import { Link } from 'react-router-dom'
import { useProducts, useCategories, useBrands } from '../../hooks'
import { ProductGrid } from '../../components/products/ProductGrid'
import { ArrowRightIcon, SparklesIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const features = [
  { icon: TruckIcon, title: 'Free Shipping', desc: 'On orders over ₱5,000' },
  { icon: ShieldCheckIcon, title: 'Secure Payment', desc: 'Multiple payment options' },
  { icon: ArrowPathIcon, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: SparklesIcon, title: 'Authentic Gear', desc: 'Official brand products' },
]

// Category SVG Icons - Gaming/Esports theme with distinctive designs
const CategoryIcons = {
  mice: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="mouseGrad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#06b6d4"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
      </defs>
      {/* Gaming mouse body */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="url(#mouseGrad)" d="M4 10c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6v6c0 3.3-2.7 6-6 6h-4c-3.3 0-6-2.7-6-6v-6z"/>
      {/* Mouse buttons */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="url(#mouseGrad)" d="M6 10h12M8 10v8M16 10v8"/>
      {/* Scroll wheel */}
      <ellipse cx="12" cy="12" rx="1.5" ry="2" stroke="url(#mouseGrad)" strokeWidth={1.5} fill="none"/>
      {/* DPI indicator dots */}
      <circle cx="10" cy="18" r="1.2" fill="#06b6d4"/>
      <circle cx="14" cy="18" r="1.2" fill="#a855f7"/>
      {/* Sensor light */}
      <circle cx="12" cy="20" r="0.8" fill="#22c55e"/>
    </svg>
  ),
  keyboards: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="kbGrad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#a855f7"/>
          <stop offset="100%" stopColor="#ec4899"/>
        </linearGradient>
      </defs>
      {/* Keyboard base */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="url(#kbGrad)" d="M3 5h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2z"/>
      {/* Key rows */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="url(#kbGrad)" d="M6 9h12M6 12h12M6 15h12M6 18h12"/>
      {/* Key columns */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} stroke="url(#kbGrad)" d="M7 9v9M9 9v9M11 9v9M13 9v9M15 9v9M17 9v9"/>
      {/* RGB indicator */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#06b6d4" d="M5 10.5c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#a855f7" d="M10.5 10.5c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#ec4899" d="M16 10.5c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5"/>
      {/* ESC key */}
      <rect x="4" y="6" width="3" height="3" rx="0.5" fill="url(#kbGrad)"/>
    </svg>
  ),
  headsets: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="hsGrad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#22c55e"/>
          <stop offset="100%" stopColor="#16a34a"/>
        </linearGradient>
      </defs>
      {/* Headband */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} stroke="url(#hsGrad)" d="M5 8c0-4 4-6 9-6s9 2 9 6"/>
      {/* Ear cups */}
      <ellipse cx="5" cy="8" rx="3" ry="4" stroke="url(#hsGrad)" strokeWidth={2} fill="none"/>
      <ellipse cx="19" cy="8" rx="3" ry="4" stroke="url(#hsGrad)" strokeWidth={2} fill="none"/>
      {/* Ear cup inner glow */}
      <ellipse cx="5" cy="8" rx="1.5" ry="2" fill="url(#hsGrad)" fillOpacity="0.3"/>
      <ellipse cx="19" cy="8" rx="1.5" ry="2" fill="url(#hsGrad)" fillOpacity="0.3"/>
      {/* Microphone boom */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="url(#hsGrad)" d="M2.5 10l-1.5-4M1 5.5h2.5"/>
      {/* Mic LED */}
      <circle cx="1" cy="4" r="0.6" fill="#ef4444"/>
      {/* Audio waves */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#06b6d4" d="M22 5c0 1.5-1.5 3-3 3M22 8c0 1.5-1.5 3-3 3M22 11c0 1.5-1.5 3-3 3"/>
    </svg>
  ),
  monitors: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="monGrad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#ef4444"/>
        </linearGradient>
      </defs>
      {/* Monitor screen */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="url(#monGrad)" d="M3 4h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z"/>
      {/* Stand neck */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} stroke="url(#monGrad)" d="M12 16v3"/>
      {/* Stand base */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} stroke="url(#monGrad)" d="M6 19h12"/>
      {/* Refresh rate badge */}
      <rect x="14" y="5" width="28" height="12" rx="2" transform="scale(0.5)" fill="url(#monGrad)"/>
      <text textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="white" fontFamily="monospace">240</text>
      <text textAnchor="middle" fontSize="2.5" fontWeight="bold" fill="white" fontFamily="monospace">Hz</text>
      {/* Crosshair in center */}
      <circle cx="12" cy="12" r="3" stroke="#06b6d4" strokeWidth={1} fill="none"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} stroke="#06b6d4" d="M12 9v6M9 12h6"/>
      {/* G-Sync/FreeSync indicator */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#22c55e" d="M4 18l2-3 2 3 2-3 2 3"/>
    </svg>
  ),
  laptops: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="lapGrad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
      </defs>
      {/* Laptop screen */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="url(#lapGrad)" d="M4 3h16a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2z"/>
      {/* Screen content: game window */}
      <rect x="6" y="5" width="12" height="5" rx="1" stroke="#06b6d4" strokeWidth={1} fill="none"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} stroke="#06b6d4" d="M12 5v2M12 9v2"/>
      {/* Laptop base/keyboard - more compact */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="url(#lapGrad)" d="M3 10.5h18a1.5 1.5 0 011.5 1.5v2.5a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5v-2.5a1.5 1.5 0 011.5-1.5z"/>
      {/* Keyboard keys */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} stroke="url(#lapGrad)" d="M6 12.5h12M6 14.5h12"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} stroke="url(#lapGrad)" d="M7 12.5v2M9 12.5v2M11 12.5v2M13 12.5v2M15 12.5v2M17 12.5v2"/>
      {/* Trackpad */}
      <rect x="9" y="15.5" width="6" height="1.5" rx="0.5" fill="url(#lapGrad)" fillOpacity="0.5"/>
      {/* RGB strip on base */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#06b6d4" d="M4 13h16"/>
      {/* Power LED */}
      <circle cx="19" cy="17" r="0.6" fill="#22c55e"/>
    </svg>
  ),
  components: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="compGrad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#ef4444"/>
          <stop offset="100%" stopColor="#f43f5e"/>
        </linearGradient>
      </defs>
      {/* GPU Card */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="url(#compGrad)" d="M3 6h18a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z"/>
      {/* GPU Fans */}
      <circle cx="8" cy="11" r="2.5" stroke="url(#compGrad)" strokeWidth={1.5} fill="none"/>
      <circle cx="8" cy="11" r="1" fill="url(#compGrad)"/>
      <circle cx="16" cy="11" r="2.5" stroke="url(#compGrad)" strokeWidth={1.5} fill="none"/>
      <circle cx="16" cy="11" r="1" fill="url(#compGrad)"/>
      {/* PCB lines */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} stroke="url(#compGrad)" d="M5 10h14M5 12h14M5 14h14"/>
      {/* PCIe connector */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="#06b6d4" d="M18 10v6"/>
      <rect x="17.5" y="10" width="1" height="6" fill="#06b6d4"/>
      {/* RAM stick - shifted down */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#a855f7" d="M4 5h4v14H4z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} stroke="#a855f7" d="M5 8h2M5 11h2M5 14h2"/>
      {/* RGB on RAM */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#06b6d4" d="M4 5h4M4 17h4"/>
      {/* CPU socket */}
      <rect x="10" y="2" width="4" height="4" rx="0.5" stroke="#f97316" strokeWidth={1.5} fill="none"/>
      <rect x="10.5" y="2.5" width="3" height="3" rx="0.3" fill="#f97316" fillOpacity="0.3"/>
    </svg>
  ),
  accessories: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="accGrad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#14b8a6"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
      </defs>
      {/* Mousepad */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="url(#accGrad)" d="M3 7h18a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"/>
      {/* Stitched edge */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} stroke="url(#accGrad)" strokeDasharray="2,2" d="M4 8h16v8H4z"/>
      {/* Mouse on pad */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#06b6d4" d="M9 12c0-1.5 1.2-2.7 2.7-2.7h2.6c1.5 0 2.7 1.2 2.7 2.7v3c0 1.5-1.2 2.7-2.7 2.7h-2.6c-1.5 0-2.7-1.2-2.7-2.7v-3z"/>
      <ellipse cx="12" cy="13.5" rx="1" ry="1.5" fill="#06b6d4"/>
      {/* Headset stand */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="url(#accGrad)" d="M19 15v-4a2 2 0 00-2-2h-3a2 2 0 00-2 2v4"/>
      <ellipse cx="16" cy="11" rx="2" ry="1.5" stroke="url(#accGrad)" strokeWidth={1.5} fill="none"/>
      {/* Cable */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#a855f7" d="M4 15c0 2 2 3 4 3s4-1 4-3"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#a855f7" d="M8 15v-2c0-1.5 1.2-2.7 2.7-2.7"/>
      {/* Cable tie */}
      <rect x="9" y="11" width="2" height="3" rx="0.5" fill="#a855f7"/>
      {/* RGB accent */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} stroke="#06b6d4" d="M5 13h14"/>
    </svg>
  ),
}

// Gradient config by category name (case-insensitive)
const categoryGradients = {
  mice: 'from-cyan-500 to-blue-600',
  mouse: 'from-cyan-500 to-blue-600',
  keyboard: 'from-purple-500 to-pink-600',
  keyboards: 'from-purple-500 to-pink-600',
  headset: 'from-green-500 to-emerald-600',
  headsets: 'from-green-500 to-emerald-600',
  monitor: 'from-orange-500 to-red-600',
  monitors: 'from-orange-500 to-red-600',
  laptop: 'from-indigo-500 to-purple-600',
  laptops: 'from-indigo-500 to-purple-600',
  pc: 'from-indigo-500 to-purple-600',
  component: 'from-red-500 to-rose-600',
  components: 'from-red-500 to-rose-600',
  accessory: 'from-teal-500 to-cyan-600',
  accessories: 'from-teal-500 to-cyan-600',
  default: 'from-slate-500 to-slate-700',
}

function getCategoryIcon(name) {
  const key = name.toLowerCase().replace(/[^a-z]/g, '')
  return CategoryIcons[key] || CategoryIcons.mice
}

function getCategoryGradient(name) {
  const key = name.toLowerCase().replace(/[^a-z]/g, '')
  return categoryGradients[key] || categoryGradients.default
}

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
              const icon = getCategoryIcon(category.name)
              const gradient = getCategoryGradient(category.name)
              return (
                <Link key={category.id} to={`/products?category=${category.id}`} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-500">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/50 to-black/80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Category icon with glow */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/50`}>
                      <span>{icon}</span>
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