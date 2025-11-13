"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AdminAuthForm />
      </div>
    </main>
  )
}
