import { useAppContext } from '../../context/AppContext'
import { formatCurrency } from '../../utils/formatters'
import { Table } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { useMemo } from 'react'

export function AdminCustomers() {
  const { customers } = useAppContext()

  const columns = [
    { key: 'name', header: 'Name', render: (_, row) => <div className="flex items-center gap-3"><svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><div><p className="font-medium text-slate-900">{row.name}</p><p className="text-sm text-slate-500">{row.email}</p></div></div> },
    { key: 'email', header: 'Contact', render: (_, row) => <div className="text-sm"><p>{row.email}</p><p className="text-slate-500">{row.phone}</p></div> },
    { key: 'orderCount', header: 'Orders', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'totalSpent', header: 'Total Spent', render: (v) => formatCurrency(v) },
    { key: 'status', header: 'Status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'default'}>{v}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-500">Customer overview and purchase history</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table columns={columns} data={customers} keyField="id" emptyMessage="No customers yet" />
      </div>
    </div>
  )
}