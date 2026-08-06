import { formatCurrency } from '../../utils/formatters'
import { Table } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { useAdminCustomers } from '../../hooks'

export default function AdminCustomers() {
  const { data: customers = [], isLoading, error } = useAdminCustomers()

  const columns = [
    { key: 'name', header: 'Name', render: (_, row) => <div className="flex items-center gap-3"><svg className="w-8 h-8 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><div><p className="font-medium text-[rgb(var(--text-primary))]">{row.name}</p><p className="text-sm text-[rgb(var(--text-muted))]">{row.email}</p></div></div> },
    { key: 'contact', header: 'Contact', render: (_, row) => <div className="text-sm"><p>{row.email}</p><p className="text-[rgb(var(--text-muted))]">{row.phone}</p></div> },
    { key: 'orderCount', header: 'Orders', render: (v) => <span className="font-medium text-[rgb(var(--text-primary))]">{v}</span> },
    { key: 'totalSpent', header: 'Total Spent', render: (v) => formatCurrency(v / 100) },
    { key: 'status', header: 'Status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'default'}>{v}</Badge> },
  ]

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" /></div>
  }

  if (error) {
    return <div className="p-8 text-center text-[rgb(var(--accent-danger))]">Failed to load customers: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Customers</h1>
        <p className="text-[rgb(var(--text-muted))]">Customer overview and purchase history</p>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={customers} keyField="id" emptyMessage="No customers yet" />
      </div>
    </div>
  )
}