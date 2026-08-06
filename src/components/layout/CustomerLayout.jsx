import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ToastContainer } from '../ui/ToastContainer'

export function CustomerLayout() {
  const location = useLocation()
  const { loading } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}