'use client'

import { ReactNode } from 'react'
import { ToastContainer } from './toast-container'
import { useToastNotification } from '@/hooks/use-toast-notification'

export function LayoutClient({ children }: { children: ReactNode }) {
  const { toasts, removeToast } = useToastNotification()

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
