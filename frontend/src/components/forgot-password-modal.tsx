"use client"

import { useState } from "react"
import { X, Mail, Lock, ArrowRight, Loader, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLogin: () => void
}

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"email" | "code" | "password">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!isOpen) return null

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError("Please enter your email address")
      setIsLoading(false)
      return
    }

    try {
      const response = await apiClient.client().post("/forgot-password/send-code", { 
        email: trimmedEmail 
      })
      
      if (response.data.success) {
        setSuccess("Code sent to your email. Please check your inbox.")
        setTimeout(() => {
          setStep("code")
          setSuccess("")
        }, 1500)
      } else {
        setError(response.data.message || "Failed to send code. Please try again.")
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "An error occurred. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const trimmedCode = code.trim()

    if (!trimmedCode || trimmedCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      setIsLoading(false)
      return
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      setError("Code must contain only digits")
      setIsLoading(false)
      return
    }

    try {
      const response = await apiClient.client().post("/forgot-password/verify-code", { 
        email: email.trim(), 
        code: trimmedCode
      })
      
      if (response.data.success) {
        setSuccess("Code verified successfully!")
        setTimeout(() => {
          setStep("password")
          setSuccess("")
        }, 1500)
      } else {
        setError(response.data.message || "Invalid code. Please try again.")
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.code?.[0] || "An error occurred. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!password || !confirmPassword) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await apiClient.client().post("/forgot-password/reset", { 
        email: email.trim(), 
        code: code.trim(),
        password,
        password_confirmation: confirmPassword
      })
      
      if (response.data.success) {
        setSuccess("Password reset successfully! Redirecting to login...")
        setTimeout(() => {
          handleClose()
          onBackToLogin()
        }, 2000)
      } else {
        setError(response.data.message || "Failed to reset password. Please try again.")
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.password?.[0] || "An error occurred. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep("email")
    setEmail("")
    setCode("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
    onClose()
  }

  const handleBackStep = () => {
    if (step === "code") setStep("email")
    if (step === "password") setStep("code")
    setError("")
    setSuccess("")
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-red-100 animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">Reset Password</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-8 rounded-full transition-colors ${step === "email" ? "bg-red-600" : "bg-neutral-300"}`}></div>
            <div className={`h-2 w-8 rounded-full transition-colors ${step === "code" ? "bg-red-600" : "bg-neutral-300"}`}></div>
            <div className={`h-2 w-8 rounded-full transition-colors ${step === "password" ? "bg-red-600" : "bg-neutral-300"}`}></div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Code Verification */}
          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-sm text-neutral-600">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    setError("")
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-center text-2xl tracking-widest font-semibold focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError("")
                    }}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-10 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-neutral-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError("")
                    }}
                    placeholder="Confirm password"
                    className="w-full pl-10 pr-10 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
