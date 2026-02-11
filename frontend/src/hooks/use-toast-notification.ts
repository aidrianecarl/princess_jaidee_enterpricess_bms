'use client'

import { useState, useCallback, useEffect } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export function useToastNotification() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    setIsMounted(true)
    try {
      const stored = localStorage.getItem('pendingToasts')
      if (stored) {
        const pendingToasts = JSON.parse(stored)
        if (Array.isArray(pendingToasts) && pendingToasts.length > 0) {
          setToasts(pendingToasts)
          localStorage.removeItem('pendingToasts')
          
          // Auto-remove after 5 seconds
          setTimeout(() => {
            setToasts([])
          }, 5000)
        }
      }
    } catch (error) {
      console.error('Error loading toasts from localStorage:', error)
    }
  }, [])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type }
    
    setToasts(prev => [newToast, ...prev])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Persist to localStorage when toasts change
  useEffect(() => {
    if (isMounted && toasts.length > 0) {
      try {
        localStorage.setItem('pendingToasts', JSON.stringify(toasts))
      } catch (error) {
        console.error('Error saving toasts to localStorage:', error)
      }
    }
  }, [toasts, isMounted])

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  }
}
