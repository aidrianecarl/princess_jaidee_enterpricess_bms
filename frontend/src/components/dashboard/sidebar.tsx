"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { FileText, Home, Menu, X } from "lucide-react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-14 sm:top-16 left-0 w-64 bg-white border-r border-gray-200 
        h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] 
        transition-all duration-300 z-30 
        ${mobileMenuOpen ? "left-0" : "-left-64 md:left-0"}`}
      >
        <nav className="p-6 space-y-2">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
              isActive("/dashboard")
                ? "bg-red-100 text-red-600 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>

          {/* Quoted Proposals */}
          <Link
            href="/dashboard/quoted-proposals"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
              isActive("/dashboard/quoted-proposals")
                ? "bg-red-100 text-red-600 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileText size={20} />
            <span>Quoted Proposals</span>
          </Link>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}