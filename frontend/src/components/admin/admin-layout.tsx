"use client"

import { type ReactNode, useState, useEffect } from "react"
import { AdminHeader } from "./header"
import { AdminSidebar } from "./sidebar"
import { useRouter } from "next/navigation"

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = () => {
    try {
      const token = localStorage.getItem("admin_token")
      const userData = localStorage.getItem("admin_user")

      if (!token || !userData) {
        router.push("/admin")
        return
      }

      setUser(JSON.parse(userData))
    } catch (error) {
      console.error("[v0] Auth check failed:", error)
      localStorage.removeItem("admin_token")
      localStorage.removeItem("admin_user")
      router.push("/admin")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
