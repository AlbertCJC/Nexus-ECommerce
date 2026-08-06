export function Table({ columns, data, keyField = 'id', onRowClick, emptyMessage = 'No data available', className = '' }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key} className={col.className || ''}>{col.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-[rgb(var(--text-muted))]">{emptyMessage}</td></tr>
          ) : (
            data.map(row => (
              <tr key={row[keyField]} className={`${onRowClick ? 'cursor-pointer hover:bg-[rgb(var(--bg-hover))]' : ''}`} onClick={() => onRowClick?.(row)}>
                {columns.map(col => (
                  <td key={col.key} className={col.className || ''}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}