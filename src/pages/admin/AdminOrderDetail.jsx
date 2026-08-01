import { useAppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import { formatCurrency, formatDate, formatOrderStatus } from '../../utils/formatters'
import { Table } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Select'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const statusOptions = ['pending', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled']

const statusSelectOptions = statusOptions.map(s => ({value:s, label:formatOrderStatus(s).text}))

export function AdminOrderDetail() {
  const { orders, dispatch, addToast } = useAppContext()
  const { id } = useParams()
  const [updating, setUpdating] = useState(false)

  const order = orders.find(o => o.id === id)
  if (!order) return <div className="p-8 text-center text-slate-500">Order not found</div>

  const statusInfo = formatOrderStatus(order.status)

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id: order.id, status: newStatus } })
    addToast({ type: 'success', message: 'Order status updated' })
    setUpdating(false)
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/orders" className="p-2 text-slate-500 hover:text-slate-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order {id.slice(0,8).toUpperCase()}</h1>
          <p className="text-slate-500">Order details and status management</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant={statusInfo.class.replace('bg-','').replace('100','')}>{statusInfo.text}</Badge>
          <Select options={statusSelectOptions} value={order.status} onChange={e=>handleStatusChange(e.target.value)} disabled={updating} style={{minWidth:'180px'}} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                  <p className="font-semibold text-slate-900 self-center">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <dl className="mt-4 border-t border-slate-200 pt-4 space-y-2 text-right">
              <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd className="font-medium text-slate-900">{formatCurrency(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-600">Shipping</dt><dd className="font-medium text-slate-900">{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-600">Tax (10%)</dt><dd className="font-medium text-slate-900">{formatCurrency(order.tax)}</dd></div>
              <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-2"><dt>Total</dt><dd>{formatCurrency(order.total)}</dd></div>
            </dl>
          </section>

          {order.notes && (
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Order Notes</h2>
              <p className="text-slate-600">{order.notes}</p>
            </section>
          )}
        </div>

        {/* Customer & Order Info */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Customer Information</h2>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-slate-500">Name</dt><dd className="font-medium text-slate-900">{order.customer.name}</dd></div>
              <div><dt className="text-slate-500">Email</dt><dd className="font-medium text-slate-900">{order.customer.email}</dd></div>
              <div><dt className="text-slate-500">Phone</dt><dd className="font-medium text-slate-900">{order.customer.phone}</dd></div>
            </dl>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Shipping Address</h2>
            <address className="text-slate-600 not-italic space-y-1">
              <p>{order.customer.address.street}</p>
              <p>{order.customer.address.city}, {order.customer.address.state} {order.customer.address.zip}</p>
              <p>{order.customer.address.country}</p>
            </address>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Information</h2>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-slate-500">Payment Method</dt><dd className="font-medium text-slate-900 capitalize">{order.paymentMethod.replace('_', ' ')}</dd></div>
              <div><dt className="text-slate-500">Order Date</dt><dd className="font-medium text-slate-900">{formatDate(order.createdAt, 'MMM d, yyyy h:mm a')}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd><Badge variant={statusInfo.class.replace('bg-','').replace('100','')}>{statusInfo.text}</Badge></dd></div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}