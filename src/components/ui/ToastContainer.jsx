import { useAppContext } from '../../context/AppContext'
import { Toast } from './Toast'
import { useEffect } from 'react'

export function ToastContainer() {
  const { ui, removeToast } = useAppContext()

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    const timers = ui.toasts.map(toast => {
      return setTimeout(() => {
        removeToast(toast.id)
      }, 5000)
    })
    return () => timers.forEach(clearTimeout)
  }, [ui.toasts, removeToast])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {ui.toasts.map(toast => <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />)}
    </div>
  )
}