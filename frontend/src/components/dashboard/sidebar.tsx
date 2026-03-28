"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { FileText, Home, Eye, ChevronDown, Menu, X } from "lucide-react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [quotationsExpanded, setQuotationsExpanded] = useState(pathname.includes("/quotations"))
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
      <aside className={`fixed md:fixed top-14 sm:top-16 left-0 w-64 bg-white border-r border-gray-200 h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] transition-all duration-300 z-30 ${
        mobileMenuOpen ? "left-0" : "-left-64"
      }`}>
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

        {/* Quoted Proposals Menu */}
        <div>
          <button
            onClick={() => setQuotationsExpanded(!quotationsExpanded)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition ${
              quotationsExpanded ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={20} />
              <span>Quoted Proposals</span>
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform ${quotationsExpanded ? "rotate-180" : ""}`}
            />
          </button>

          {quotationsExpanded && (
            <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${
                  pathname === "/dashboard"
                    ? "bg-red-100 text-red-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <FileText size={16} />
                <span>My Proposals</span>
              </Link>

              <Link
                href="/dashboard/quotations/create"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${
                  pathname === "/dashboard/quotations/create"
                    ? "bg-red-100 text-red-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <FileText size={16} />
                <span>Create Proposal</span>
              </Link>

              <div className="border-t border-gray-200 pt-2 mt-2">
                <p className="text-xs font-semibold text-gray-500 px-4 py-2 uppercase">Pricing</p>
                <div className="space-y-1">
                  <p className="px-4 py-2 text-xs text-gray-600 flex items-center gap-2">
                    <Eye size={14} />
                    <span>View Priced Quotations</span>
                  </p>
                  <p className="px-4 py-2 text-xs text-gray-500 ml-6">
                    You&apos;ll see priced quotations here when the admin sets prices
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
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
