"use client"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useState } from "react"

export default function QuotationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen">
      <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={null} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto p-6">
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
