export function StatsCard({ title, value, change, icon, color = 'primary' }) {
  const colors = {
    primary: 'bg-[rgb(var(--accent-primary))/0.1] text-[rgb(var(--accent-primary))] border-[rgb(var(--accent-primary))/0.2]',
    success: 'bg-[rgb(var(--accent-success))/0.1] text-[rgb(var(--accent-success))] border-[rgb(var(--accent-success))/0.2]',
    warning: 'bg-[rgb(var(--accent-warning))/0.1] text-[rgb(var(--accent-warning))] border-[rgb(var(--accent-warning))/0.2]',
    danger: 'bg-[rgb(var(--accent-danger))/0.1] text-[rgb(var(--accent-danger))] border-[rgb(var(--accent-danger))/0.2]',
    info: 'bg-[rgb(var(--accent-info))/0.1] text-[rgb(var(--accent-info))] border-[rgb(var(--accent-info))/0.2]',
    purple: 'bg-[rgb(var(--accent-secondary))/0.1] text-[rgb(var(--accent-secondary))] border-[rgb(var(--accent-secondary))/0.2]'
  }
  const colorClass = colors[color] || colors.primary
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[rgb(var(--text-muted))]">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[rgb(var(--text-primary))]">{value}</p>
          {change && <p className="mt-2 text-sm text-[rgb(var(--accent-success))]">{change}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass}`}>{icon}</div>
      </div>
    </div>
  )
}