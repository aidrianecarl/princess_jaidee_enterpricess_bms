"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { ManageAccountContent } from "@/components/dashboard/manage-account"
import { Toaster } from "@/components/ui/toaster"

export default function ManageAccountPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user")

      if (!token || !userData) {
        router.push("/")
        return
      }

      setUser(JSON.parse(userData))
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50/20">

      {/* Header (responsive offset) */}
      <div className="lg:ml-64">
        <DashboardHeader user={user} />
      </div>

      {/* Main Content */}
      <main className="pt-[20px] px-4 sm:px-6 lg:px-8 lg:ml-64">
        {isLoading ? (
          <div className="max-w-7xl mx-auto py-8 sm:py-12">
            <div className="h-96 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <ManageAccountContent user={user} />
        )}
      </main>

      <Toaster />
    </div>
  )
}