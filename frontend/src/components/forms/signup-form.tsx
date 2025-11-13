"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Lock, Phone, Code, Loader } from "lucide-react"
import { PasswordStrength } from "./password-strength"

interface SignupFormProps {
  onSuccess: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
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

    // Validation
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
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

      // Show terms & conditions modal
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* First and Last Name */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-neutral-900 mb-1">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="John"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-900 mb-1">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="Doe"
            required
          />
        </div>
      </div>

      {/* Username */}
      <div>
        <label className="block text-xs font-medium text-neutral-900 mb-1">Username</label>
        <div className="relative">
          <Code className="absolute left-3 top-2.5 text-neutral-400" size={18} />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="johndoe"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-neutral-900 mb-1">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 text-neutral-400" size={18} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-medium text-neutral-900 mb-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-neutral-400" size={18} />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="••••••••"
            required
          />
        </div>
        {formData.password && <PasswordStrength password={formData.password} />}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-xs font-medium text-neutral-900 mb-1">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-neutral-400" size={18} />
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-medium text-neutral-900 mb-1">Phone Number (Optional)</label>
        <div className="relative">
          <Phone className="absolute left-3 top-2.5 text-neutral-400" size={18} />
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="+63 9XX XXX XXXX"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-medium text-neutral-900 mb-1">Address (Optional)</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          placeholder="123 Main St"
        />
      </div>

      {/* Zip Code */}
      <div>
        <label className="block text-xs font-medium text-neutral-900 mb-1">Zip Code (Optional)</label>
        <input
          type="text"
          name="zip_code"
          value={formData.zip_code}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          placeholder="12345"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
      >
        {isLoading && <Loader size={18} className="animate-spin" />}
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  )
}
