import { useAppContext } from '../../context/AppContext'
import { formatCurrency } from '../../utils/formatters'

export function CartItem({ item, product }) {
  const { dispatch } = useAppContext()
  const availableStock = product.stock
  const lineTotal = product.price * item.quantity

  const handleQuantityChange = (delta) => {
    const newQty = Math.max(1, Math.min(availableStock, item.quantity + delta))
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId: product.id, quantity: newQty } })
  }

  const handleRemove = () => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: product.id })
  }

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-slate-200">
      <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" loading="lazy" />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-slate-900 truncate">{product.name}</h3>
        <p className="text-sm text-slate-500">{formatCurrency(product.price)} each</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-slate-300 rounded-lg">
            <button onClick={() => handleQuantityChange(-1)} disabled={item.quantity <= 1} className="px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50" aria-label="Decrease quantity">−</button>
            <span className="px-3 py-1 text-sm font-medium w-10 text-center border-x border-slate-300">{item.quantity}</span>
            <button onClick={() => handleQuantityChange(1)} disabled={item.quantity >= availableStock} className="px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50" aria-label="Increase quantity">+</button>
          </div>
          <span className="font-semibold text-slate-900">{formatCurrency(lineTotal)}</span>
        </div>
        {availableStock < item.quantity && <p className="mt-1 text-xs text-red-600">Only {availableStock} available in stock</p>}
      </div>
      <button onClick={handleRemove} className="p-2 text-slate-400 hover:text-red-600 transition-colors" aria-label={`Remove ${product.name} from cart`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
  )
}