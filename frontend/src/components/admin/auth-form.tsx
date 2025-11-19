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

      router.push("/admin/dashboard")
    } catch (err) {
      const message = apiClient.getErrorMessage(err)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Background gradient elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 space-y-8 border border-white/20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="Princess Jaidee Enterprises Logo"
                fill
                className="object-cover"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-neutral-600 text-lg">Princess Jaidee Enterprises</p>
            <p className="text-neutral-500 text-sm">Secure Management Dashboard</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl animate-slideDown">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-red-500 group-focus-within:text-red-600 transition-colors" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-neutral-900 placeholder-neutral-400 bg-neutral-50 hover:bg-neutral-100"
                placeholder="admin@jaidee.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-red-500 group-focus-within:text-red-600 transition-colors" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-neutral-900 placeholder-neutral-400 bg-neutral-50 hover:bg-neutral-100"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-neutral-500 hover:text-red-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>

          {/* Help text */}
          <p className="text-center text-xs text-neutral-500 pt-4">
            For access support, contact your system administrator
          </p>
        </form>
      </div>
    </div>
  )
}
