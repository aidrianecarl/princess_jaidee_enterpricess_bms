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

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-white to-red-50/20">
        <DashboardHeader user={user} />
        <main className="w-full pt-20 md:pt-24">
          <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-full">
            <div className="h-96 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl animate-pulse" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-red-50/20">
      <DashboardHeader user={user} />
      <main className="w-full pt-20 md:pt-24">
        <ManageAccountContent user={user} />
      </main>
      <Toaster />
    </div>
  )
}
