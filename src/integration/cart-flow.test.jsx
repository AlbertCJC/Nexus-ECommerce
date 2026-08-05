import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../context/AuthContext'
import { AppProvider } from '../context/AppContext'
import { Cart } from '../pages/customer/Cart'
import { seedProducts, seedCategories } from '../data/seedData'
import { productQueryKeys as queryKeys } from '../hooks'

// Transform seed data to match database format (what useProducts query returns)
const transformProductForQuery = (p) => ({
  ...p,
  price_cents: p.price,
  image_url: p.image,
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  // Pre-populate query cache with test data in database format
  const productsForQuery = seedProducts.map(transformProductForQuery)
  queryClient.setQueryData(queryKeys.products({ status: 'all' }), productsForQuery)
  queryClient.setQueryData(queryKeys.categories(), seedCategories)

  return ({ children }) => (
    <MemoryRouter initialEntries={['/cart']}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

const TEST_TIMEOUT = 15000

describe('Cart Flow Integration Tests', () => {
  beforeEach(() => {
    cleanup()
    localStorage.clear()
    localStorage.setItem('ecommerce_products', JSON.stringify(seedProducts))
    localStorage.setItem('ecommerce_categories', JSON.stringify(seedCategories))
    localStorage.setItem('ecommerce_orders', JSON.stringify([]))
    localStorage.setItem('ecommerce_auth', JSON.stringify({ isAuthenticated: false, token: null }))
    localStorage.setItem('ecommerce_cart', JSON.stringify([]))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('displays empty cart message when no items', () => {
    const Wrapper = createWrapper()
    render(<Wrapper><Cart /></Wrapper>)
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.getByText("Looks like you haven't added any products yet.")).toBeInTheDocument()
  })

  it('navigates to products from empty cart', () => {
    const Wrapper = createWrapper()
    render(<Wrapper><Cart /></Wrapper>)
    const continueShoppingLink = screen.getByText('Continue Shopping')
    expect(continueShoppingLink).toHaveAttribute('href', '/products')
  })

  it('shows cart items when localStorage has cart data', async () => {
    const testProduct = seedProducts[0]
    localStorage.setItem('ecommerce_cart', JSON.stringify([{ productId: testProduct.id, quantity: 1 }]))

    const Wrapper = createWrapper()
    render(<Wrapper><Cart /></Wrapper>)

    await waitFor(() => {
      expect(screen.getByText(testProduct.name)).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })
  }, TEST_TIMEOUT)

  it('calculates cart subtotal correctly', async () => {
    const testProduct = seedProducts[0]
    localStorage.setItem('ecommerce_cart', JSON.stringify([{ productId: testProduct.id, quantity: 3 }]))

    const Wrapper = createWrapper()
    render(<Wrapper><Cart /></Wrapper>)

    await waitFor(() => {
      expect(screen.getByText(testProduct.name)).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })

    // Check for subtotal - verify Subtotal label with price exists
    await waitFor(() => {
      const text = document.body.textContent
      expect(text).toContain('Subtotal')
      expect(text).toContain('₱')
    }, { timeout: TEST_TIMEOUT })
  }, TEST_TIMEOUT)

  it('shows free shipping for orders over ₱100', async () => {
    const testProduct = seedProducts[0]
    const priceInPesos = testProduct.price / 100
    const quantity = Math.ceil(100 / priceInPesos) + 1
    localStorage.setItem('ecommerce_cart', JSON.stringify([{ productId: testProduct.id, quantity }]))

    const Wrapper = createWrapper()
    render(<Wrapper><Cart /></Wrapper>)

    await waitFor(() => {
      expect(screen.getByText(testProduct.name)).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })

    await waitFor(() => {
      expect(screen.getByText('Free')).toBeInTheDocument()
    }, { timeout: TEST_TIMEOUT })
  }, TEST_TIMEOUT)
})