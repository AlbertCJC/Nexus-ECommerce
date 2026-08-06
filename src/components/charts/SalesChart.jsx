import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function SalesChart({ data }) {
  if (!data?.length) return <div className="h-64 flex items-center justify-center text-[rgb(var(--text-muted))]">No sales data</div>
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Sales Overview (Last 30 Days)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(var(--accent-primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="rgb(var(--accent-primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" vertical={false} />
            <XAxis dataKey="date" stroke="rgb(var(--text-muted))" fontSize={12} tick={{ fill: 'rgb(var(--text-muted))' }} />
            <YAxis stroke="rgb(var(--border-subtle))" fontSize={12} tick={{ fill: 'rgb(var(--text-muted))' }} tickFormatter={v => `₱${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
            <Tooltip contentStyle={{ backgroundColor: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border-subtle))', borderRadius: '8px' }} labelFormatter={v => `Day ${v}`} formatter={v => [`₱${v.toFixed(2)}`, 'Sales']} />
            <Area type="monotone" dataKey="sales" stroke="rgb(var(--accent-primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}