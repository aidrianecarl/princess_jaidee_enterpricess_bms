'use client'

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const bgGradient = {
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    error: 'bg-gradient-to-r from-red-600 to-red-700',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600',
  }[toast.type]

  const icon = {
    success: <CheckCircle size={20} className="text-white flex-shrink-0" />,
    error: <AlertCircle size={20} className="text-white flex-shrink-0" />,
    info: <Info size={20} className="text-white flex-shrink-0" />,
  }[toast.type]

  return (
    <div
      className={`${bgGradient} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-sm border border-white/20 pointer-events-auto min-w-[320px] max-w-md transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full -translate-y-2' : 'opacity-100 translate-x-0'
      }`}
    >
      {icon}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => onRemove(toast.id), 300)
        }}
        className="hover:bg-white/20 p-1 rounded-lg transition-colors flex-shrink-0"
        aria-label="Close notification"
      >
        <X size={18} className="text-white" />
      </button>
    </div>
  )
}
