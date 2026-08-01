import { useAppContext } from '../../context/AppContext'
import { Toast } from './Toast'

export function ToastContainer() {
  const { ui, removeToast } = useAppContext()
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {ui.toasts.map(toast => <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />)}
    </div>
  )
}