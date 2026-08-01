import { useAppContext } from '../../context/AppContext'
import { formatCurrency, formatDate, formatOrderStatus } from '../../utils/formatters'
import { Table } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Select'
import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'

const statusOptions = ['pending', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled']

const statusFilterOptions = [{value:'',label:'All Statuses'}, ...statusOptions.map(s => ({value:s, label:formatOrderStatus(s).text}))]

export function AdminOrders() {
  const { orders, dispatch, addToast } = useAppContext()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = !search ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const handleStatusChange = (orderId, newStatus) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id: orderId, status: newStatus } })
    addToast({ type: 'success', message: 'Order status updated' })
  }

  const columns = [
    { key: 'id', header: 'Order #', render: (v) => <Link to={`/admin/orders/${v}`} className="font-mono text-sm text-primary-600 hover:underline">{v.slice(0,8).toUpperCase()}</Link> },
    { key: 'customer.name', header: 'Customer', render: (_, row) => <div><p className="font-medium">{row.customer.name}</p><p className="text-sm text-slate-500">{row.customer.email}</p></div> },
    { key: 'createdAt', header: 'Date', render: (v) => formatDate(v) },
    { key: 'total', header: 'Total', render: (v) => formatCurrency(v) },
    { key: 'paymentMethod', header: 'Payment', render: (v) => v.replace('_', ' ') },
    { key: 'status', header: 'Status', render: (v, row) => (
      <select value={v} onChange={e => handleStatusChange(row.id, e.target.value)} className="px-2 py-1 text-xs border rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary-500">
        {statusOptions.map(s => { const info = formatOrderStatus(s); return <option key={s} value={s}>{info.text}</option> })}
      </select>
    )},
    { key: 'actions', header: 'Actions', render: (_, row) => <Link to={`/admin/orders/${row.id}`} className="text-primary-600 hover:underline text-sm">View Details</Link> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500">Manage customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="input pl-10" />
          </div>
          <Select label="Status" options={statusFilterOptions} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{minWidth:'200px'}} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table columns={columns} data={filteredOrders} keyField="id" emptyMessage="No orders found" />
      </div>
    </div>
  )
}