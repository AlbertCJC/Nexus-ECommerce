import { useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'

export function LoginPage() {
  const { openAuthModal, authModalState } = useAppContext()

  useEffect(() => {
    if (!authModalState.isOpen) {
      openAuthModal('login')
    }
  }, [openAuthModal, authModalState.isOpen])

  return null
}