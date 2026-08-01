import { useAppContext } from '../../context/AppContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema } from '../../utils/validation'
import { formatCurrency } from '../../utils/formatters'
import { generateId } from '../../utils/helpers'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const paymentMethods = [
  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
  { value: 'ewallet', label: 'E-Wallet', desc: 'Pay with digital wallet (GCash, PayMaya, etc.)' },
  { value: 'bank', label: 'Bank Transfer', desc: 'Transfer via online banking' },
]

export function Checkout() {
  const { cart, products, dispatch, addToast } = useAppContext()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId)
    return { item, product }
  }).filter(({ product }) => product)

  const subtotal = cartItems.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0)
  const shipping = subtotal >= 100 ? 0 : 9.99
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  if (!cart.length) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Your cart is empty. <Link to="/products" className="text-primary-600 underline">Continue shopping</Link></p></div>
  }

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { address: { country: 'USA' } }
  })

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const orderId = generateId('ord-')
      const order = {
        id: orderId,
        customer: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address
        },
        items: cartItems.map(({ item, product }) => ({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.image
        })),
        subtotal,
        shipping,
        tax,
        total,
        paymentMethod: data.paymentMethod,
        status: 'pending',
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      }
      dispatch({ type: 'ADD_ORDER', payload: order })
      dispatch({ type: 'CLEAR_CART' })
      addToast({ type: 'success', message: 'Order placed successfully!' })
      navigate(`/order/${orderId}/confirmation`)
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to place order. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="mt-1 text-slate-500">Enter your details to complete your purchase</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Info */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name *" {...register('name')} error={errors.name?.message} placeholder="John Doe" />
                <Input label="Email *" type="email" {...register('email')} error={errors.email?.message} placeholder="john@example.com" />
                <Input label="Phone *" {...register('phone')} error={errors.phone?.message} placeholder="+1 (555) 123-4567" />
              </div>
            </section>

            {/* Shipping Address */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2"><svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> Shipping Address</h2>
              <div className="space-y-4">
                <Input label="Street Address *" {...register('address.street')} error={errors.address?.street?.message} placeholder="123 Main Street" />
                <div className="grid sm:grid-cols-3 gap-4">
                  <Input label="City *" {...register('address.city')} error={errors.address?.city?.message} placeholder="New York" />
                  <Input label="State *" {...register('address.state')} error={errors.address?.state?.message} placeholder="NY" />
                  <Input label="ZIP Code *" {...register('address.zip')} error={errors.address?.zip?.message} placeholder="10001" />
                </div>
                <Input label="Country *" {...register('address.country')} error={errors.address?.country?.message} placeholder="USA" />
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2"><svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <label key={method.value} className="relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                    <input type="radio" {...register('paymentMethod')} value={method.value} className="sr-only peer" />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded-full flex items-center justify-center peer-checked:border-primary-500 peer-checked:bg-primary-500 peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-white peer-checked:block hidden" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-slate-900">{method.label}</p>
                      <p className="text-sm text-slate-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.paymentMethod && <p className="mt-2 text-sm text-red-600" role="alert">{errors.paymentMethod.message}</p>}
            </section>

            {/* Order Notes */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Notes (Optional)</h2>
              <textarea {...register('notes')} rows={3} className="input resize-none" placeholder="Special instructions for delivery..." />
            </section>

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> Place Order - {formatCurrency(total)}
            </Button>
          </div>

          {/* Order Summary */}
          <div>
            <aside className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {cartItems.map(({ item, product }) => (
                  <div key={product.id} className="flex gap-3">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(product.price)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 self-center">{formatCurrency(product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <dl className="mt-4 space-y-2 text-sm border-t border-slate-200 pt-4">
                <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd className="font-medium text-slate-900">{formatCurrency(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-600">Shipping</dt><dd className="font-medium text-slate-900">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-600">Tax (10%)</dt><dd className="font-medium text-slate-900">{formatCurrency(tax)}</dd></div>
                <div className="flex justify-between text-base font-semibold text-slate-900 border-t border-slate-200 pt-2"><dt>Total</dt><dd>{formatCurrency(total)}</dd></div>
              </dl>
              <p className="mt-4 text-xs text-center text-slate-500">Your information is secure. <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></p>
            </aside>
          </div>
        </form>
      </div>
    </div>
  )
}