import { formatCurrency, formatDate, formatOrderStatus } from '../../utils/formatters'
import { Table } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useOrders, useUpdateOrderStatus, useInvalidateQueries } from '../../hooks'

const statusOptions = ['pending', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled']

const statusFilterOptions = [{value:'',label:'All Statuses'}, ...statusOptions.map(s => ({value:s, label:formatOrderStatus(s).text}))]

export default function AdminOrders() {
  const { data: orders = [], isLoading, error } = useOrders(null) // null = all orders for admin
  const updateOrderStatusMutation = useUpdateOrderStatus()
  const { invalidateOrders } = useInvalidateQueries()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = !search ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase()) || // customer_name (snake_case)
        o.customer_email.toLowerCase().includes(search.toLowerCase())   // customer_email (snake_case)
      const matchesStatus = !statusFilter || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status: newStatus })
      invalidateOrders()
    } catch (err) {
      console.error('Status update failed:', err)
      alert('Failed to update status: ' + err.message)
    }
  }

  const columns = [
    { key: 'id', header: 'Order #', render: (v) => <Link to={`/admin/orders/${v}`} className="font-mono text-sm text-[rgb(var(--accent-primary))] hover:underline">{v.slice(0,8).toUpperCase()}</Link> },
    { key: 'customer_name', header: 'Customer', render: (_, row) => <div><p className="font-medium text-[rgb(var(--text-primary))]">{row.customer_name}</p><p className="text-sm text-[rgb(var(--text-muted))]">{row.customer_email}</p></div> },
    { key: 'created_at', header: 'Date', render: (v) => formatDate(v) },
    { key: 'total_cents', header: 'Total', render: (v) => formatCurrency(v / 100) },
    { key: 'payment_method', header: 'Payment', render: (v) => v.replace('_', ' ') },
    { key: 'status', header: 'Status', render: (v, row) => {
      const info = formatOrderStatus(v)
      return (
        <Badge variant={info.class.replace('bg-', '').replace('100', '')}>{info.text}</Badge>
      )
    }},
    { key: 'actions', header: 'Actions', render: (_, row) => <Link to={`/admin/orders/${row.id}`} className="text-[rgb(var(--accent-primary))] hover:underline text-sm">View Details</Link> },
  ]

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" /></div>
  }

  if (error) {
    return <div className="p-8 text-center text-[rgb(var(--accent-danger))]">Failed to load orders: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Orders</h1>
          <p className="text-[rgb(var(--text-muted))]">Manage customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="input pl-10" />
          </div>
          <Select label="Status" options={statusFilterOptions} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{minWidth:'200px'}} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={filteredOrders} keyField="id" emptyMessage="No orders found" />
      </div>
    </div>
  )
}