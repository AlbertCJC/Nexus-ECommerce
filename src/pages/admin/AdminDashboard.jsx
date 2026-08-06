import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { formatCurrency, formatOrderStatus } from '../../utils/formatters'
import { StatsCard } from '../../components/admin/StatsCard'
import { SalesChart } from '../../components/charts/SalesChart'
import { Table } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Link } from 'react-router-dom'
import { useAdminStats, useOrders, useInvalidateQueries } from '../../hooks'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { invalidateOrders } = useInvalidateQueries()

  // Admin stats from Supabase
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats()

  // Recent orders (all users, admin view)
  const { data: orders = [], isLoading: ordersLoading } = useOrders(null)

  // Sort orders by newest first and take top 5
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders])

  // Chart data - placeholder since we don't have historical sales query yet
  const chartData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), sales: 0 }
  }), [])

  const columns = [
    { key: 'id', header: 'Order #', render: (v) => <Link to={`/admin/orders/${v}`} className="font-mono text-sm text-[rgb(var(--accent-primary))] hover:underline">{v.slice(0, 8).toUpperCase()}</Link> },
    { key: 'customer_name', header: 'Customer' },  // Supabase field is customer_name
    { key: 'created_at', header: 'Date', render: (v) => new Date(v).toLocaleDateString() },  // Supabase field is created_at
    { key: 'total_cents', header: 'Total', render: (v) => formatCurrency(v / 100) },  // Supabase field is total_cents
    { key: 'payment_method', header: 'Payment', render: (v) => v.replace('_', ' ') },  // Supabase field is payment_method
    { key: 'status', header: 'Status', render: (v) => <Badge variant={({pending:'warning',confirmed:'info',preparing:'purple',shipped:'info',completed:'success',cancelled:'danger'})[v] || 'default'}>{v}</Badge> },
  ]

  if (statsLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" />
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="p-8 text-center text-[rgb(var(--accent-danger))]">
        Failed to load dashboard: {statsError.message}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Dashboard</h1>
        <p className="text-[rgb(var(--text-muted))] mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Total Products" value={stats?.totalProducts || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} color="primary" />
        <StatsCard title="Total Orders" value={stats?.totalOrders || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} color="info" />
        <StatsCard title="Pending Orders" value={stats?.pendingOrders || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="warning" />
        <StatsCard title="Completed Orders" value={stats?.completedOrders || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} color="success" />
        <StatsCard title="Total Customers" value={stats?.totalCustomers || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} color="purple" />
        <StatsCard title="Total Sales" value={formatCurrency((stats?.totalSales || 0) / 100)} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="success" change="+12.5% vs last month" />
      </div>

      {/* Chart & Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SalesChart data={chartData} />
        <div className="card">
          <div className="p-6 border-b border-[rgb(var(--border-subtle))] flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-[rgb(var(--accent-primary))] hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto p-6">
            <Table columns={columns} data={recentOrders} keyField="id" emptyMessage="No orders yet" onRowClick={o => navigate(`/admin/orders/${o.id}`)} />
          </div>
        </div>
      </div>
    </div>
  )
}