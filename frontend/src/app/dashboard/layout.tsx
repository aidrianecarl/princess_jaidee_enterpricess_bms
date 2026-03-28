"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { usePathname } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Don't show sidebar on create quotation page
  const hideSidebar = pathname.includes("/quotations/create")

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main flex container - sidebar and content */}
      <div className="flex flex-1 pt-14 sm:pt-16">
        {/* Sidebar - hidden on create page and on mobile */}
        {!hideSidebar && (
          <div className="hidden md:block w-64">
            <DashboardSidebar />
          </div>
        )}
        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
