import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { useState } from 'react'

export function Navbar() {
  const location = useLocation()
  const { cart, auth } = useAppContext()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const isAdmin = location.pathname.startsWith('/admin')

  const navLinks = isAdmin ? [] : [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
  ]

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to={isAdmin ? '/admin/dashboard' : '/'} className="text-xl font-bold text-primary-600" aria-label="CodeCraft Store Home">
              CodeCraft Store
            </Link>
            {!isAdmin && (
              <div className="hidden md:flex md:gap-6">
                {navLinks.map(link => (
                  <Link key={link.path} to={link.path} className={`text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!isAdmin && (
              <Link to="/cart" className="relative p-2 text-slate-600 hover:text-primary-600 transition-colors" aria-label={`Shopping cart, ${cartCount} items`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">{cartCount}</span>}
              </Link>
            )}
            {auth.isAuthenticated && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span>Admin</span>
                <a href="/admin/dashboard" className="btn-secondary text-sm">Dashboard</a>
              </div>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600" aria-expanded={mobileMenuOpen} aria-controls="mobile-menu" aria-label="Toggle menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
        {!isAdmin && mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-2">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 text-base font-medium text-slate-600 hover:text-primary-600">{link.label}</Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}