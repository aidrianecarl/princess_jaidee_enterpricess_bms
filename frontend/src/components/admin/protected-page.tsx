'use client'

import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { canAccessPage } from '@/lib/rbac-helper'

interface ProtectedPageProps {
  requiredPagePath: string // e.g., '/admin/quotations'
  children: ReactNode
}

/**
 * ProtectedPage component wraps admin pages to enforce role-based access control
 * If user doesn't have permission to access the page, they're redirected to dashboard
 */
export function ProtectedPage({ requiredPagePath, children }: ProtectedPageProps) {
  const router = useRouter()
  const { permissions, isLoading } = usePermissions()

  useEffect(() => {
    if (!isLoading && !canAccessPage(requiredPagePath, permissions)) {
      // User doesn't have permission, redirect to dashboard
      router.push('/admin/dashboard')
    }
  }, [permissions, isLoading, requiredPagePath, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!canAccessPage(requiredPagePath, permissions)) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Access Denied</h1>
          <p className="text-neutral-600 mb-6">You don&apos;t have permission to access this page</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
