'use client'

import { useState, useCallback, useEffect } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export function useToastNotification() {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Initialize from localStorage on mount (for redirects)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pendingToasts')
      if (stored) {
        const pendingToasts = JSON.parse(stored)
        if (Array.isArray(pendingToasts) && pendingToasts.length > 0) {
          setToasts(pendingToasts)
          localStorage.removeItem('pendingToasts')
        }
      }
    } catch (error) {
      console.error('Error loading toasts from localStorage:', error)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type }
    
    setToasts(prev => [newToast, ...prev])

    // Auto-remove after 5 seconds
    const timer = setTimeout(() => {
      removeToast(id)
    }, 5000)

    return id
  }, [removeToast])

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  }
}
