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
      <div className="min-h-screen bg-gradient-to-b from-white to-red-50/20 flex flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 pt-16 md:pt-20 max-w-7xl mx-auto w-full px-4 py-12">
          <div className="h-96 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl animate-pulse" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50/20 flex flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 pt-16 md:pt-20 w-full overflow-auto">
        <ManageAccountContent user={user} />
      </main>
      <Toaster />
    </div>
  )
}
