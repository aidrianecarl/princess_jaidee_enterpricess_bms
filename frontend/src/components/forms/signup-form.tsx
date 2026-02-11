"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Lock, Loader, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { PasswordStrength } from "./password-strength"
import { useToastNotification } from "@/hooks/use-toast-notification"
import { AlertCircle } from 'lucide-react' // Import AlertCircle

interface SignupFormProps {
  onSuccess: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { success, error: showError, info: showInfo } = useToastNotification()
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone_number: "",
    address: "",
    city: "",
    province: "",
    zip_code: "",
  })
  const [error, setError] = useState("") // Declare error state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!formData.first_name || !formData.last_name || !formData.email) {
      showError("First name, last name, and email are required")
      return
    }

    if (!formData.password || formData.password.length < 8) {
      showError("Password must be at least 8 characters")
      return
    }

    if (formData.password !== formData.password_confirmation) {
      showError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle different error response formats
        let errorMessage = "Signup failed. Please try again."
        
        if (data.message) {
          errorMessage = data.message
        } else if (data.errors) {
          // If there are validation errors, show the first one
          const firstError = Object.values(data.errors)[0]
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
        } else if (data.error) {
          errorMessage = data.error
        }
        
        throw new Error(errorMessage)
      }
      
      if (!data.token || !data.user) {
        showError("Signup successful but missing required data. Please try logging in.")
        setIsLoading(false)
        return
      }
      
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("show_terms", "true")
      
      // Persist success toast for after page redirect
      const toastId = Date.now().toString()
      const toastData = [{ id: toastId, message: "Account created successfully! Welcome!", type: 'success' }]
      localStorage.setItem("pendingToasts", JSON.stringify(toastData))
      
      // Call onSuccess to close modal ONLY on successful signup
      onSuccess()
      // Redirect after a small delay to let modal close
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 300)
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred during registration"
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
      className="space-y-4 max-h-100% pr-2"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-neutral-900 mb-1">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border-2 border-red-100 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition text-sm hover:border-red-200"
            placeholder="John"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-900 mb-1">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border-2 border-red-100 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition text-sm hover:border-red-200"
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-900 mb-1">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 text-red-500" size={18} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2.5 border-2 border-red-100 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition text-sm hover:border-red-200"
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-900 mb-1">Contact Number</label>
        <input
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className="w-full px-3 py-2.5 border-2 border-red-100 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition text-sm hover:border-red-200"
          placeholder="+63 9XX XXX XXXX"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-900 mb-1">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2.5 border-2 border-red-100 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition text-sm hover:border-red-200"
          placeholder="Street address"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-neutral-900 mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border-2 border-red-100 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition text-sm hover:border-red-200"
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-900 mb-1">Province</label>
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border-2 border-red-100 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition text-sm hover:border-red-200"
            placeholder="Province"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-900 mb-1">Zip Code</label>
        <input
          type="text"
          name="zip_code"
          value={formData.zip_code}
          onChange={handleChange}
          className="w-full px-3 py-2.5 border-2 border-red-100 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition text-sm hover:border-red-200"
          placeholder="00000"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-900 mb-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-red-500" size={18} />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-10 py-2.5 border-2 border-red-100 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition text-sm hover:border-red-200"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-neutral-500 hover:text-red-600 transition"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {formData.password && <PasswordStrength password={formData.password} />}
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-900 mb-1">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-red-500" size={18} />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className="w-full pl-10 pr-10 py-2.5 border-2 border-red-100 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition text-sm hover:border-red-200"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-2.5 text-neutral-500 hover:text-red-600 transition"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/30 transition duration-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm group hover:scale-105 active:scale-95"
      >
        {isLoading ? (
          <>
            <Loader size={18} className="animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
          </>
        )}
      </button>
    </form>
  )
}
