import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import { useDebouncedLocalStorage } from '../hooks/useLocalStorage'
import { generateId } from '../utils/helpers'

const AppContext = createContext(null)

// Simplified state - only UI state and guest cart
const initialState = {
  cart: [], // Guest cart only
  ui: { toasts: [] }
}

function appReducer(state, action) {
  switch (action.type) {
    // Cart (guest only)
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

    // UI
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

export function AppProvider({ children }) {
  // Guest cart only - persisted to localStorage
  const [cart, setCartLS] = useDebouncedLocalStorage('ecommerce_cart', [], 300)

  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    cart
  })

  // Sync state to localStorage (debounced)
  useEffect(() => { setCartLS(state.cart) }, [state.cart, setCartLS])

  // Auth modal state - controlled by Navbar but triggerable from anywhere
  const [authModalState, setAuthModalState] = useState({ isOpen: false, mode: 'login' })
  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalState({ isOpen: true, mode })
  }, [])
  const closeAuthModal = useCallback(() => {
    setAuthModalState({ isOpen: false, mode: 'login' })
  }, [])

  // Actions - exported for direct import by components that don't use context
  const addToast = useCallback((toast) => { dispatch({ type: 'ADD_TOAST', payload: toast }) }, [])
  const removeToast = useCallback((id) => { dispatch({ type: 'REMOVE_TOAST', payload: id }) }, [])

  const value = {
    cart: state.cart,
    dispatch,
    ui: state.ui,
    openAuthModal,
    closeAuthModal,
    authModalState,
    addToast,
    removeToast,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}

// Standalone toast functions for components that import directly
let _dispatch = null
export function setDispatch(dispatch) { _dispatch = dispatch }
export function addToast(toast) { if (_dispatch) _dispatch({ type: 'ADD_TOAST', payload: toast }) }
export function removeToast(id) { if (_dispatch) _dispatch({ type: 'REMOVE_TOAST', payload: id }) }