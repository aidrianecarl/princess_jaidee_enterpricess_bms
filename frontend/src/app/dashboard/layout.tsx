"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { usePathname } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide sidebar on create quotation page
  const hideSidebar = pathname.includes("/quotations/create")

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ✅ Header (FULL WIDTH) */}
      <DashboardHeader user={null} />

      {/* ✅ Body */}
      <div className="flex">
        
        {/* ✅ Sidebar */}
        {!hideSidebar && (
          <div className="hidden md:block">
            <DashboardSidebar />
          </div>
        )}

        {/* ✅ Main Content */}
        <main
          className={`
            flex-1
            pt-14 sm:pt-16
            ${!hideSidebar ? "md:ml-64" : ""}
          `}
        >
          <div className="p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}