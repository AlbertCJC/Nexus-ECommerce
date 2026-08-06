import { useParams } from 'react-router-dom'
import { formatCurrency, formatDate, formatOrderStatus } from '../../utils/formatters'
import { Table } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useOrder, useUpdateOrderStatus, useInvalidateQueries } from '../../hooks'

const statusOptions = ['pending', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled']

const statusSelectOptions = statusOptions.map(s => ({value:s, label:formatOrderStatus(s).text}))

export default function AdminOrderDetail() {
  const { id } = useParams()
  const { data: order, isLoading, error } = useOrder(id)
  const updateOrderStatusMutation = useUpdateOrderStatus()
  const { invalidateOrders } = useInvalidateQueries()
  const [updating, setUpdating] = useState(false)

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" /></div>
  }

  if (error) {
    return <div className="p-8 text-center text-[rgb(var(--accent-danger))]">Failed to load order: {error.message}</div>
  }

  if (!order) return <div className="p-8 text-center text-[rgb(var(--text-muted))]">Order not found</div>

  const statusInfo = formatOrderStatus(order.status)

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId: order.id, status: newStatus })
      invalidateOrders()
    } catch (err) {
      console.error('Status update failed:', err)
      alert('Failed to update status: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.unit_price_cents * item.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/orders" className="p-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></Link>
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Order {id.slice(0,8).toUpperCase()}</h1>
          <p className="text-[rgb(var(--text-muted))]">Order details and status management</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant={statusInfo.class.replace('bg-','').replace('100','')}>{statusInfo.text}</Badge>
          <Select options={statusSelectOptions} value={order.status} onChange={e=>handleStatusChange(e.target.value)} disabled={updating} style={{minWidth:'180px'}} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-[rgb(var(--bg-elevated))] rounded-lg">
                  <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded" onError={(e) => { e.currentTarget.src = '/images/placeholder-product.svg' }} />
                  <div className="flex-1">
                    <p className="font-medium text-[rgb(var(--text-primary))]">{item.product_name}</p>
                    <p className="text-sm text-[rgb(var(--text-muted))]">Qty: {item.quantity} × {formatCurrency(item.unit_price_cents / 100)}</p>
                  </div>
                  <p className="font-semibold text-[rgb(var(--text-primary))] self-center">{formatCurrency(item.unit_price_cents * item.quantity / 100)}</p>
                </div>
              ))}
            </div>
            <dl className="mt-4 border-t border-[rgb(var(--border-subtle))] pt-4 space-y-2 text-right">
              <div className="flex justify-between"><dt className="text-[rgb(var(--text-muted))]">Subtotal</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{formatCurrency(order.subtotal_cents / 100)}</dd></div>
              <div className="flex justify-between"><dt className="text-[rgb(var(--text-muted))]">Shipping</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{order.shipping_cents === 0 ? 'Free' : formatCurrency(order.shipping_cents / 100)}</dd></div>
              <div className="flex justify-between"><dt className="text-[rgb(var(--text-muted))]">Tax (10%)</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{formatCurrency(order.tax_cents / 100)}</dd></div>
              <div className="flex justify-between text-lg font-bold text-[rgb(var(--text-primary))] border-t border-[rgb(var(--border-subtle))] pt-2"><dt>Total</dt><dd>{formatCurrency(order.total_cents / 100)}</dd></div>
            </dl>
          </section>

          {order.notes && (
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">Order Notes</h2>
              <p className="text-[rgb(var(--text-secondary))]">{order.notes}</p>
            </section>
          )}
        </div>

        {/* Customer & Order Info */}
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Customer Information</h2>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-[rgb(var(--text-muted))]">Name</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{order.customer_name}</dd></div>
              <div><dt className="text-[rgb(var(--text-muted))]">Email</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{order.customer_email}</dd></div>
              <div><dt className="text-[rgb(var(--text-muted))]">Phone</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{order.customer_phone}</dd></div>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Shipping Address</h2>
            <address className="text-[rgb(var(--text-secondary))] not-italic space-y-1">
              <p>{order.shipping_address?.street || 'N/A'}</p>
              <p>{order.shipping_address?.city || ''}, {order.shipping_address?.state || ''} {order.shipping_address?.zip || ''}</p>
              <p>{order.shipping_address?.country || ''}</p>
            </address>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Order Information</h2>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-[rgb(var(--text-muted))]">Payment Method</dt><dd className="font-medium text-[rgb(var(--text-primary))] capitalize">{order.payment_method.replace('_', ' ')}</dd></div>
              <div><dt className="text-[rgb(var(--text-muted))]">Order Date</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{formatDate(order.created_at, 'MMM d, yyyy h:mm a')}</dd></div>
              <div><dt className="text-[rgb(var(--text-muted))]">Status</dt><dd><Badge variant={statusInfo.class.replace('bg-','').replace('100','')}>{statusInfo.text}</Badge></dd></div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}