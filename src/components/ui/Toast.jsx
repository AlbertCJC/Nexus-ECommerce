export function Toast({ toast, onClose }) {
  const icons = {
    success: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    error: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    warning: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    info: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  }
  const colors = {
    success: 'bg-[rgb(var(--accent-success))/0.1] border-[rgb(var(--accent-success))/0.3] text-[rgb(var(--accent-success))]',
    error: 'bg-[rgb(var(--accent-danger))/0.1] border-[rgb(var(--accent-danger))/0.3] text-[rgb(var(--accent-danger))]',
    warning: 'bg-[rgb(var(--accent-warning))/0.1] border-[rgb(var(--accent-warning))/0.3] text-[rgb(var(--accent-warning))]',
    info: 'bg-[rgb(var(--accent-primary))/0.1] border-[rgb(var(--accent-primary))/0.3] text-[rgb(var(--accent-primary))]'
  }
  const Icon = icons[toast.type] || icons.info
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in ${colors[toast.type]}`} role="alert">
      <div className="flex-shrink-0 mt-0.5">{Icon}</div>
      <div className="flex-1"><p className="text-sm font-medium">{toast.message}</p></div>
      <button onClick={onClose} className="text-current opacity-50 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  )
}