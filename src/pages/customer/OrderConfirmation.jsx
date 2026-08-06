import { useAuth } from '../../context/AuthContext'
import { useParams, Link } from 'react-router-dom'
import { formatCurrency, formatDate, formatOrderStatus } from '../../utils/formatters'
import { formatOrderNumber } from '../../utils/helpers'
import { useOrder } from '../../hooks'
import { Spinner } from '../../components/ui/Spinner'

export default function OrderConfirmation() {
  const { session } = useAuth()
  const { id } = useParams()
  const userId = session?.user?.id

  const { data: order, isLoading, error } = useOrder(id)

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center px-4">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="mt-4 text-2xl font-bold text-[rgb(var(--text-primary))]">Order Not Found</h2>
          <p className="mt-2 text-[rgb(var(--text-muted))]">We couldn't find an order with that number.</p>
          <Link to="/products" className="mt-6 btn-primary inline-flex"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Continue Shopping</Link>
        </div>
      </div>
    )
  }

  // Security check: ensure order belongs to current user
  if (userId && order.user_id !== userId) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center px-4">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="mt-4 text-2xl font-bold text-[rgb(var(--text-primary))]">Access Denied</h2>
          <p className="mt-2 text-[rgb(var(--text-muted))]">You don't have permission to view this order.</p>
          <Link to="/orders" className="mt-6 btn-primary inline-flex"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> My Orders</Link>
        </div>
      </div>
    )
  }

  const statusInfo = formatOrderStatus(order.status)

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      <div className="bg-[rgb(var(--bg-card))] border-b border-[rgb(var(--border-subtle))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-[rgb(var(--accent-success))/0.2] rounded-full flex items-center justify-center mb-6"><svg className="w-10 h-10 text-[rgb(var(--accent-success))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
            <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Order Confirmed!</h1>
            <p className="mt-2 text-lg text-[rgb(var(--text-muted))]">Thank you for your purchase. Your order number is:</p>
            <p className="mt-1 text-2xl font-mono font-bold text-[rgb(var(--accent-primary))] tracking-wider">{formatOrderNumber(order.id)}</p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-elevated))] rounded-full">
              <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>
              <span className="text-sm text-[rgb(var(--text-muted))]">Placed {formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Order Summary</h2>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" loading="lazy" onError={(e) => { e.currentTarget.src = '/images/placeholder-product.svg'; e.currentTarget.onerror = null; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[rgb(var(--text-primary))] truncate">{item.product_name}</p>
                    <p className="text-sm text-[rgb(var(--text-muted))]">Qty: {item.quantity} × {formatCurrency(item.unit_price_cents / 100)}</p>
                  </div>
                  <p className="font-semibold text-[rgb(var(--text-primary))] self-center">{formatCurrency(item.unit_price_cents * item.quantity / 100)}</p>
                </div>
              ))}
              <dl className="border-t border-[rgb(var(--border-subtle))] pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-[rgb(var(--text-muted))]">Subtotal</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{formatCurrency(order.subtotal_cents / 100)}</dd></div>
                <div className="flex justify-between"><dt className="text-[rgb(var(--text-muted))]">Shipping</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{order.shipping_cents === 0 ? 'Free' : formatCurrency(order.shipping_cents / 100)}</dd></div>
                <div className="flex justify-between"><dt className="text-[rgb(var(--text-muted))]">Tax (10%)</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{formatCurrency(order.tax_cents / 100)}</dd></div>
                <div className="flex justify-between text-base font-bold text-[rgb(var(--text-primary))] border-t border-[rgb(var(--border-subtle))] pt-2"><dt>Total</dt><dd>{formatCurrency(order.total_cents / 100)}</dd></div>
              </dl>
            </div>
          </section>

          {/* Details */}
          <section className="card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 p-4 bg-[rgb(var(--bg-elevated))] rounded-lg">
                <svg className="w-6 h-6 text-[rgb(var(--accent-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <div>
                  <p className="font-medium text-[rgb(var(--text-primary))] capitalize">{order.payment_method.replace('_', ' ')}</p>
                  <p className="text-sm text-[rgb(var(--text-muted))]">Payment will be processed according to selected method</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Shipping Address</h2>
              <address className="text-[rgb(var(--text-muted))] not-italic space-y-1">
                <p className="font-medium text-[rgb(var(--text-primary))]">{order.customer_name}</p>
                <p>{order.shipping_address?.street}</p>
                <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}</p>
                <p>{order.shipping_address?.country}</p>
                <p className="mt-2"><span className="font-medium">Phone:</span> {order.customer_phone}</p>
                <p><span className="font-medium">Email:</span> {order.customer_email}</p>
              </address>
            </div>

            {order.notes && (
              <div>
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">Order Notes</h2>
                <p className="text-[rgb(var(--text-muted))] bg-[rgb(var(--bg-elevated))] p-4 rounded-lg">{order.notes}</p>
              </div>
            )}
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link to="/products" className="btn-primary inline-flex gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Continue Shopping</Link>
          <Link to="/orders" className="btn-outline ml-4">View Orders</Link>
        </div>
      </div>
    </div>
  )
}