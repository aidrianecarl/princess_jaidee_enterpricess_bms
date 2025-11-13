"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Briefcase,
  ShoppingCart,
  Layers,
  Users,
  Settings,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: Briefcase, label: "Services", href: "/admin/services" },
  { icon: ShoppingCart, label: "Quotations", href: "/admin/quotations" },
  { icon: Layers, label: "Sales/Orders", href: "/admin/orders" },
  { icon: LayoutDashboard, label: "Job Orders", href: "/admin/job-orders" },
  { icon: Users, label: "Members", href: "/admin/members" },
  { icon: Settings, label: "Roles & Permissions", href: "/admin/roles" },
  { icon: Briefcase, label: "Branches", href: "/admin/branches" },
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
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => onToggle(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-white transform transition-transform duration-200 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PJ</span>
            </div>
            <span className="font-bold text-lg">Admin</span>
          </div>
          <button onClick={() => onToggle(false)} className="lg:hidden p-1 hover:bg-neutral-800 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive ? "bg-primary text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
                onClick={() => onToggle(false)}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-neutral-800 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-50/10 rounded-lg transition"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
