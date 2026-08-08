import { useAuth } from '../../context/AuthContext'
import { useAppContext } from '../../context/AppContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema } from '../../utils/validation'
import { formatCurrency } from '../../utils/formatters'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useProducts, useCart as useCartQuery, useCreateOrder } from '../../hooks'
import { v4 as uuidv4 } from 'uuid'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const paymentMethods = [
  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
  { value: 'ewallet', label: 'E-Wallet', desc: 'Pay with digital wallet (GCash, PayMaya, etc.)' },
  { value: 'bank', label: 'Bank Transfer', desc: 'Transfer via online banking' },
]

export default function Checkout() {
  const { isAuthenticated, session } = useAuth()
  const { cart: localCart, dispatch, addToast, openAuthModal } = useAppContext()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [guestCart, setGuestCart] = useState([])

  // Redirect guests to login
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login')
      navigate('/cart')
    }
  }, [isAuthenticated, openAuthModal, navigate])

  // Submission lock to prevent duplicate orders on rapid clicks
  const submissionLock = useRef(false)

  const acquireLock = useCallback(() => {
    if (submissionLock.current) return false
    submissionLock.current = true
    return true
  }, [])

  const releaseLock = useCallback(() => {
    submissionLock.current = false
  }, [])

  // Sync guest cart with localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      setGuestCart(localCart)
    }
  }, [localCart, isAuthenticated])

  // Get all products for localStorage cart mapping
  const { data: products = [] } = useProducts({ status: 'all' })

  // For authenticated users, use Supabase cart
  const { data: serverCartItems = [], isLoading: cartLoading } = useCartQuery(session?.user?.id || '')
  const createOrderMutation = useCreateOrder()

  // Combine cart items
  const cartItems = isAuthenticated
    ? serverCartItems.map(item => ({
        item: { productId: item.product_id, quantity: item.quantity },
        product: item.product,
      })).filter(({ product }) => product)
    : guestCart.map(item => {
        const product = products.find(p => p.id === item.productId)
        return { item, product }
      }).filter(({ product }) => product)

  // Calculate totals in cents (matching useCreateOrder logic)
  const subtotal_cents = cartItems.reduce((sum, { item, product }) => sum + product.price_cents * item.quantity, 0)
  const shipping_cents = subtotal_cents >= 10000 ? 0 : 999 // Free shipping over 100 PHP
  const tax_cents = Math.round(subtotal_cents * 0.1) // 10% tax
  const total_cents = subtotal_cents + shipping_cents + tax_cents

  // Display values in pesos
  const subtotalDisplay = subtotal_cents / 100
  const shippingDisplay = shipping_cents / 100
  const taxDisplay = tax_cents / 100
  const totalDisplay = total_cents / 100

  // Pre-fill form with user profile data if authenticated
  const defaultValues = {
    name: isAuthenticated ? `${session?.user?.user_metadata?.first_name || ''} ${session?.user?.user_metadata?.last_name || ''}`.trim() : '',
    email: isAuthenticated ? session?.user?.email || '' : '',
    phone: isAuthenticated ? session?.user?.user_metadata?.phone || '' : '',
    address: { country: 'Philippines' },
    paymentMethod: 'cod',
  }

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
  })

  const onSubmit = async (data) => {
    if (!cartItems.length) return

    // Prevent duplicate submissions on rapid clicks
    if (!acquireLock()) {
      addToast({ type: 'warning', message: 'Order already being processed...' })
      return
    }

    // Generate or retrieve idempotency key from sessionStorage (Risk 4)
    let idempotencyKey = sessionStorage.getItem('checkout_idempotency_key')
    if (!idempotencyKey) {
      idempotencyKey = uuidv4()
      sessionStorage.setItem('checkout_idempotency_key', idempotencyKey)
    }

    setSubmitting(true)
    try {
      const userId = isAuthenticated ? session.user.id : null

      // For guest users, we still need a user context - open login modal with redirect
      if (!isAuthenticated) {
        addToast({ type: 'warning', message: 'Please log in to place an order' })
        // Store redirect target and open auth modal
        sessionStorage.setItem('postLoginRedirect', '/checkout')
        openAuthModal('login')
        return
      }

      const result = await createOrderMutation.mutateAsync({
        userId,
        checkoutData: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          payment_method: data.paymentMethod,
          notes: data.notes || '',
        },
        cartItems: cartItems.map(({ item, product }) => ({
          product_id: product.id,
          product: product,
          quantity: item.quantity,
        })),
        idempotencyKey,
      })

      // Clear idempotency key after successful order (only if new order created)
      if (!result.alreadyExists) {
        sessionStorage.removeItem('checkout_idempotency_key')
      }

      // Clear guest cart if needed
      if (!isAuthenticated) {
        dispatch({ type: 'CLEAR_CART' })
      }

      addToast({ type: 'success', message: 'Order placed successfully!' })
      navigate(`/order/${result.id}/confirmation`)
    } catch (error) {
      console.error('Checkout error:', error)
      addToast({ type: 'error', message: 'Failed to place order. Please try again.' })
    } finally {
      setSubmitting(false)
      releaseLock()
    }
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center">
        <p className="text-[rgb(var(--text-muted))]">Your cart is empty. <Link to="/products" className="text-[rgb(var(--accent-primary))] underline">Continue shopping</Link></p>
      </div>
    )
  }

  if (isAuthenticated && cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      <div className="bg-[rgb(var(--bg-card))] border-b border-[rgb(var(--border-subtle))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Checkout</h1>
          <p className="mt-1 text-[rgb(var(--text-muted))]">Enter your details to complete your purchase</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Info */}
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-6">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name *" {...register('name')} error={errors.name?.message} placeholder="John Doe" />
                <Input label="Email *" type="email" {...register('email')} error={errors.email?.message} placeholder="john@example.com" />
                <Input label="Phone *" {...register('phone')} error={errors.phone?.message} placeholder="+63 9XX XXX XXXX" />
              </div>
            </section>

            {/* Shipping Address */}
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-[rgb(var(--accent-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Shipping Address
              </h2>
              <div className="space-y-4">
                <Input label="Street Address *" {...register('address.street')} error={errors.address?.street?.message} placeholder="123 Main Street, Barangay" />
                <div className="grid sm:grid-cols-3 gap-4">
                  <Input label="City *" {...register('address.city')} error={errors.address?.city?.message} placeholder="Manila" />
                  <Input label="State/Province *" {...register('address.state')} error={errors.address?.state?.message} placeholder="Metro Manila" />
                  <Input label="ZIP Code *" {...register('address.zip')} error={errors.address?.zip?.message} placeholder="1000" />
                </div>
                <Input label="Country *" {...register('address.country')} error={errors.address?.country?.message} placeholder="Philippines" />
              </div>
            </section>

            {/* Payment Method */}
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-[rgb(var(--accent-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Method
              </h2>
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <label key={method.value} className="relative flex items-center p-4 border border-[rgb(var(--border-subtle))] rounded-lg cursor-pointer transition-colors hover:border-[rgb(var(--accent-primary))] has-[:checked]:border-[rgb(var(--accent-primary))] has-[:checked]:bg-[rgb(var(--accent-primary))/0.1]">
                    <input type="radio" {...register('paymentMethod')} value={method.value} className="sr-only peer" />
                    <div className="w-5 h-5 border-2 border-[rgb(var(--border-subtle))] rounded-full flex items-center justify-center peer-checked:border-[rgb(var(--accent-primary))] peer-checked:bg-[rgb(var(--accent-primary))] peer-focus:ring-2 peer-focus:ring-[rgb(var(--accent-primary))] peer-focus:ring-offset-2 peer-focus:ring-offset-[rgb(var(--bg-base))]">
                      <div className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--text-primary))] peer-checked:block hidden" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-[rgb(var(--text-primary))]">{method.label}</p>
                      <p className="text-sm text-[rgb(var(--text-muted))]">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.paymentMethod && <p className="mt-2 text-sm text-[rgb(var(--accent-danger))]" role="alert">{errors.paymentMethod.message}</p>}
            </section>

            {/* Order Notes */}
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Order Notes (Optional)</h2>
              <textarea {...register('notes')} rows={3} className="input resize-none" placeholder="Special instructions for delivery..." />
            </section>

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Place Order - {formatCurrency(totalDisplay)}
            </Button>
          </div>

          {/* Order Summary */}
          <div>
            <aside className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {cartItems.map(({ item, product }) => (
                  <div key={product.id} className="flex gap-3">
                    <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" loading="lazy" onError={(e) => { e.currentTarget.src = '/images/placeholder-product.svg'; e.currentTarget.onerror = null; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">{product.name}</p>
                      <p className="text-sm text-[rgb(var(--text-muted))]">{formatCurrency(product.price_cents / 100)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))] self-center">{formatCurrency(product.price_cents * item.quantity / 100)}</p>
                  </div>
                ))}
              </div>
              <dl className="mt-4 space-y-2 text-sm border-t border-[rgb(var(--border-subtle))] pt-4">
                <div className="flex justify-between"><dt className="text-[rgb(var(--text-muted))]">Subtotal</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{formatCurrency(subtotalDisplay)}</dd></div>
                <div className="flex justify-between"><dt className="text-[rgb(var(--text-muted))]">Shipping</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{shipping_cents === 0 ? 'Free' : formatCurrency(shippingDisplay)}</dd></div>
                <div className="flex justify-between"><dt className="text-[rgb(var(--text-muted))]">Tax (10%)</dt><dd className="font-medium text-[rgb(var(--text-primary))]">{formatCurrency(taxDisplay)}</dd></div>
                <div className="flex justify-between text-base font-semibold text-[rgb(var(--text-primary))] border-t border-[rgb(var(--border-subtle))] pt-2"><dt>Total</dt><dd>{formatCurrency(totalDisplay)}</dd></div>
              </dl>
              <p className="mt-4 text-xs text-center text-[rgb(var(--text-muted))]">
                Your information is secure.
                <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </p>
            </aside>
          </div>
        </form>
      </div>
    </div>
  )
}