"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { apiClient } from "@/lib/api-client"
import Image from 'next/image'

export function AdminAuthForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await apiClient.admin().post('/admin/login', formData)

      const data = response.data

      localStorage.setItem("admin_token", data.token)
      localStorage.setItem("admin_user", JSON.stringify(data.user))

      // Add delay before navigation to prevent page refresh
      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 300)
    } catch (err) {
      const message = apiClient.getErrorMessage(err)
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm md:max-w-md mx-auto px-4 sm:px-6 animate-fadeInUp">
      {/* Main card */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 space-y-6 md:space-y-8 border border-white/20">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Image
                src="/princessjd.png"
                alt="Princess Jaidee Enterprises Logo"
                fill
                className="object-cover"
              />
            </div>
          </div>
          
          <div className="space-y-1 md:space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-neutral-600 text-base md:text-lg">Princess Jaidee Enterprises</p>
            <p className="text-neutral-500 text-xs md:text-sm">Secure Management Dashboard</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg md:rounded-xl animate-slideDown">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-700 text-xs md:text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5 md:space-y-2">
            <label className="block text-xs md:text-sm font-semibold text-neutral-900 mb-1 md:mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 md:left-4 top-3 md:top-3.5 text-red-500 group-focus-within:text-red-600 transition-colors" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 border-2 border-neutral-200 rounded-lg md:rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-sm md:text-base text-neutral-900 placeholder-neutral-400 bg-neutral-50 hover:bg-neutral-100"
                placeholder="admin@jaidee.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 md:space-y-2">
            <label className="block text-xs md:text-sm font-semibold text-neutral-900 mb-1 md:mb-2">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 md:left-4 top-3 md:top-3.5 text-red-500 group-focus-within:text-red-600 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3 border-2 border-neutral-200 rounded-lg md:rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-sm md:text-base text-neutral-900 placeholder-neutral-400 bg-neutral-50 hover:bg-neutral-100"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 md:right-4 top-3 md:top-3.5 text-neutral-500 hover:text-red-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold text-sm md:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>

          {/* Help text */}
          <p className="text-center text-xs text-neutral-500 pt-2 md:pt-4">
            For access support, contact your system administrator
          </p>
        </form>
      </div>
    </div>
  )
}
