import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAppContext } from '../../context/AppContext'
import { useState, useEffect, useRef } from 'react'
import { AuthModal } from '../ui/AuthModal'
import { ArrowRightOnRectangleIcon, UserCircleIcon, ShoppingBagIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { useCart, useBrands, useCategories } from '../../hooks'
import { getCategoryIcon } from '../../utils/categoryIcons'

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, session, isAuthenticated, isAdmin, signOut } = useAuth()
  const { cart, openAuthModal, closeAuthModal, authModalState } = useAppContext()
  const { data: cartItems = [], isLoading: cartLoading } = useCart(session?.user?.id || '')
  const { data: brands = [], isLoading: brandsLoading } = useBrands()
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [brandMenuOpen, setBrandMenuOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const headerRef = useRef(null)
  const categoryMenuRef = useRef(null)
  const brandMenuRef = useRef(null)
  const categoryLeaveTimer = useRef(null)
  const brandLeaveTimer = useRef(null)
  const cartCount = isAuthenticated && session?.user ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCategoryMouseEnter = () => {
    if (categoryLeaveTimer.current) clearTimeout(categoryLeaveTimer.current)
    setCategoryMenuOpen(true)
  }
  const handleCategoryMouseLeave = () => {
    categoryLeaveTimer.current = setTimeout(() => setCategoryMenuOpen(false), 150)
  }
  const handleBrandMouseEnter = () => {
    if (brandLeaveTimer.current) clearTimeout(brandLeaveTimer.current)
    setBrandMenuOpen(true)
  }
  const handleBrandMouseLeave = () => {
    brandLeaveTimer.current = setTimeout(() => setBrandMenuOpen(false), 150)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = isAdmin ? [] : [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
  ]

  const handleLogout = async (e) => {
    e?.stopPropagation()
    await signOut()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 bg-[rgb(var(--bg-base))/0.9] backdrop-blur-xl border-b border-[rgb(var(--border-subtle))]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to={isAdmin ? '/admin/dashboard' : '/'} className="text-xl font-bold" style={{background: 'linear-gradient(135deg, rgb(var(--accent-primary)) 0%, rgb(var(--accent-primary-glow)) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} aria-label="NEXUS Home">
              <span className="flex items-center gap-2">
                <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
                  <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                      <stop offset="0%" stopColor="rgb(var(--accent-primary))"/>
                      <stop offset="100%" stopColor="rgb(var(--accent-secondary))"/>
                    </linearGradient>
                  </defs>
                </svg>
                NEXUS
              </span>
            </Link>
            {!isAdmin && (
              <div className="hidden md:flex md:gap-6">
                {navLinks.map(link => (
                  <Link key={link.path} to={link.path} className={`text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-[rgb(var(--accent-primary))]' : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))]'}`}>
                    {link.label}
                  </Link>
                ))}
                {/* Shop by Category Dropdown */}
                <div className="relative" onMouseEnter={handleCategoryMouseEnter} onMouseLeave={handleCategoryMouseLeave}>
                  <button className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors" aria-haspopup="true" aria-expanded={categoryMenuOpen}>
                    Shop by Category
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {categoryMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-[rgb(var(--border-subtle))] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] py-2 z-50 bg-[rgb(var(--bg-card))]" onMouseEnter={handleCategoryMouseEnter} onMouseLeave={handleCategoryMouseLeave}>
                      {categoriesLoading ? (
                        <div className="px-4 py-2 text-sm text-[rgb(var(--text-muted))]">Loading categories...</div>
                      ) : categories.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-[rgb(var(--text-muted))]">No categories available</div>
                      ) : (
                        <>
                          {categories.map(category => {
                            const IconComponent = getCategoryIcon(category)
                            return (
                              <Link key={category.id} to={`/products?category=${category.id}`} onClick={() => setCategoryMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--accent-primary))] transition-colors">
                                <IconComponent className="w-5 h-5 text-[rgb(var(--text-muted))] flex-shrink-0" />
                                {category.name}
                              </Link>
                            )
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Shop by Brand Dropdown */}
                <div className="relative" onMouseEnter={handleBrandMouseEnter} onMouseLeave={handleBrandMouseLeave}>
                  <button className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors" aria-haspopup="true" aria-expanded={brandMenuOpen}>
                    Shop by Brand
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {brandMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-[rgb(var(--border-subtle))] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] py-2 z-50 bg-[rgb(var(--bg-card))]" onMouseEnter={handleBrandMouseEnter} onMouseLeave={handleBrandMouseLeave}>
                      {brandsLoading ? (
                        <div className="px-4 py-2 text-sm text-[rgb(var(--text-muted))]">Loading brands...</div>
                      ) : brands.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-[rgb(var(--text-muted))]">No brands available</div>
                      ) : (
                        <>
                          {brands.map(brand => (
                            <Link key={brand.id} to={`/products?brand=${brand.id}`} onClick={() => setBrandMenuOpen(false)} className="block px-4 py-2 text-sm text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--accent-primary))] transition-colors">
                              {brand.name}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Cart button - show for guests and regular users (not admin dashboard) */}
            {!isAdmin && (
              <Link to="/cart" className="relative flex items-center justify-center p-2 rounded-xl text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--bg-hover))] transition-colors" aria-label={`Shopping cart, ${cartCount} items`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {cartCount > 0 && !cartLoading && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--accent-primary))] text-xs font-bold text-slate-900">{cartCount}</span>}
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="relative flex items-center gap-2 p-1 rounded-xl hover:bg-[rgb(var(--bg-hover))] transition-colors"
                  aria-label="User account"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-[rgb(var(--text-primary))] hidden sm:block">
                    {user?.first_name || user?.email || 'User'}
                  </span>
                  <svg className="w-4 h-4 text-[rgb(var(--text-muted))] hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[rgb(var(--border-subtle))] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] py-1 z-50 bg-[rgb(var(--bg-card))] animate-slide-down">
                    <div className="px-4 py-2 border-b border-[rgb(var(--border-subtle))]">
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--accent-primary))] transition-colors"
                    >
                      <ShoppingBagIcon className="w-5 h-5" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--accent-primary))] transition-colors"
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    {isAdmin && location.pathname.startsWith('/admin') && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--accent-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--accent-secondary))] transition-colors"
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <div className="border-t border-[rgb(var(--border-subtle))] pt-1" />
                    <button
                      onClick={handleLogout}
                      onMouseDown={e => e.stopPropagation()}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[rgb(var(--accent-danger))] hover:bg-[rgb(var(--bg-hover))] transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}

                {isAdmin && location.pathname.startsWith('/admin') && !userMenuOpen && (
                  <Link to="/admin/dashboard" className="btn-primary text-sm hidden sm:block">
                    Dashboard
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="btn-ghost text-sm hidden sm:block"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="btn-primary text-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[rgb(var(--text-secondary))]" aria-expanded={mobileMenuOpen} aria-controls="mobile-menu" aria-label="Toggle menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
        {!isAdmin && mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-[rgb(var(--border-subtle))]">
            <div className="flex flex-col gap-2">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 text-base font-medium text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))]">{link.label}</Link>
              ))}
              <div className="pt-2 border-t border-[rgb(var(--border-subtle))]">
                <span className="px-2 py-2 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase">Shop by Brand</span>
                <div className="px-2 py-2 text-sm text-[rgb(var(--text-muted))]">Brands loaded from database</div>
              </div>
              <div className="pt-4 border-t border-[rgb(var(--border-subtle))] flex flex-col gap-2">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[rgb(var(--bg-hover))] transition-colors border border-[rgb(var(--border-subtle))]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-[rgb(var(--text-primary))] block truncate">
                          {user?.first_name} {user?.last_name}
                        </span>
                        <span className="text-xs text-[rgb(var(--text-muted))] truncate block">{user?.email}</span>
                      </div>
                    </div>
                    <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="btn-outline text-sm text-left">
                      <ShoppingBagIcon className="w-5 h-5 mr-2" />
                      My Orders
                    </Link>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="btn-outline text-sm text-left">
                      <UserCircleIcon className="w-5 h-5 mr-2" />
                      Profile
                    </Link>
                    {isAdmin && location.pathname.startsWith('/admin') && (
                      <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-primary text-center text-sm">
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="btn-outline text-sm text-left text-[rgb(var(--accent-danger))] border-[rgb(var(--accent-danger))] hover:bg-[rgb(var(--accent-danger))/0.1]"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        openAuthModal('login')
                        setMobileMenuOpen(false)
                      }}
                      className="btn-ghost text-sm text-left"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal('register')
                        setMobileMenuOpen(false)
                      }}
                      className="btn-primary text-sm text-left"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={closeAuthModal}
        initialMode={authModalState.mode}
      />
    </header>
  )
}