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
  AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { usePermissions } from "@/hooks/use-permissions"
import { SIDEBAR_MENU_ITEMS } from "@/lib/rbac-helper"

interface SidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
}

const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  MapPin,
  Lock,
  Users,
  Briefcase,
  ShoppingCart,
  Layers,
}

export function AdminSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const { permissions, isLoading } = usePermissions()
  const [accessibleItems, setAccessibleItems] = useState(SIDEBAR_MENU_ITEMS)

  useEffect(() => {
    // Filter menu items based on user permissions
    if (permissions.length > 0) {
      // Check if admin (has all permissions)
      const isAdmin = permissions.includes('manage_branches') && 
                     permissions.includes('manage_roles') && 
                     permissions.includes('view_users')
      
      if (isAdmin) {
        // Admin sees all items
        setAccessibleItems(SIDEBAR_MENU_ITEMS)
      } else {
        // Filter based on permissions
        const filtered = SIDEBAR_MENU_ITEMS.filter(item => {
          // Dashboard is always visible
          if (item.permissions.length === 0) return true
          // Check if user has any of the required permissions
          return item.permissions.some(perm => permissions.includes(perm))
        })
        setAccessibleItems(filtered)
      }
    } else if (!isLoading) {
      // If no permissions and not loading, show only dashboard
      setAccessibleItems(SIDEBAR_MENU_ITEMS.filter(item => item.permissions.length === 0))
    }
  }, [permissions, isLoading])

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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : accessibleItems.length > 0 ? (
            accessibleItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

              return (
                <Link
                  key={item.id}
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
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle size={32} className="text-neutral-400 mb-2" />
              <p className="text-xs text-neutral-500">No access assigned</p>
            </div>
          )}
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
