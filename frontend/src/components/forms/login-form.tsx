"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Lock, Loader, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

interface LoginFormProps {
  onSuccess: () => void
  onForgotPassword?: () => void
}

export function LoginForm({ onSuccess, onForgotPassword }: LoginFormProps) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [adminWarning, setAdminWarning] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
    setAdminWarning("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)
    setError("")
    setAdminWarning("")

    try {
      const response = await apiClient.client().post("/login", formData)

      if (!response || !response.data) {
        setError("Invalid response from server. Please try again.")
        setIsLoading(false)
        return
      }

      const data = response.data

      // Admin/staff check
      if (data.user && (data.user.role === "admin" || data.user.role === "staff")) {
        setAdminWarning(
          "Please visit www.princessjaideeenterprises.com to login to the admin panel"
        )
        setIsLoading(false)
        return
      }

      // Successful login
      if (data.token && data.user) {
        localStorage.setItem("auth_token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Show success modal
        setShowSuccessModal(true)

        // Close auth modal after a delay
        setTimeout(() => {
          onSuccess()
        }, 500)

        // Redirect to dashboard using Next.js router
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError("Login successful but missing required data. Please try again.")
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

      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fadeInUp">
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-sm font-medium animate-slideDown flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 mb-1">Invalid Credentials</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {adminWarning && (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-xl text-sm font-medium animate-slideDown flex items-start gap-3">
          <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-700 mb-1">Admin Portal</p>
            <p className="text-yellow-600">{adminWarning}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-bold text-neutral-900">
          Email Address
        </label>
        <div className="relative group">
          <Mail className="absolute left-4 top-3.5 text-red-500" size={20} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 border-2 border-red-100 rounded-xl focus:outline-none focus:border-red-500"
            placeholder="your@email.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-neutral-900">
          Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-3.5 text-red-500" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-12 pr-12 py-3 border-2 border-red-100 rounded-xl focus:outline-none focus:border-red-500"
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader size={20} className="animate-spin" />
            Signing In...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight size={20} />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onForgotPassword}
        className="text-sm text-red-600 font-medium text-center block hover:underline"
      >
        Forgot your password?
      </button>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-slideUp p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Logged In Successfully!</h3>
            <p className="text-neutral-600 mb-6">Welcome back! Redirecting you to your dashboard...</p>
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce mx-2" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
