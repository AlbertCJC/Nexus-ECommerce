import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAppContext } from '../../context/AppContext'
import { useProduct, useCategories, useBrands, useAddToCart } from '../../hooks'
import { formatCurrency, formatStock, formatProductStatus } from '../../utils/formatters'
import { RelatedProducts } from '../../components/products/RelatedProducts'
import { useState } from 'react'
import Button from '../../components/ui/Button'
import { getCategoryIcon, getCategoryIconByName } from '../../utils/categoryIcons'

const features = [
  { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, title: 'Free Shipping', desc: 'On orders over ₱5,000' },
  { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, title: 'Secure Checkout', desc: 'Multiple payment options' },
  { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>, title: 'Easy Returns', desc: '30-day return policy' },
]

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, session } = useAuth()
  const { openAuthModal, dispatch } = useAppContext()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const addToCartMutation = useAddToCart()

  const { data: product, isLoading: productLoading, error: productError } = useProduct(id)

  const { data: categories = [] } = useCategories()
  const { data: brands = [] } = useBrands()

  if (productLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" /></div>
  }

  if (productError || !product) return <div className="min-h-screen flex items-center justify-center"><p className="text-[rgb(var(--text-muted))]">Product not found</p></div>

  const category = categories.find(c => c.id === product.category_id)
  const brand = brands.find(b => b.id === product.brand_id)
  const availableStock = product.stock
  const stockInfo = formatStock(product.stock)
  const statusInfo = formatProductStatus(product.status)
  const canAddToCart = product.status === 'active' && availableStock > 0
  const maxQty = availableStock

  const handleAddToCart = async () => {
    if (canAddToCart) {
      try {
        if (isAuthenticated && session?.user) {
          await addToCartMutation.mutateAsync({ userId: session.user.id, productId: product.id, quantity })
        } else {
          // Guest user: use localStorage cart via AppContext dispatch
          await addToCartMutation.mutateAsync({ productId: product.id, quantity, guestCartDispatcher: (payload) => dispatch({ type: 'ADD_TO_CART', payload }) })
        }
      } catch (error) {
        console.error('Failed to add to cart:', error)
      }
    }
  }

  const handleViewCart = () => {
    navigate('/cart')
  }

  const images = [product.image_url].filter(Boolean)

  const CategoryIcon = category ? getCategoryIcon(category) : getCategoryIconByName('mice');

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      <div className="bg-[rgb(var(--bg-card))] border-b border-[rgb(var(--border-subtle))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/products" className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-primary))]"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Products</Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square rounded-xl overflow-hidden bg-[rgb(var(--bg-elevated))] mb-4">
              <img src={images[selectedImage] || '/images/placeholder-product.svg'} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/images/placeholder-product.svg'; e.currentTarget.onerror = null; }} />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === idx ? 'border-[rgb(var(--accent-primary))]' : 'border-transparent hover:border-[rgb(var(--border-hover))]'}`} aria-label={`View image ${idx + 1}`} aria-current={selectedImage === idx ? 'true' : 'false'}>
                  <img src={img} alt={`${product.name} - view ${idx + 1}`} className="w-full h-full object-cover" loading={idx === 0 ? 'eager' : 'lazy'} onError={(e) => { e.currentTarget.src = '/images/placeholder-product.svg'; e.currentTarget.onerror = null; }} />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgb(var(--accent-primary))/0.1] text-[rgb(var(--accent-primary))] text-sm font-medium">
                <CategoryIcon className="w-4 h-4" />
                {category?.name || 'Uncategorized'}
              </span>
              {brand && (
                <Link to={`/products?brand=${brand.id}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgb(var(--accent-primary))/0.1] text-[rgb(var(--accent-primary))] text-xs font-medium hover:bg-[rgb(var(--accent-primary))/0.2] transition-colors">
                  {brand.logo_url && <img src={brand.logo_url} alt="" className="w-3 h-3 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                  {brand.name}
                </Link>
              )}
            </div>
            <h1 className="mt-6 text-3xl font-bold text-[rgb(var(--text-primary))]">{product.name}</h1>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-3xl font-bold text-[rgb(var(--accent-primary))]">{formatCurrency(product.price_cents / 100)}</span>
              <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-[rgb(var(--text-muted))]">
              <span className="flex items-center gap-1">{stockInfo.text}</span>
              {product.stock > 0 && product.stock <= 10 && <span className="text-[rgb(var(--accent-warning))] font-medium">Only {product.stock} left!</span>}
            </div>

            <div className="mt-6 border-t border-[rgb(var(--border-subtle))] pt-6">
              <p className="text-[rgb(var(--text-secondary))] leading-relaxed">{product.description || 'No description available.'}</p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="mt-8">
              {canAddToCart ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-4">
                      <label htmlFor="quantity" className="text-sm font-medium text-[rgb(var(--text-primary))]">Quantity:</label>
                      <div className="flex items-center border border-[rgb(var(--border-subtle))] rounded-lg">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="min-w-[44px] min-h-[44px] px-4 py-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] disabled:opacity-50 flex items-center justify-center" aria-label="Decrease quantity">−</button>
                        <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))} min={1} max={maxQty} className="w-16 text-center border-x border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-elevated))] focus:outline-none" aria-label="Quantity" />
                        <button onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} disabled={quantity >= maxQty} className="min-w-[44px] min-h-[44px] px-4 py-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] disabled:opacity-50 flex items-center justify-center" aria-label="Increase quantity">+</button>
                      </div>
                    </div>
                    <p className="mt-4 sm:mt-0 sm:self-center text-sm text-[rgb(var(--text-muted))]">Available: <span className="font-medium text-[rgb(var(--text-primary))]">{availableStock}</span></p>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button onClick={handleAddToCart} size="lg" className="flex-1" loading={addToCartMutation.isPending}>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> Add to Cart
                    </Button>
                    <Button onClick={handleViewCart} variant="outline" className="flex-1 sm:flex-none">
                      <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> View Cart
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-[rgb(var(--bg-elevated))] rounded-lg text-center">
                  <p className="text-[rgb(var(--text-secondary))]">This product is currently unavailable.</p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-3 gap-6">
              {features.map(f => (
                <div key={f.title} className="flex items-center gap-3 p-4 bg-[rgb(var(--bg-elevated))] rounded-lg">
                  <div className="w-10 h-10 bg-[rgb(var(--accent-primary))/0.1] rounded-lg flex items-center justify-center">{f.icon}</div>
                  <div><p className="font-medium text-[rgb(var(--text-primary))] text-sm">{f.title}</p><p className="text-xs text-[rgb(var(--text-muted))]">{f.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts currentProductId={product.id} categoryId={product.category_id} />
      </div>
    </div>
  )
}