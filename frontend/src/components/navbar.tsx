"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, Sun, Moon, Bell, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }

    const storedUser = localStorage.getItem("admin_user") || localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    localStorage.removeItem("user")
    window.location.href = "/admin"
  }

  const isAdminPage = pathname?.startsWith("/admin")

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDarkMode ? 'bg-neutral-900/80 border-red-900/30' : 'bg-white/80 border-red-200'} shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href={isAdminPage ? "/admin/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg overflow-hidden group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
              <Image 
                src="/princessjd.png" 
                alt="Princess Jaidee Logo" 
                width={40} 
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <span className={`font-bold text-lg hidden sm:inline bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent`}>
              Princess Jaidee
            </span>
          </Link>

          {/* Desktop Menu */}
          {!isAdminPage && (
            <div className="hidden md:flex items-center gap-8">
              <Link href="#home" className={`${isDarkMode ? 'text-neutral-300 hover:text-red-400' : 'text-neutral-600 hover:text-red-600'} transition-colors duration-300 relative group`}>
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="#about" className={`${isDarkMode ? 'text-neutral-300 hover:text-red-400' : 'text-neutral-600 hover:text-red-600'} transition-colors duration-300 relative group`}>
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <button 
                onClick={() => {
                  const element = document.getElementById('partnerships')
                  element?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`${isDarkMode ? 'text-neutral-300 hover:text-red-400' : 'text-neutral-600 hover:text-red-600'} transition-colors duration-300 relative group`}
              >
                Partners
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-400 group-hover:w-full transition-all duration-300"></span>
              </button>
              <Link href="#testimonials" className={`${isDarkMode ? 'text-neutral-300 hover:text-red-400' : 'text-neutral-600 hover:text-red-600'} transition-colors duration-300 relative group`}>
                Testimonials
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            {/* <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'hover:bg-red-50 text-neutral-600'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button> */}

            {/* Notifications */}
            {isAdminPage && (
              <button className={`p-2 rounded-lg transition-all duration-300 relative ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-red-50 text-neutral-600'}`}>
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              </button>
            )}

            {/* User Menu */}
            {isAdminPage && user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-red-50 text-neutral-700'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-sm font-bold">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{user.email}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg animate-slideUp ${isDarkMode ? 'bg-neutral-800 text-neutral-100' : 'bg-white text-neutral-900'}`}>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-3 flex items-center gap-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-red-600/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CTA Button (Landing Page)
            {!isAdminPage && (
              <Link
                href="/"
                className="hidden md:block px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-medium hover:shadow-lg hover:shadow-red-200 hover:scale-105 transition-all duration-300"
              >
                Get Started
              </Link>
            )} */}

            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className={`md:hidden p-2 rounded-lg transition-colors duration-300`} aria-label="Toggle menu">
              {isOpen ? <X size={24} className="text-red-600" /> : <Menu size={24} className={isDarkMode ? 'text-neutral-300' : 'text-neutral-900'} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && !isAdminPage && (
          <div className={`md:hidden pb-4 border-t ${isDarkMode ? 'border-red-900/30' : 'border-red-200'} animate-in slide-in-from-top-2 duration-300`}>
            <Link href="#home" className={`block py-2 transition-all duration-300 ${isDarkMode ? 'text-neutral-300 hover:text-red-400 hover:pl-2' : 'text-neutral-600 hover:text-red-600 hover:pl-2'}`}>
              Home
            </Link>
            <Link href="#about" className={`block py-2 transition-all duration-300 ${isDarkMode ? 'text-neutral-300 hover:text-red-400 hover:pl-2' : 'text-neutral-600 hover:text-red-600 hover:pl-2'}`}>
              About
            </Link>
            <button 
              onClick={() => {
                const element = document.getElementById('partnerships')
                element?.scrollIntoView({ behavior: 'smooth' })
                setIsOpen(false)
              }}
              className={`block py-2 transition-all duration-300 ${isDarkMode ? 'text-neutral-300 hover:text-red-400 hover:pl-2' : 'text-neutral-600 hover:text-red-600 hover:pl-2'}`}
            >
              Partners
            </button>
            <Link href="#testimonials" className={`block py-2 transition-all duration-300 ${isDarkMode ? 'text-neutral-300 hover:text-red-400 hover:pl-2' : 'text-neutral-600 hover:text-red-600 hover:pl-2'}`}>
              Testimonials
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
