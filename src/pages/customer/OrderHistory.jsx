import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDate, formatOrderStatus } from '../../utils/formatters'
import { formatOrderNumber } from '../../utils/helpers'
import { useOrders } from '../../hooks'

export default function OrderHistory() {
  const { session, loading: authLoading } = useAuth()
  const userId = session?.user?.id
  const { data: orders = [], isLoading, error } = useOrders(userId)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-base))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-[rgb(var(--accent-danger))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-[rgb(var(--text-primary))]">Failed to Load Orders</h2>
            <p className="mt-2 text-[rgb(var(--text-muted))]">Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-base))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-[rgb(var(--text-primary))]">No Orders Yet</h2>
            <p className="mt-2 text-[rgb(var(--text-muted))]">You haven't placed any orders yet.</p>
            <Link to="/products" className="mt-6 btn-primary inline-flex">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      <div className="bg-[rgb(var(--bg-card))] border-b border-[rgb(var(--border-subtle))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Order History</h1>
              <p className="mt-1 text-[rgb(var(--text-muted))]">Track and manage your orders</p>
            </div>
            <Link to="/products" className="btn-primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--bg-elevated))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border-subtle))]">
                {orders.map(order => {
                  const statusInfo = formatOrderStatus(order.status)
                  return (
                    <tr key={order.id} className="hover:bg-[rgb(var(--bg-hover))] transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/order/${order.id}/confirmation`} className="font-mono font-medium text-[rgb(var(--accent-primary))] hover:underline">
                          {formatOrderNumber(order.id)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-[rgb(var(--text-secondary))]">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>
                      </td>
                      <td className="px-6 py-4 text-[rgb(var(--text-secondary))]">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[rgb(var(--text-primary))]">
                        {formatCurrency(order.total_cents / 100)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/order/${order.id}/confirmation`}
                          className="text-sm text-[rgb(var(--accent-primary))] hover:underline font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}