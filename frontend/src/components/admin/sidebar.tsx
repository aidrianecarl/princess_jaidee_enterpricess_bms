"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  ShoppingCart,
  Layers,
  Users,
  X,
  ChevronRight,
  MapPin,
  Lock,
  ChevronDown,
  Package,
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface SidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: MapPin, label: "Branches", href: "/admin/branches" },
  { icon: Lock, label: "Roles & Permissions", href: "/admin/roles" },
  { icon: Users, label: "Members", href: "/admin/members" },
  { icon: Briefcase, label: "Services", href: "/admin/services" },
  { icon: ShoppingCart, label: "Quotations", href: "/admin/quotations" },
  { icon: Layers, label: "Sales/Orders", href: "/admin/orders" },
  { icon: LayoutDashboard, label: "Job Orders", href: "/admin/job-orders" },
]

export function AdminSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    window.location.href = "/admin"
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fadeIn" onClick={() => onToggle(false)} />
      )}

      <aside
        className={`fixed lg:static top-15 lg:top-0 inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white transform transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header - Hidden on lg screens */}
        <div className="h-15 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-lg">
              <Image src="/princessjd.png" alt="Princess Jaidee Logo" fill className="object-cover" />
            </div>
            <div className="sm:block">
              <span className="font-bold text-sm text-red-600">PRINCESS</span>
              <span className="block font-bold text-xs text-orange-600">JAIDEE</span>
            </div>
          </div>
          <button
            onClick={() => onToggle(false)}
            className="lg:hidden p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition"
          >
            <X size={24} className="text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            const hasSubmenu = "submenu" in item
            const isExpanded = expandedMenu === item.label

            return (
              <div key={item.label}>
                {hasSubmenu ? (
                  <button
                    onClick={() => setExpandedMenu(isExpanded ? null : item.label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-red-600"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    <ChevronDown size={16} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-red-600"
                    }`}
                    onClick={() => onToggle(false)}
                  >
                    <Icon size={20} className={`${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto animate-slideRight" />}
                  </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && isExpanded && (
                  <div className="ml-4 mt-2 space-y-1 border-l border-neutral-200 dark:border-neutral-700 pl-4">
                    {item.submenu?.map((subitem) => (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
                        className={`block px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                          pathname === subitem.href
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-red-600"
                        }`}
                        onClick={() => onToggle(false)}
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-6 bg-neutral-50 dark:bg-neutral-800/50">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center leading-relaxed">
            &copy; 2025 Princess Jaidee Enterprises. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  )
}
