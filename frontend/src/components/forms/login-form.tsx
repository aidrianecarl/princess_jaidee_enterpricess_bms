"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Lock, Loader, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { apiClient } from "@/lib/api-client"

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
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
      const response = await apiClient.client().post('/login', formData)
      const data = response.data

      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      onSuccess()
      window.location.href = "/dashboard"
    } catch (err) {
      const message = apiClient.getErrorMessage(err)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fadeInUp">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-slideDown">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-bold text-neutral-900">Email Address</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-3.5 text-red-500 group-hover:text-red-600 transition" size={20} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 border-2 border-red-100 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition duration-300 hover:border-red-200"
            placeholder="your@email.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-neutral-900">Password</label>
        <div className="relative group">
          <Lock className="absolute left-4 top-3.5 text-red-500 group-hover:text-red-600 transition" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-12 pr-12 py-3 border-2 border-red-100 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition duration-300 hover:border-red-200"
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-neutral-500 hover:text-red-600 transition"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-red-500/30 transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group hover:scale-105"
      >
        {isLoading ? (
          <>
            <Loader size={20} className="animate-spin" />
            Signing In...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
          </>
        )}
      </button>

      <a href="#" className="text-sm text-red-600 hover:text-red-700 font-medium text-center block hover:underline">
        Forgot your password?
      </a>
    </form>
  )
}
