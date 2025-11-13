"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, Settings, ChevronDown } from "lucide-react"

interface HeaderProps {
  user: any
}

export function DashboardHeader({ user }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">PJ</span>
            </div>
            <span className="font-bold text-lg text-neutral-900 hidden sm:inline">Princess Jaidee</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-100 transition"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{user?.first_name?.charAt(0) || "U"}</span>
              </div>
              <span className="text-sm font-medium text-neutral-900 hidden sm:inline">
                {user?.first_name || "User"}
              </span>
              <ChevronDown size={16} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-neutral-200 shadow-lg">
                <div className="p-4 border-b border-neutral-200">
                  <p className="font-semibold text-neutral-900">{user?.full_name}</p>
                  <p className="text-sm text-neutral-600">{user?.email}</p>
                </div>

                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-50 transition"
                >
                  <User size={18} />
                  Manage Account
                </a>

                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-50 transition"
                >
                  <Settings size={18} />
                  Settings
                </a>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition border-t border-neutral-200"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
