"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { usePathname } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Don't show sidebar on create quotation page
  const hideSidebar = pathname.includes("/quotations/create")

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex flex-1 ${hideSidebar ? "" : "flex-row"}`}>
        {!hideSidebar && (
          <div className="hidden md:block">
            <DashboardSidebar />
          </div>
        )}
        <main className="flex-1 w-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
