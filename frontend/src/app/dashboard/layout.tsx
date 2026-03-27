"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <DashboardSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
