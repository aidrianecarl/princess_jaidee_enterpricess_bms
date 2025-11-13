"use client"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useState } from "react"

export default function OrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen">
      <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={null} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-4">Sales & Orders</h1>
          <p className="text-neutral-600">Manage all orders, payments, and sales transactions</p>
          <div className="mt-8 bg-white rounded-xl p-12 text-center">
            <p className="text-neutral-600">Sales/Orders module with payment tracking ready</p>
          </div>
        </main>
      </div>
    </div>
  )
}
