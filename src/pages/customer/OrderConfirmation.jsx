import { useAppContext } from '../../context/AppContext'
import { useParams, Link } from 'react-router-dom'
import { formatCurrency, formatDate, formatOrderStatus, formatOrderNumber } from '../../utils/formatters'

export function OrderConfirmation() {
  const { orders } = useAppContext()
  const { id } = useParams()
  const order = orders.find(o => o.id === id)

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Order Not Found</h2>
          <p className="mt-2 text-slate-500">We couldn't find an order with that number.</p>
          <Link to="/products" className="mt-6 btn-primary inline-flex"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Continue Shopping</Link>
        </div>
      </div>
    )
  }

  const statusInfo = formatOrderStatus(order.status)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"><svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
            <h1 className="text-3xl font-bold text-slate-900">Order Confirmed!</h1>
            <p className="mt-2 text-lg text-slate-500">Thank you for your purchase. Your order number is:</p>
            <p className="mt-1 text-2xl font-mono font-bold text-primary-600 tracking-wider">{formatOrderNumber(order.id)}</p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
              <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>
              <span className="text-sm text-slate-600">Placed {formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-sm text-slate-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                  <p className="font-semibold text-slate-900 self-center">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
              <dl className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd className="font-medium text-slate-900">{formatCurrency(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-600">Shipping</dt><dd className="font-medium text-slate-900">{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-600">Tax (10%)</dt><dd className="font-medium text-slate-900">{formatCurrency(order.tax)}</dd></div>
                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2"><dt>Total</dt><dd>{formatCurrency(order.total)}</dd></div>
              </dl>
            </div>
          </section>

          {/* Details */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <div>
                  <p className="font-medium text-slate-900 capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                  <p className="text-sm text-slate-500">Payment will be processed according to selected method</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping Address</h2>
              <address className="text-slate-600 not-italic space-y-1">
                <p className="font-medium text-slate-900">{order.customer.name}</p>
                <p>{order.customer.address.street}</p>
                <p>{order.customer.address.city}, {order.customer.address.state} {order.customer.address.zip}</p>
                <p>{order.customer.address.country}</p>
                <p className="mt-2"><span className="font-medium">Phone:</span> {order.customer.phone}</p>
                <p><span className="font-medium">Email:</span> {order.customer.email}</p>
              </address>
            </div>

            {order.notes && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Order Notes</h2>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{order.notes}</p>
              </div>
            )}
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link to="/products" className="btn-primary inline-flex gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Continue Shopping</Link>
          <Link to="/products" className="btn-outline ml-4">View Products</Link>
        </div>
      </div>
    </div>
  )
}