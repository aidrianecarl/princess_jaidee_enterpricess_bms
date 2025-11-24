"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu, LogOut, User, Settings, Bell, ChevronDown, Moon, Sun } from "lucide-react"
import Image from "next/image"
import { useTheme } from "./theme-context"

interface HeaderProps {
  user: any
  onMenuClick: () => void
}

export function AdminHeader({ user, onMenuClick }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    router.push("/admin")
  }

  useEffect(() => {
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 h-15 md:h-15 flex items-center px-4 md:px-6 sticky top-0 z-40 shadow-sm w-full">
      <div className="flex items-center justify-between w-full gap-4">
        {/* Left - Menu Button + Logo */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition lg:hidden text-neutral-600 dark:text-neutral-400 hover:text-red-600 flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo - Desktop only */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow flex-shrink-0">
              <Image src="/princessjd.png" alt="Princess Jaidee Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-base md:text-lg bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent truncate">
              Princess Jaidee
            </span>
          </div>
        </div>

        {/* Right - Notifications + Theme Toggle + User Dropdown */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto flex-shrink-0">
          {/* Notifications */}
          <button
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg relative transition text-neutral-600 dark:text-neutral-400 hover:text-red-600 group"
            aria-label="Notifications"
          >
            <Bell size={18} className="md:w-5 md:h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-full animate-pulse group-hover:scale-125 transition-transform" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition text-neutral-600 dark:text-neutral-400 hover:text-red-600"
            title="Toggle dark/light mode"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon size={18} className="md:w-5 md:h-5" />
            ) : (
              <Sun size={18} className="md:w-5 md:h-5" />
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white text-sm font-bold">{user?.first_name?.charAt(0) || "A"}</span>
              </div>
              <div className="hidden md:block text-right min-w-0">
                <p className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{user?.email}</p>
              </div>
              <ChevronDown
                size={16}
                className={`text-neutral-600 dark:text-neutral-400 transition-transform duration-300 hidden md:block flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl animate-slideDown z-50">
                <div className="p-3 md:p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <p className="font-semibold text-neutral-900 dark:text-white truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 truncate">{user?.email}</p>
                </div>

                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-red-600 transition text-sm"
                >
                  <User size={16} className="flex-shrink-0" />
                  <span className="font-medium">My Profile</span>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-red-600 transition text-sm"
                >
                  <Settings size={16} className="flex-shrink-0" />
                  <span className="font-medium">Settings</span>
                </a>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition border-t border-neutral-200 dark:border-neutral-800 font-medium rounded-b-xl text-sm"
                >
                  <LogOut size={16} className="flex-shrink-0" />
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
