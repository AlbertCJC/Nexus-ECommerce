import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/Spinner'

export function CustomerProtectedRoute() {
  const { session, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  }

  if (!session || !isAuthenticated) {
    // Redirect to home with return URL
    return <Navigate to="/" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}