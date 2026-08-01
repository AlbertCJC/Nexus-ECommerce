import { useAppContext } from '../../context/AppContext'
import { formatCurrency, formatOrderStatus } from '../../utils/formatters'
import { StatsCard } from '../../components/admin/StatsCard'
import { SalesChart } from '../../components/charts/SalesChart'
import { Table } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'

export function AdminDashboard() {
  const { products, orders, categories, customers } = useAppContext()

  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const completedOrders = orders.filter(o => o.status === 'completed').length
    const totalCustomers = customers.length
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0)
    return { totalProducts, totalOrders, pendingOrders, completedOrders, totalCustomers, totalSales }
  }, [products, orders, customers])

  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === date.toDateString())
      const sales = dayOrders.reduce((sum, o) => sum + o.total, 0)
      return { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), sales }
    })
    return last30Days
  }, [orders])

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders])

  const columns = [
    { key: 'id', header: 'Order #', render: (v) => <Link to={`/admin/orders/${v}`} className="font-mono text-sm text-primary-600 hover:underline">{v.slice(0,8).toUpperCase()}</Link> },
    { key: 'customer.name', header: 'Customer' },
    { key: 'createdAt', header: 'Date', render: (v) => new Date(v).toLocaleDateString() },
    { key: 'total', header: 'Total', render: (v) => formatCurrency(v) },
    { key: 'paymentMethod', header: 'Payment', render: (v) => v.replace('_', ' ') },
    { key: 'status', header: 'Status', render: (v) => <Badge variant={({pending:'warning',confirmed:'info',preparing:'purple',shipped:'info',completed:'success',cancelled:'danger'})[v] || 'default'}>{v}</Badge> },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Total Products" value={stats.totalProducts} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} color="primary" />
        <StatsCard title="Total Orders" value={stats.totalOrders} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} color="info" />
        <StatsCard title="Pending Orders" value={stats.pendingOrders} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="warning" />
        <StatsCard title="Completed Orders" value={stats.completedOrders} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} color="success" />
        <StatsCard title="Total Customers" value={stats.totalCustomers} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} color="purple" />
        <StatsCard title="Total Sales" value={formatCurrency(stats.totalSales)} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="success" change="+12.5% vs last month" />
      </div>

      {/* Chart & Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SalesChart data={chartData} />
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <Table columns={columns} data={recentOrders} keyField="id" emptyMessage="No orders yet" onRowClick={o => window.location.href = `/admin/orders/${o.id}`} />
          </div>
        </div>
      </div>
    </div>
  )
}