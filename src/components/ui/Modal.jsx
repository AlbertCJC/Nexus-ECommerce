import { Fragment } from 'react'

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-[90vw]' }
  return (
    <Fragment>
      <div className="modal-overlay" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className={`${sizes[size]} w-full modal-content transform transition-spring`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border-subtle))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{title}</h3>
              <button onClick={onClose} className="p-1.5 rounded-xl text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-hover))] transition-colors" aria-label="Close modal">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger', loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-[rgb(var(--text-secondary))] mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading} className="btn-ghost">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className={`btn-${variant}`}>{loading ? '...' : confirmText}</button>
      </div>
    </Modal>
  )
}