"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/contexts/sidebar-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Don't show sidebar on create quotation and thank-you pages
  const hideSidebar = pathname.includes("/quotations/create") || pathname.includes("/quotations/thank-you")

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1 flex-row relative">
          {!hideSidebar && <DashboardSidebar />}
          <main className="flex-1 w-full overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
