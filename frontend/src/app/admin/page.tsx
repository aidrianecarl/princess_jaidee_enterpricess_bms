"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { AdminAuthForm } from "@/components/admin/auth-form"

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("admin_token")
    if (token) {
      router.push("/admin/dashboard")
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
          </div>
          <p className="text-neutral-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4 py-12 md:py-0 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-32 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-blob animation-delay-2s" />
      </div>

      <div className="w-full max-w-md md:max-w-lg relative z-10">
        <AdminAuthForm />
      </div>
    </main>
  )
}
