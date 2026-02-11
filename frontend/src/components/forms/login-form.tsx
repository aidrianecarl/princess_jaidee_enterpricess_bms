"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Lock, Loader, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { apiClient } from "@/lib/api-client"
import { useToastNotification } from "@/hooks/use-toast-notification"
import { AlertCircle } from 'lucide-react'

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { success, error: showError, info: showInfo } = useToastNotification()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [adminWarning, setAdminWarning] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (e.defaultPrevented) return
    
    setIsLoading(true)

    try {
      const response = await apiClient.client().post('/login', formData)
      
      if (!response || !response.data) {
        showError("Invalid response from server. Please try again.")
        setIsLoading(false)
        return
      }
      
      const data = response.data

      // Check if user is admin or staff
      if (data.user && (data.user.role === 'admin' || data.user.role === 'staff')) {
        showInfo("Please visit www.princessjaideeenterprises.com to login to the admin panel")
        setIsLoading(false)
        return
      }

      // Only store and redirect on successful customer login
      if (data.token && data.user) {
        localStorage.setItem("auth_token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Persist success toast for after page redirect
        const toastId = Date.now().toString()
        const toastData = [{ id: toastId, message: "Logged in successfully!", type: 'success' }]
        localStorage.setItem("pendingToasts", JSON.stringify(toastData))
        
        // Call onSuccess to close modal ONLY on successful login
        onSuccess()
        
        // Redirect after a small delay to let modal close
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 300)
      } else {
        showError("Login successful but missing required data. Please try again.")
        setIsLoading(false)
      }
    } catch (err: any) {
      let message = "Login failed. Please check your credentials and try again."
      
      if (err.response?.data?.error) {
        message = err.response.data.error
      } else if (err.response?.data?.message) {
        message = err.response.data.message
      } else if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]
        message = Array.isArray(firstError) ? firstError[0] : firstError
      }
      
      showError(message)
      setIsLoading(false)
    }
  }

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleSubmit(e)
      }} 
      className="space-y-4 animate-fadeInUp"
    >

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
        className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-red-500/30 transition duration-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 group hover:scale-105 active:scale-95"
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
