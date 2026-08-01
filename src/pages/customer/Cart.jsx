import { useAppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatters'
import { CartItem } from '../../components/cart/CartItem'
import { CartSummary } from '../../components/cart/CartSummary'

export function Cart() {
  const { cart, products, dispatch } = useAppContext()

  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId)
    return { item, product }
  }).filter(({ product }) => product)

  const subtotal = cartItems.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0)

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <svg className="mx-auto h-24 w-24 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">Your cart is empty</h2>
          <p className="mt-2 text-slate-500">Looks like you haven't added any products yet.</p>
          <Link to="/products" className="mt-6 btn-primary inline-flex"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="mt-1 text-slate-500">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(({ item, product }) => (
              <CartItem key={product.id} item={item} product={product} />
            ))}
          </div>
          <div>
            <CartSummary subtotal={subtotal} onCheckout={() => {}} />
            <Link to="/checkout" className="block mt-4">
              <button className="w-full btn-primary py-3 text-lg">Proceed to Checkout</button>
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/products" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}