"use client"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"


export default function QuotationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
    const [user, setUser] = useState(null)
  
    useEffect(() => {
      checkAuth()
    }, [router])
  
    const checkAuth = () => {
      const token = localStorage.getItem("admin_token")
      const userData = localStorage.getItem("admin_user")
  
      if (!token || !userData) {
        router.push("/admin")
        return
      }
      setUser(JSON.parse(userData))
      setIsLoading(false)
    }

  return (
    <div className="flex h-screen flex-col  bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <h1 className="text-3xl font-bold mb-4">Quotations Management</h1>
          <p className="text-neutral-600">View, approve, and manage customer quotations with scheduling</p>
          <div className="mt-8 bg-white rounded-xl p-12 text-center">
            <p className="text-neutral-600">Quotations module with send scheduling ready for implementation</p>
          </div>
        </main>
      </div>
    </div>
  )
}
