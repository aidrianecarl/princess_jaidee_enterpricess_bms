"use client"
import { X } from 'lucide-react'
import { useState } from 'react'
import { LoginForm } from "./forms/login-form"
import { SignupForm } from "./forms/signup-form"
import { ForgotPasswordModal } from "./forgot-password-modal"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "login" | "signup"
  onSwitchMode: (mode: "login" | "signup") => void
}

export function AuthModal({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-red-100 animate-slideUp">
        <div className="relative h-24 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 flex flex-col justify-between p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-white">{mode === "login" ? "Welcome Back" : "Join Us"}</h2>
              <p className="text-red-100 text-sm">{mode === "login" ? "Sign in to your account" : "Create your account"}</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-lg transition duration-200 hover:scale-110"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            {mode === "login" ? (
              <LoginForm 
                onSuccess={onClose} 
                onForgotPassword={() => {
                  setShowForgotPassword(true)
                }}
              />
            ) : (
              <SignupForm onSuccess={onClose} />
            )}
          </div>

          <div className="relative flex items-center gap-3 py-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-200 to-transparent" />
            <span className="text-xs text-neutral-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-200 to-transparent" />
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 text-center border border-red-100 animate-fadeIn">
            <p className="text-neutral-700 text-sm mb-2">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => onSwitchMode(mode === "login" ? "signup" : "login")}
              className="text-red-600 font-bold hover:text-red-700 transition hover:underline text-sm"
            >
              {mode === "login" ? "Sign Up Now" : "Sign In Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => {
          setShowForgotPassword(false)
          onSwitchMode("login")
        }}
      />
    </div>
  )
}
