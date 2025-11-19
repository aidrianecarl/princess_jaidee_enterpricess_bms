"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Menu, LogOut, User, Settings, Bell, ChevronDown } from 'lucide-react'
import Image from 'next/image'

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
    <header className="bg-gradient-to-r from-white via-white to-red-50/30 border-b border-red-100/50 h-20 flex items-center px-6 sticky top-0 z-40 shadow-sm w-full">
      <div className="flex items-center justify-between w-full">
        {/* Left - Menu Button + Logo */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="p-2 hover:bg-red-50/50 rounded-lg transition lg:hidden text-neutral-600 hover:text-red-600">
            <Menu size={24} />
          </button>

          {/* Logo - Desktop only */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <Image
                src="/logo.png"
                alt="Princess Jaidee Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Princess Jaidee
            </span>
          </div>
        </div>

        {/* Right - Notifications + User Dropdown */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Notifications */}
          <button className="p-2 hover:bg-red-50/50 rounded-lg relative transition text-neutral-600 hover:text-red-600 group">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-full animate-pulse group-hover:scale-125 transition-transform" />
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50/50 transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">{user?.first_name?.charAt(0) || "A"}</span>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-neutral-900">{user?.first_name}</p>
                <p className="text-xs text-red-600 capitalize font-medium">{user?.user_type}</p>
              </div>
              <ChevronDown size={16} className={`text-neutral-600 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-red-100/50 shadow-xl animate-slideDown">
                <div className="p-4 border-b border-red-100/50">
                  <p className="font-semibold text-neutral-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-sm text-neutral-600">{user?.email}</p>
                </div>

                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-3 text-neutral-600 hover:bg-red-50/50 hover:text-red-600 transition"
                >
                  <User size={18} />
                  <span className="font-medium">My Profile</span>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-3 text-neutral-600 hover:bg-red-50/50 hover:text-red-600 transition"
                >
                  <Settings size={18} />
                  <span className="font-medium">Settings</span>
                </a>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition border-t border-red-100/50 font-medium rounded-b-xl"
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
