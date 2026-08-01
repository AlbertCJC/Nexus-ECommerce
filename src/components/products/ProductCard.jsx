import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { formatCurrency, formatStock, formatProductStatus } from '../../utils/formatters'
import { Card } from '../ui/Card'
import Button from '../ui/Button'

export function ProductCard({ product, categoryName, compact = false }) {
  const { dispatch, cart } = useAppContext()
  const isInCart = cart.some(item => item.productId === product.id)
  const cartItem = cart.find(item => item.productId === product.id)
  const stockInfo = formatStock(product.stock)
  const statusInfo = formatProductStatus(product.status)
  const canAddToCart = product.status === 'active' && product.stock > 0
  const quantityInCart = cartItem?.quantity || 0
  const availableStock = product.stock - quantityInCart

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (canAddToCart) {
      dispatch({ type: 'ADD_TO_CART', payload: { productId: product.id, quantity: 1 } })
    }
  }

  const handleQuantityChange = (delta) => {
    const newQty = Math.max(0, Math.min(availableStock, quantityInCart + delta))
    if (newQty === 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: product.id })
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId: product.id, quantity: newQty } })
    }
  }

  if (compact) {
    return (
      <Link to={`/products/${product.id}`} className="flex gap-4 p-3 bg-white rounded-lg border border-slate-200 hover:border-primary-300 transition-colors">
        <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" loading="lazy" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 truncate">{product.name}</h4>
          <p className="text-sm text-primary-600 font-semibold">{formatCurrency(product.price)}</p>
          <span className={`badge ${stockInfo.class}`}>{stockInfo.text}</span>
        </div>
      </Link>
    )
  }

  return (
    <Card className="flex flex-col h-full" hover>
      <Link to={`/products/${product.id}`} className="block aspect-square relative overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" />
        {product.status !== 'active' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="bg-white/90 px-3 py-1 rounded text-sm font-medium text-slate-700">{statusInfo.text}</span></div>}
        {product.stock === 0 && product.status === 'active' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="bg-white/90 px-3 py-1 rounded text-sm font-medium text-red-600">Out of Stock</span></div>}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1 flex-1">{product.name}</h3>
          <span className={`badge ${statusInfo.class} flex-shrink-0`}>{statusInfo.text}</span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-primary-600">{formatCurrency(product.price)}</p>
            <p className={`text-xs ${stockInfo.class.replace('bg-', 'text-').replace('100', '700')}`}>{stockInfo.text}</p>
          </div>
          <div className="flex gap-2">
            {canAddToCart ? (
              quantityInCart > 0 ? (
                <div className="flex items-center border border-slate-300 rounded-lg">
                  <button onClick={(e) => { e.stopPropagation(); handleQuantityChange(-1) }} className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-l-lg" aria-label="Decrease quantity">−</button>
                  <span className="px-3 py-1 text-sm font-medium w-8 text-center">{quantityInCart}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleQuantityChange(1) }} disabled={quantityInCart >= availableStock} className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-r-lg disabled:opacity-50" aria-label="Increase quantity">+</button>
                </div>
              ) : (
                <button onClick={handleAddToCart} className="btn-primary px-3 py-1.5 text-sm" aria-label={`Add ${product.name} to cart`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </button>
              )
            ) : (
              <button disabled className="btn-secondary px-3 py-1.5 text-sm opacity-50 cursor-not-allowed">Unavailable</button>
            )}
            <Link to={`/products/${product.id}`} className="btn-outline p-2" aria-label={`View ${product.name} details`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></Link>
          </div>
        </div>
      </div>
    </Card>
  )
}