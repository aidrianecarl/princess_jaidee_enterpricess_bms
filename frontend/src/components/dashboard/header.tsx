"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, ChevronDown, Bell, Menu, X, Home } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
    <header className="w-full bg-white border-b border-red-100 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 group cursor-pointer min-w-0 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden shadow-lg group-hover:shadow-red-200/50 transition flex-shrink-0">
              <Image 
                src="/princessjd.png" 
                alt="Princess Jaidee Logo" 
                width={40} 
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="hidden sm:block min-w-0">
              <span className="font-bold text-sm md:text-base bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent block truncate">
                Princess Jaidee
              </span>
              <p className="text-xs text-neutral-500">Enterprise BMS</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Home Link */}
            {/* <Link
              href="/dashboard"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-red-50 transition group"
            >
              <Home size={20} className="text-neutral-600 group-hover:text-red-600 transition" />
            </Link> */}

            {/* Notifications */}
            <button className="hidden md:flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg hover:bg-red-50 transition relative group flex-shrink-0">
              <Bell size={18} className="md:w-5 md:h-5 text-neutral-600 group-hover:text-red-600 transition" />
              <span className="absolute top-1.5 md:top-2 right-1.5 md:right-2 w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* User Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition flex-shrink-0">
                  <span className="text-white text-xs md:text-sm font-bold">{user?.first_name?.charAt(0) || "U"}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-xs md:text-sm font-semibold text-neutral-900 truncate">{user?.first_name || "User"}</p>
                  <p className="text-xs text-neutral-500">Account</p>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-neutral-600 transition duration-300 hidden md:block md:w-4 md:h-4 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 md:mt-3 w-48 sm:w-56 bg-white rounded-lg md:rounded-2xl border border-red-100 shadow-2xl overflow-hidden animate-slideDown z-[60]">
                  <div className="p-3 md:p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
                    <p className="font-bold text-sm md:text-base text-neutral-900 truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs md:text-sm text-neutral-600 truncate">{user?.email}</p>
                  </div>

                  <Link
                    href="/dashboard/account"
                    className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 text-neutral-700 hover:bg-red-50 transition duration-200 group"
                  >
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition flex-shrink-0">
                      <User size={16} className="md:w-4.5 md:h-4.5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium truncate">Manage Account</p>
                      <p className="text-xs text-neutral-500">Update profile info</p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 text-red-600 hover:bg-red-50 transition duration-200 border-t border-red-100 group"
                  >
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:scale-110 transition flex-shrink-0">
                      <LogOut size={16} className="md:w-4.5 md:h-4.5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium">Logout</p>
                      <p className="text-xs text-neutral-500">Sign out securely</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            {/* <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-red-50 transition"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button> */}
          </div>
        </div>
      </div>
    </header>
  )
}
