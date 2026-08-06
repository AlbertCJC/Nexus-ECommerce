import { formatCurrency } from '../../utils/formatters'
import { Link } from 'react-router-dom'

export function CartSummary({ subtotal }) {
  // subtotal is in cents
  const subtotalPesos = subtotal / 100
  const shippingThreshold = 100 // 100 PHP = 10000 cents
  const shipping = subtotal >= 10000 ? 0 : 999 // 999 cents = 9.99 PHP
  const tax = Math.round(subtotal * 0.1) // 10% tax in cents
  const total = subtotal + shipping + tax

  return (
    <div className="card p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Order Summary</h2>
      <dl className="grid grid-cols-[1fr_auto] gap-y-3 gap-x-4 text-sm">
        <dt className="text-[rgb(var(--text-muted))]">Subtotal</dt>
        <dd className="font-medium text-[rgb(var(--text-primary))]">{formatCurrency(subtotalPesos)}</dd>
        <dt className="text-[rgb(var(--text-muted))]">Shipping</dt>
        <dd className="font-medium text-[rgb(var(--text-primary))]">{shipping === 0 ? 'Free' : formatCurrency(shipping / 100)}</dd>
        <dt className="text-[rgb(var(--text-muted))]">Tax (10%)</dt>
        <dd className="font-medium text-[rgb(var(--text-primary))]">{formatCurrency(tax / 100)}</dd>
      </dl>
      {shipping > 0 && (
        <p className="text-xs text-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))/0.1] px-3 py-2 rounded-lg mt-3">
          Add {formatCurrency((10000 - subtotal) / 100)} more for free shipping!
        </p>
      )}
      <div className="border-t border-[rgb(var(--border-subtle))] pt-3 mt-3 flex justify-between text-base font-semibold text-[rgb(var(--text-primary))]">
        <span>Total</span>
        <span>{formatCurrency(total / 100)}</span>
      </div>
      <Link to="/checkout" className="block mt-4">
        <button className="w-full btn-primary py-3 text-lg" disabled={subtotal === 0}>Proceed to Checkout</button>
      </Link>
      <p className="mt-4 text-xs text-center text-[rgb(var(--text-muted))]">Secure checkout. No payment info stored.</p>
    </div>
  )
}