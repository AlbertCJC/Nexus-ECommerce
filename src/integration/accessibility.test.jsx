import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'
import { AuthProvider } from '../context/AuthContext'
import { AppProvider } from '../context/AppContext'
import { Cart } from '../pages/customer/Cart'
import { Navbar } from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Modal, ConfirmDialog } from '../components/ui/Modal'
import { seedProducts, seedCategories } from '../data/seedData'
import { productQueryKeys as queryKeys } from '../hooks'

expect.extend(toHaveNoViolations)

// Transform seed data to match database format
const transformProductForQuery = (p) => ({
  ...p,
  price_cents: p.price,
  image_url: p.image,
})

const createCartWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

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

const createNavbarWrapper = () => {
  return ({ children }) => (
    <MemoryRouter initialEntries={['/cart']}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe('Accessibility Tests', () => {
  beforeEach(() => {
    cleanup()
    localStorage.clear()
  })

  describe('Cart Page', () => {
    it('has no accessibility violations when empty', async () => {
      const Wrapper = createCartWrapper()
      const { container } = render(<Wrapper><Cart /></Wrapper>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations with items', async () => {
      const testProduct = seedProducts[0]
      localStorage.setItem('ecommerce_products', JSON.stringify(seedProducts))
      localStorage.setItem('ecommerce_categories', JSON.stringify(seedCategories))
      localStorage.setItem('ecommerce_orders', JSON.stringify([]))
      localStorage.setItem('ecommerce_cart', JSON.stringify([{ productId: testProduct.id, quantity: 1 }]))
      localStorage.setItem('ecommerce_auth', JSON.stringify({ isAuthenticated: false, token: null }))

      const Wrapper = createCartWrapper()
      const { container } = render(<Wrapper><Cart /></Wrapper>)

      // Wait for cart items to render
      await screen.findByText(testProduct.name)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Navbar', () => {
    it('has no accessibility violations', async () => {
      const Wrapper = createNavbarWrapper()
      const { container } = render(<Wrapper><Navbar /></Wrapper>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Button Component', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations when disabled', async () => {
      const { container } = render(<Button disabled>Click me</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations with loading state', async () => {
      const { container } = render(<Button loading>Click me</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Input Component', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Input label="Email" type="email" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations with error', async () => {
      const { container } = render(<Input label="Email" type="email" error="Invalid email" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Modal Component', () => {
    it('has no accessibility violations when open', async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          Modal content
        </Modal>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})