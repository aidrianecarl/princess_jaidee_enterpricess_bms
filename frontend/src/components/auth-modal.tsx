"use client"
import { X } from "lucide-react"
import { LoginForm } from "./forms/login-form"
import { SignupForm } from "./forms/signup-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "login" | "signup"
  onSwitchMode: (mode: "login" | "signup") => void
}

export function AuthModal({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">{mode === "login" ? "Sign In" : "Create Account"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === "login" ? <LoginForm onSuccess={onClose} /> : <SignupForm onSuccess={onClose} />}

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => onSwitchMode(mode === "login" ? "signup" : "login")}
                className="text-primary font-semibold hover:underline"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
