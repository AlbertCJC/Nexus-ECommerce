import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import { useLocalStorageSync } from '../hooks/useLocalStorage'
import { seedProducts, seedCategories, seedOrders, seedCustomers, ADMIN_CREDENTIALS } from '../data/seedData'
import { generateId } from '../utils/helpers'

const AppContext = createContext(null)

const initialState = {
  products: [],
  categories: [],
  orders: [],
  customers: [],
  cart: [],
  auth: { isAuthenticated: false, token: null },
  ui: { loading: true, toasts: [] }
}

function appReducer(state, action) {
  switch (action.type) {
    // Products
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload }
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] }
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) }
    case 'SET_PRODUCT_STATUS':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? { ...p, status: action.payload.status } : p) }

    // Categories
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) }

    // Orders
    case 'SET_ORDERS':
      return { ...state, orders: action.payload }
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] }
    case 'UPDATE_ORDER_STATUS':
      return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? { ...o, status: action.payload.status } : o) }
    case 'UPDATE_ORDER':
      return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o) }

    // Customers (derived from orders)
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload }
    case 'REFRESH_CUSTOMERS':
      return { ...state, customers: deriveCustomers(state.orders) }

    // Cart
    case 'SET_CART':
      return { ...state, cart: action.payload }
    case 'ADD_TO_CART': {
      const existing = state.cart.find(item => item.productId === action.payload.productId)
      if (existing) {
        return { ...state, cart: state.cart.map(item => item.productId === action.payload.productId ? { ...item, quantity: item.quantity + action.payload.quantity } : item) }
      }
      return { ...state, cart: [...state.cart, action.payload] }
    }
    case 'UPDATE_CART_QUANTITY':
      return { ...state, cart: state.cart.map(item => item.productId === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item).filter(item => item.quantity > 0) }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.productId !== action.payload) }
    case 'CLEAR_CART':
      return { ...state, cart: [] }

    // Auth
    case 'SET_AUTH':
      return { ...state, auth: action.payload }
    case 'LOGOUT':
      return { ...state, auth: { isAuthenticated: false, token: null } }

    // UI
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, loading: action.payload } }
    case 'ADD_TOAST': {
      const id = generateId('toast-')
      return { ...state, ui: { ...state.ui, toasts: [...state.ui.toasts, { id, ...action.payload }] } }
    }
    case 'REMOVE_TOAST':
      return { ...state, ui: { ...state.ui, toasts: state.ui.toasts.filter(t => t.id !== action.payload) } }

    default:
      return state
  }
}

function deriveCustomers(orders) {
  const customerMap = new Map()
  orders.forEach(order => {
    const key = order.customer.email
    if (!customerMap.has(key)) {
      customerMap.set(key, { ...order.customer, id: `cust-${key}`, orderCount: 0, totalSpent: 0, status: 'active' })
    }
    const cust = customerMap.get(key)
    cust.orderCount += 1
    cust.totalSpent += order.total
  })
  return Array.from(customerMap.values())
}

function seedIfEmpty(key, seedData) {
  const existing = localStorage.getItem(key)
  if (!existing) {
    localStorage.setItem(key, JSON.stringify(seedData))
    return seedData
  }
  try { return JSON.parse(existing) } catch { return seedData }
}

export function AppProvider({ children }) {
  const [products, setProductsLS] = useLocalStorageSync('ecommerce_products', seedIfEmpty('ecommerce_products', seedProducts))
  const [categories, setCategoriesLS] = useLocalStorageSync('ecommerce_categories', seedIfEmpty('ecommerce_categories', seedCategories))
  const [orders, setOrdersLS] = useLocalStorageSync('ecommerce_orders', seedIfEmpty('ecommerce_orders', seedOrders))
  const [cart, setCartLS] = useLocalStorageSync('ecommerce_cart', [])
  const [auth, setAuthLS] = useLocalStorageSync('ecommerce_auth', { isAuthenticated: false, token: null })
  const [ui, setUi] = useState({ loading: true, toasts: [] })

  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    products, categories, orders, cart, auth, ui
  })

  // Sync state to localStorage (debounced)
  useEffect(() => { setProductsLS(state.products) }, [state.products, setProductsLS])
  useEffect(() => { setCategoriesLS(state.categories) }, [state.categories, setCategoriesLS])
  useEffect(() => { setOrdersLS(state.orders) }, [state.orders, setOrdersLS])
  useEffect(() => { setCartLS(state.cart) }, [state.cart, setCartLS])
  useEffect(() => { setAuthLS(state.auth) }, [state.auth, setAuthLS])

  // Refresh customers when orders change
  useEffect(() => { dispatch({ type: 'SET_CUSTOMERS', payload: deriveCustomers(state.orders) }) }, [state.orders])

  // Hide loading after first render
  useEffect(() => { setUi(s => ({ ...s, loading: false })) }, [])

  // Actions
  const addToast = useCallback((toast) => { dispatch({ type: 'ADD_TOAST', payload: toast }) }, [])
  const removeToast = useCallback((id) => { dispatch({ type: 'REMOVE_TOAST', payload: id }) }, [])

  const login = useCallback((email, password) => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const token = generateId('token-')
      dispatch({ type: 'SET_AUTH', payload: { isAuthenticated: true, token } })
      addToast({ type: 'success', message: 'Welcome back, Admin!' })
      return true
    }
    addToast({ type: 'error', message: 'Invalid credentials' })
    return false
  }, [addToast])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
    addToast({ type: 'info', message: 'Logged out successfully' })
  }, [addToast])

  const value = {
    ...state,
    login,
    logout,
    addToast,
    removeToast,
    dispatch
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}