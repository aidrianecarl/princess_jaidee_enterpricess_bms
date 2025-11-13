"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Loader, AlertCircle } from "lucide-react"

export function AdminAuthForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      localStorage.setItem("admin_token", data.token)
      localStorage.setItem("admin_user", JSON.stringify(data.user))

      router.push("/admin/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
          <span className="text-3xl">👔</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900">Admin Portal</h1>
        <p className="text-neutral-600">Princess Jaidee Enterprises</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-neutral-400" size={20} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@jaidee.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-neutral-400" size={20} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader size={18} className="animate-spin" />}
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Footer */}
      <div className="pt-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-500 text-center">
          Admin credentials required to access this portal.
          <br />
          Contact your administrator if you need access.
        </p>
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-neutral-50 rounded-lg space-y-2">
        <p className="font-semibold text-xs text-neutral-900">Security Tips:</p>
        <ul className="text-xs text-neutral-600 space-y-1">
          <li>• Never share your login credentials</li>
          <li>• Use a strong, unique password</li>
          <li>• Clear browser cache after logging out</li>
          <li>• Log out from shared devices</li>
        </ul>
      </div>
    </div>
  )
}
