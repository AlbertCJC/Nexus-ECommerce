import { Outlet, useLocation } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { ToastContainer } from '../ui/ToastContainer'
import { useState, useEffect } from 'react'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      <AdminSidebar onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-[rgb(var(--bg-base))/0.9] backdrop-blur-xl border-b border-[rgb(var(--border-subtle))] lg:pl-64">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-[rgb(var(--text-secondary))]" aria-expanded={sidebarOpen} aria-controls="admin-sidebar" aria-label="Open sidebar">
              {sidebarOpen ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
            </button>
            <h1 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Admin Dashboard</h1>
            <div className="w-10" />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <ToastContainer />
    </div>
  )
}