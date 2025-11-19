"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Briefcase, ShoppingCart, Layers, Users, Settings, X, ChevronRight, MapPin, Lock, ChevronDown } from 'lucide-react'
import { useState } from "react"
import Image from 'next/image'

interface SidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: MapPin, label: "Branches", href: "/admin/branches" },
  { icon: Lock, label: "Roles & Permissions", href: "/admin/roles" },
  { icon: Users, label: "Members", href: "/admin/members" },
  {
    icon: Package,
    label: "Products",
    href: "/admin/products",
    submenu: [
      { label: "All Products", href: "/admin/products" },
      { label: "Product Categories", href: "/admin/products/categories" },
      { label: "Product Colors", href: "/admin/products/colors" },
      { label: "Product Sizes", href: "/admin/products/sizes" },
    ]
  },
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
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fadeIn"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-20 lg:top-0 inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-neutral-900 to-neutral-950 text-white transform transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header - Hidden on lg screens */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-red-600/30 bg-gradient-to-r from-red-600/10 to-orange-600/10 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/logo.png"
                alt="Princess Jaidee Logo"
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                PRINCESS
              </span>
              <span className="block font-bold text-xs text-red-400">JAIDEE</span>
            </div>
          </div>
          <button
            onClick={() => onToggle(false)}
            className="lg:hidden p-1 hover:bg-red-600/20 rounded-lg transition"
          >
            <X size={24} className="text-red-400" />
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
                        : "text-neutral-400 hover:bg-neutral-800/50 hover:text-red-400"
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
                        : "text-neutral-400 hover:bg-neutral-800/50 hover:text-red-400"
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
                  <div className="ml-4 mt-2 space-y-1 border-l border-red-600/30 pl-4">
                    {item.submenu?.map((subitem) => (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
                        className={`block px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                          pathname === subitem.href
                            ? "bg-red-600/20 text-red-300 font-medium"
                            : "text-neutral-400 hover:bg-neutral-800/50 hover:text-red-400"
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
        <div className="border-t border-red-600/30 p-6 bg-gradient-to-r from-red-600/5 to-orange-600/5">
          <p className="text-xs text-neutral-500 text-center leading-relaxed">
            &copy; 2025 Princess Jaidee Enterprises. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  )
}
