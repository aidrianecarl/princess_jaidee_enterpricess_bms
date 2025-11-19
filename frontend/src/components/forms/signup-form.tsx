"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Lock, Phone, Code, Loader, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { PasswordStrength } from "./password-strength"

interface SignupFormProps {
  onSuccess: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone_number: "",
    address: "",
    zip_code: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    return minLength && hasUppercase && hasLowercase && hasNumber
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.first_name || !formData.last_name || !formData.username) {
      setError("First name, last name, and username are required")
      return
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match")
      return
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters with uppercase, lowercase, and numbers")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Signup failed")
      }

      const data = await response.json()
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      localStorage.setItem("show_terms", "true")
      onSuccess()
      window.location.href = "/dashboard"
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-100% pr-2">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium animate-slideDown sticky top-0 z-50">
          {error}
        </div>
      )}

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
        <label className="block text-xs font-bold text-neutral-900 mb-1">Username</label>
        <div className="relative">
          <Code className="absolute left-3 top-2.5 text-red-500" size={18} />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2.5 border-2 border-red-100 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition text-sm hover:border-red-200"
            placeholder="johndoe"
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
        className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/30 transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm group hover:scale-105"
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
