"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { FileText, Home, Eye, ChevronDown, Menu, X, Package, CheckCircle } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [quotationsExpanded, setQuotationsExpanded] = useState(pathname.includes("/quotations"))
  const { isOpen: mobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useSidebar()

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-14 sm:top-16 left-0 w-64 
        bg-white border-r border-gray-200 shadow-lg
        h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] 
        overflow-y-auto
        transition-all duration-300 ease-in-out z-40
        transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
      <nav className="p-6 space-y-2">
        {/* Main Menu */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
            isActive("/dashboard")
              ? "bg-red-100 text-red-600 font-semibold"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Home size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
            href="/dashboard/quoted-proposals"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${isActive("/dashboard/quoted-proposals")
                ? "bg-red-100 text-red-600 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <CheckCircle size={20} />
            <span>Quoted Proposal</span>
          </Link>

        <Link
            href="/dashboard/my-orders"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${isActive("/dashboard/my-orders")
                ? "bg-red-100 text-red-600 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Package size={20} />
            <span>My Orders</span>
          </Link>
      </nav>
    </aside>

    {/* Mobile Overlay */}
    {mobileMenuOpen && (
      <div
        className="fixed inset-0 bg-opacity-30 md:hidden z-30 transition-all duration-300"
        onClick={closeMobileMenu}
      />
    )}
    </>
  )
}

export function DashboardSidebarToggle({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="md:hidden p-2 hover:bg-red-50 rounded-lg transition duration-200 group"
      aria-label="Toggle sidebar"
    >
      {isOpen ? (
        <X size={24} className="text-neutral-600 group-hover:text-red-600" />
      ) : (
        <Menu size={24} className="text-neutral-600 group-hover:text-red-600" />
      )}
    </button>
  )
}
