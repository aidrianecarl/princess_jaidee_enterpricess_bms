"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, LogOut, User, Settings, Bell, ChevronDown } from "lucide-react"

interface HeaderProps {
  user: any
  onMenuClick: () => void
}

export function AdminHeader({ user, onMenuClick }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    router.push("/admin")
  }

  return (
    <header className="bg-white border-b border-neutral-200 h-20 flex items-center px-6 sticky top-0 z-40">
      <div className="flex items-center justify-between w-full">
        {/* Left */}
        <button onClick={onMenuClick} className="p-2 hover:bg-neutral-100 rounded-lg transition lg:hidden">
          <Menu size={24} />
        </button>

        {/* Center/Right */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Notifications */}
          <button className="p-2 hover:bg-neutral-100 rounded-lg relative transition">
            <Bell size={20} className="text-neutral-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{user?.first_name?.charAt(0) || "A"}</span>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-neutral-900">{user?.first_name}</p>
                <p className="text-xs text-neutral-600 capitalize">{user?.user_type}</p>
              </div>
              <ChevronDown size={16} className="text-neutral-600" />
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
                  My Profile
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
