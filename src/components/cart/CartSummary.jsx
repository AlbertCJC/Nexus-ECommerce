import { formatCurrency } from '../../utils/formatters'

export function CartSummary({ subtotal, onCheckout }) {
  const shipping = subtotal >= 100 ? 0 : 9.99
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd className="font-medium text-slate-900">{formatCurrency(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-600">Shipping</dt><dd className="font-medium text-slate-900">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-600">Tax (10%)</dt><dd className="font-medium text-slate-900">{formatCurrency(tax)}</dd></div>
        {shipping > 0 && <p className="text-xs text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">Add {formatCurrency(100 - subtotal)} more for free shipping!</p>}
        <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-semibold text-slate-900"><dt>Total</dt><dd>{formatCurrency(total)}</dd></div>
      </dl>
      <button onClick={onCheckout} className="mt-6 w-full btn-primary py-3 text-lg" disabled={subtotal === 0}>Proceed to Checkout</button>
      <p className="mt-4 text-xs text-center text-slate-500">Secure checkout. No payment info stored.</p>
    </div>
  )
}