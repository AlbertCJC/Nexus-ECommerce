export function Table({ columns, data, keyField = 'id', onRowClick, emptyMessage = 'No data available', className = '' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map(col => <th key={col.key} className={`px-4 py-3 font-medium text-slate-700 ${col.className || ''}`}>{col.header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">{emptyMessage}</td></tr>
          ) : (
            data.map(row => (
              <tr key={row[keyField]} className={`${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`} onClick={() => onRowClick?.(row)}>
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
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