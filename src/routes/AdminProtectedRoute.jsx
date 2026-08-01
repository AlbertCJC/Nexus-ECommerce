import { Navigate, Outlet } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { Spinner } from '../components/ui/Spinner'

export function AdminProtectedRoute() {
  const { auth, ui } = useAppContext()
  if (ui.loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  return auth.isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />
}