"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Eye, EyeOff, Lock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

interface PasswordStrength {
  score: number
  label: string
  color: string
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

export function PasswordChangeModal({ isOpen, onClose, user }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "Very Weak",
    color: "from-red-500 to-red-600",
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  })
  const { toast } = useToast()

  const checkPasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    }

    const metRequirements = Object.values(requirements).filter(Boolean).length
    let score = 0
    let label = "Very Weak"
    let color = "from-red-500 to-red-600"

    if (metRequirements === 0) {
      score = 0
      label = "Very Weak"
      color = "from-red-500 to-red-600"
    } else if (metRequirements === 1) {
      score = 20
      label = "Weak"
      color = "from-orange-500 to-orange-600"
    } else if (metRequirements === 2) {
      score = 40
      label = "Fair"
      color = "from-yellow-500 to-yellow-600"
    } else if (metRequirements === 3) {
      score = 60
      label = "Good"
      color = "from-lime-500 to-lime-600"
    } else if (metRequirements === 4) {
      score = 80
      label = "Strong"
      color = "from-green-500 to-green-600"
    } else {
      score = 100
      label = "Very Strong"
      color = "from-green-500 to-green-600"
    }

    setPasswordStrength({ score, label, color, requirements })
  }

  useEffect(() => {
    if (newPassword) {
      checkPasswordStrength(newPassword)
    }
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        onClose()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to change password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to change password:", error)
      toast({
        title: "Error",
        description: "An error occurred while changing password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header - Sticky */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-6 flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lock size={24} />
            Change Password
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-red-700 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Meter */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">Password Strength</span>
                <span
                  className={`text-xs font-bold ${passwordStrength.score >= 80 ? "text-green-600" : passwordStrength.score >= 60 ? "text-lime-600" : passwordStrength.score >= 40 ? "text-yellow-600" : passwordStrength.score >= 20 ? "text-orange-600" : "text-red-600"}`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${passwordStrength.color} transition-all duration-300 ease-out`}
                  style={{ width: `${passwordStrength.score}%` }}
                />
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-gray-600 mb-2">Requirements:</p>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition ${passwordStrength.requirements.length ? "bg-green-500" : "bg-gray-200"}`}
                  >
                    {passwordStrength.requirements.length && <CheckCircle size={16} className="text-white" />}
                  </div>
                  <span
                    className={`text-sm ${passwordStrength.requirements.length ? "text-green-600 font-medium" : "text-gray-600"}`}
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition ${passwordStrength.requirements.uppercase ? "bg-green-500" : "bg-gray-200"}`}
                  >
                    {passwordStrength.requirements.uppercase && <CheckCircle size={16} className="text-white" />}
                  </div>
                  <span
                    className={`text-sm ${passwordStrength.requirements.uppercase ? "text-green-600 font-medium" : "text-gray-600"}`}
                  >
                    Uppercase letter (A-Z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition ${passwordStrength.requirements.lowercase ? "bg-green-500" : "bg-gray-200"}`}
                  >
                    {passwordStrength.requirements.lowercase && <CheckCircle size={16} className="text-white" />}
                  </div>
                  <span
                    className={`text-sm ${passwordStrength.requirements.lowercase ? "text-green-600 font-medium" : "text-gray-600"}`}
                  >
                    Lowercase letter (a-z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition ${passwordStrength.requirements.number ? "bg-green-500" : "bg-gray-200"}`}
                  >
                    {passwordStrength.requirements.number && <CheckCircle size={16} className="text-white" />}
                  </div>
                  <span
                    className={`text-sm ${passwordStrength.requirements.number ? "text-green-600 font-medium" : "text-gray-600"}`}
                  >
                    Number (0-9)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition ${passwordStrength.requirements.special ? "bg-green-500" : "bg-gray-200"}`}
                  >
                    {passwordStrength.requirements.special && <CheckCircle size={16} className="text-white" />}
                  </div>
                  <span
                    className={`text-sm ${passwordStrength.requirements.special ? "text-green-600 font-medium" : "text-gray-600"}`}
                  >
                    Special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-2 flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${newPassword === confirmPassword ? "bg-green-500" : "bg-red-500"}`}
                />
                <span
                  className={`text-sm font-medium ${newPassword === confirmPassword ? "text-green-600" : "text-red-600"}`}
                >
                  {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
                </span>
              </div>
            )}
          </div>
        </form>

        {/* Footer - Sticky */}
        <div className="border-t border-gray-200 p-6 flex gap-3 flex-shrink-0 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 8}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-600 transition disabled:opacity-50"
          >
            {isLoading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  )
}
