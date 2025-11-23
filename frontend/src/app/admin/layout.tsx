"use client"

import { ThemeProvider } from "@/components/admin/theme-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
