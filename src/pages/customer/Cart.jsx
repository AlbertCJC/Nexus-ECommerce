import { useAuth } from '../../context/AuthContext'
import { useAppContext } from '../../context/AppContext'
import { Link, useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatters'
import { CartItem } from '../../components/cart/CartItem'
import { CartSummary } from '../../components/cart/CartSummary'
import { useProducts, useCart as useCartQuery, useUpdateCartQuantity, useRemoveFromCart, useClearCart } from '../../hooks'
import { useState, useEffect } from 'react'

export default function Cart() {
  const { isAuthenticated, session } = useAuth()
  const { cart: localCart, dispatch, addToast } = useAppContext()
  const navigate = useNavigate()

  const { data: products = [] } = useProducts({ status: 'all' })

  // For authenticated users, use Supabase cart
  const { data: serverCartItems = [], isLoading: cartLoading, isError: cartError } = useCartQuery(session?.user?.id || '')
  const updateQtyMutation = useUpdateCartQuantity()
  const removeItemMutation = useRemoveFromCart()
  const clearCartMutation = useClearCart()

  // For guest users, use localStorage cart
  const [guestCart, setGuestCart] = useState([])

  // Sync guest cart with localStorage on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setGuestCart(localCart)
    }
  }, [localCart, isAuthenticated])

  // Clear guest cart state when switching to authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setGuestCart([])
    }
  }, [isAuthenticated])

  const cartItems = isAuthenticated
    ? serverCartItems.map(item => ({
        item: { productId: item.product_id, quantity: item.quantity },
        product: item.product,
      })).filter(({ product }) => product)
    : guestCart.map(item => {
        const product = products.find(p => p.id === item.productId)
        return { item, product }
      }).filter(({ product }) => product)

  // Calculate totals in cents
  const subtotal = cartItems.reduce((sum, { item, product }) => sum + product.price_cents * item.quantity, 0)

  const isEmpty = isAuthenticated ? serverCartItems.length === 0 : guestCart.length === 0

  const handleUpdateQty = async (productId, quantity) => {
    if (isAuthenticated && session?.user) {
      try {
        await updateQtyMutation.mutateAsync({ userId: session.user.id, productId, quantity })
      } catch (error) {
        console.error('Failed to update quantity:', error)
        addToast({ type: 'error', message: 'Failed to update quantity. Please try again.' })
      }
    } else {
      const updated = guestCart.map(i => i.productId === productId ? { ...i, quantity } : i)
      setGuestCart(updated)
      dispatch({ type: 'SET_CART', payload: updated })
    }
  }

  const handleRemove = async (productId) => {
    if (isAuthenticated && session?.user) {
      try {
        await removeItemMutation.mutateAsync({ userId: session.user.id, productId })
      } catch (error) {
        console.error('Failed to remove item:', error)
        addToast({ type: 'error', message: 'Failed to remove item. Please try again.' })
      }
    } else {
      const updated = guestCart.filter(i => i.productId !== productId)
      setGuestCart(updated)
      dispatch({ type: 'SET_CART', payload: updated })
    }
  }

  const handleClear = async () => {
    if (isAuthenticated && session?.user) {
      try {
        await clearCartMutation.mutateAsync(session.user.id)
      } catch (error) {
        console.error('Failed to clear cart:', error)
        addToast({ type: 'error', message: 'Failed to clear cart. Please try again.' })
      }
    } else {
      setGuestCart([])
      dispatch({ type: 'CLEAR_CART' })
    }
  }

  if (isAuthenticated && cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated && cartError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-[rgb(var(--accent-danger))]">Failed to load cart. Please refresh the page.</p>
          <button onClick={() => window.location.reload()} className="mt-4 btn-primary">Refresh</button>
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <svg className="mx-auto h-24 w-24 text-[rgb(var(--text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          <h2 className="mt-6 text-2xl font-bold text-[rgb(var(--text-primary))]">Your cart is empty</h2>
          <p className="mt-2 text-[rgb(var(--text-muted))]">Looks like you haven't added any products yet.</p>
          <Link to="/products" className="mt-6 btn-primary inline-flex"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      <div className="bg-[rgb(var(--bg-card))] border-b border-[rgb(var(--border-subtle))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Shopping Cart</h1>
          <p className="mt-1 text-[rgb(var(--text-muted))]">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(({ item, product }) => (
              <CartItem
                key={product.id}
                item={item}
                product={product}
                onUpdateQuantity={handleUpdateQty}
                onRemove={handleRemove}
              />
            ))}
          </div>
          <div>
            <CartSummary subtotal={subtotal} />
          </div>
        </div>

        <div className="mt-8">
          <Link to="/products" className="inline-flex items-center gap-2 text-[rgb(var(--accent-primary))] hover:text-[rgb(var(--accent-glow))] font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}