import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAppContext } from '../../context/AppContext'
import { useAddToCart, useUpdateCartQuantity, useRemoveFromCart } from '../../hooks'
import { formatCurrency, formatStock, formatProductStatus } from '../../utils/formatters'
import { getBrandName } from '../../utils/helpers'
import { Card } from '../ui/Card'
import Button from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Tooltip } from '../ui/Tooltip'
import { getCategoryIcon, getCategoryIconByName } from '../../utils/categoryIcons'

export function ProductCard({ product, categoryName, category, brands = [], compact = false }) {
  const { isAuthenticated, session } = useAuth()
  const { cart, openAuthModal, dispatch, addToast } = useAppContext()
  const addToCartMutation = useAddToCart()

  const isInCart = cart.some(item => item.productId === product.id)
  const stockInfo = formatStock(product.stock)
  const statusInfo = formatProductStatus(product.status)
  const canAddToCart = product.status === 'active' && product.stock > 0
  const brand = brands.find(b => b.id === product.brand_id)
  const brandName = brand ? brand.name : getBrandName(brands, product.brand_id)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (canAddToCart) {
      try {
        if (isAuthenticated && session?.user) {
          await addToCartMutation.mutateAsync({ userId: session.user.id, productId: product.id, quantity: 1 })
        } else {
          // Guest user: use localStorage cart via AppContext dispatch
          await addToCartMutation.mutateAsync({ productId: product.id, quantity: 1, guestCartDispatcher: (payload) => dispatch({ type: 'ADD_TO_CART', payload }) })
        }
        addToast({ type: 'success', message: `${product.name} added to cart` })
      } catch (error) {
        console.error('Failed to add to cart:', error)
        addToast({ type: 'error', message: 'Failed to add to cart' })
      }
    }
  }

  const handleQuantityChange = async (delta) => {
    const newQty = Math.max(0, Math.min(availableStock, quantityInCart + delta))
    if (isAuthenticated && session?.user) {
      try {
        if (newQty === 0) {
          await removeItemMutation.mutateAsync({ userId: session.user.id, productId: product.id })
        } else {
          await updateQtyMutation.mutateAsync({ userId: session.user.id, productId: product.id, quantity: newQty })
        }
      } catch (error) {
        console.error('Failed to update quantity:', error)
      }
    } else {
      // Guest: use localStorage via dispatch
      if (newQty === 0) {
        dispatch({ type: 'REMOVE_FROM_CART', payload: product.id })
      } else {
        dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId: product.id, quantity: newQty } })
      }
    }
  }

  const renderBrand = () => {
    if (!brand) return <span className="text-xs text-[rgb(var(--text-muted))]">{brandName}</span>
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgb(var(--accent-primary))/0.1] text-[rgb(var(--accent-primary))] text-xs font-medium">
        {brand.logo_url && <img src={brand.logo_url} alt="" className="w-3 h-3 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
        {brandName}
      </span>
    )
  }

  const CategoryIcon = category ? getCategoryIcon(category) : (categoryName ? getCategoryIconByName(categoryName) : getCategoryIconByName('mice'));

  if (compact) {
    return (
      <Link to={`/products/${product.id}`} className="flex gap-4 p-3 card hover:border-[rgb(var(--accent-primary))/0.5] transition-colors">
        <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" loading="lazy" onError={(e) => { e.currentTarget.src = '/images/placeholder-product.svg'; e.currentTarget.onerror = null; }} />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[rgb(var(--text-primary))] truncate">{product.name}</h4>
          <p className="text-sm text-[rgb(var(--accent-primary))] font-semibold">{formatCurrency(product.price_cents)}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${stockInfo.class}`}>{stockInfo.text}</span>
            {categoryName && (
              <span className="inline-flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                <CategoryIcon className="w-3 h-3" />
                {categoryName}
              </span>
            )}
            {renderBrand()}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Card className="flex flex-col h-full group" hover>
      <Link to={`/products/${product.id}`} className="block aspect-square relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-base))]">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onError={(e) => { e.currentTarget.src = '/images/placeholder-product.svg'; e.currentTarget.onerror = null; }} />
        {product.status !== 'active' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="bg-[rgb(var(--bg-elevated))/0.9] px-3 py-1 rounded text-sm font-medium text-[rgb(var(--text-muted))]">{statusInfo.text}</span></div>}
        {product.stock === 0 && product.status === 'active' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="bg-[rgb(var(--bg-elevated))/0.9] px-3 py-1 rounded text-sm font-medium text-[rgb(var(--accent-danger))]">Out of Stock</span></div>}
        <div className="absolute top-4 left-4 z-10 group-hover:scale-105 transition-transform duration-300">{renderBrand()}</div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Tooltip content={product.name} position="top">
            <h3 className="font-semibold text-[rgb(var(--text-primary))] line-clamp-1 flex-1">{product.name}</h3>
          </Tooltip>
          <span className={`badge ${statusInfo.class} flex-shrink-0`}>{statusInfo.text}</span>
        </div>
        <Tooltip content={product.description} position="bottom">
          <p className="text-sm text-[rgb(var(--text-muted))] line-clamp-2 mb-6 flex-1 overflow-hidden">{product.description}</p>
        </Tooltip>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-[rgb(var(--accent-primary))]">{formatCurrency(product.price_cents)}</p>
            <span className={`badge ${stockInfo.class} mt-2 inline-block`}>{stockInfo.text}</span>
          </div>
          <div className="flex gap-2">
            {canAddToCart ? (
              <button onClick={handleAddToCart} className="btn-primary px-3 py-1.5 text-sm" aria-label={`Add ${product.name} to cart`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </button>
            ) : (
              <button disabled className="btn-secondary px-3 py-1.5 text-sm opacity-50 cursor-not-allowed">Unavailable</button>
            )}
            <Link to={`/products/${product.id}`} className="btn-outline min-w-[44px] min-h-[44px] p-2" aria-label={`View ${product.name} details`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></Link>
          </div>
        </div>
      </div>
    </Card>
  )
}