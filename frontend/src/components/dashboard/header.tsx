"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, Settings, ChevronDown, Bell, Menu, X, Home } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  user: any
}

export function DashboardHeader({ user }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <header className="bg-white border-b border-red-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-200/50 transition">
              <span className="text-white font-bold text-sm">PJ</span>
            </div>
            <div>
              <span className="font-bold text-base bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent hidden sm:inline">
                Princess Jaidee
              </span>
              <p className="text-xs text-neutral-500">Enterprise BMS</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Home Link */}
            <Link
              href="/dashboard"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-red-50 transition group"
            >
              <Home size={20} className="text-neutral-600 group-hover:text-red-600 transition" />
            </Link>

            {/* Notifications */}
            <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-red-50 transition relative group">
              <Bell size={20} className="text-neutral-600 group-hover:text-red-600 transition" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition">
                  <span className="text-white text-sm font-bold">{user?.first_name?.charAt(0) || "U"}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-neutral-900">{user?.first_name || "User"}</p>
                  <p className="text-xs text-neutral-500">Account</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-neutral-600 transition duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-red-100 shadow-2xl overflow-hidden animate-slideDown z-[60]">
                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
                    <p className="font-bold text-neutral-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-sm text-neutral-600">{user?.email}</p>
                  </div>

                  <Link
                    href="#"
                    className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-red-50 transition duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition">
                      <User size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Manage Account</p>
                      <p className="text-xs text-neutral-500">Update profile info</p>
                    </div>
                  </Link>

                  <Link
                    href="#"
                    className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-purple-50 transition duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:scale-110 transition">
                      <Settings size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Settings</p>
                      <p className="text-xs text-neutral-500">Preferences</p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition duration-200 border-t border-red-100 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:scale-110 transition">
                      <LogOut size={18} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Logout</p>
                      <p className="text-xs text-neutral-500">Sign out securely</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-red-50 transition"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
