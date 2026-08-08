import { formatCurrency } from '../../utils/formatters'

export function CartItem({ item, product, onUpdateQuantity, onRemove }) {
  const maxQuantity = product.stock
  const remainingStock = product.stock - item.quantity
  const lineTotal = product.price_cents * item.quantity

  const handleQuantityChange = (delta) => {
    const newQty = Math.max(1, Math.min(maxQuantity, item.quantity + delta))
    onUpdateQuantity(product.id, newQty)
  }

  const handleRemove = () => {
    onRemove(product.id)
  }

  return (
    <div className="flex gap-4 p-4 card">
      <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" loading="lazy" onError={(e) => { e.currentTarget.src = '/images/placeholder-product.svg'; e.currentTarget.onerror = null; }} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[rgb(var(--text-primary))] truncate">{product.name}</div>
        <p className="text-sm text-[rgb(var(--text-muted))]">{formatCurrency(product.price_cents)} each</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-[rgb(var(--border-subtle))] rounded-lg bg-[rgb(var(--bg-elevated))]">
            <button onClick={() => handleQuantityChange(-1)} disabled={item.quantity <= 1} className="min-w-[44px] min-h-[44px] px-3 py-1 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] disabled:opacity-50 transition-colors flex items-center justify-center" aria-label="Decrease quantity">−</button>
            <span className="px-3 py-1 text-sm font-medium w-10 text-center border-x border-[rgb(var(--border-subtle))]">{item.quantity}</span>
            <button onClick={() => handleQuantityChange(1)} disabled={item.quantity >= maxQuantity} className="min-w-[44px] min-h-[44px] px-3 py-1 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] disabled:opacity-50 transition-colors flex items-center justify-center" aria-label="Increase quantity">+</button>
          </div>
          <span className="font-semibold text-[rgb(var(--text-primary))]">{formatCurrency(lineTotal)}</span>
        </div>
        {remainingStock === 0 && <p className="mt-1 text-xs text-[rgb(var(--accent-danger))]">Only {product.stock} in stock — max reached</p>}
      </div>
      <button onClick={handleRemove} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-danger))] hover:bg-[rgb(var(--bg-hover))] transition-colors rounded-lg" aria-label={`Remove ${product.name} from cart`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
  )
}