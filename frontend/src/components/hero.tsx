"use client"
import { AuthModal } from "./auth-modal"
import { useState } from "react"

export function Hero() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  return (
    <>
      <section id="home" className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900">
                Premium Custom <span className="text-primary">Apparel</span> Solutions
              </h1>
              <p className="text-lg text-neutral-600 leading-relaxed">
                Crafting personalized sportswear and custom apparel for teams, organizations, and individuals. Over a
                decade of excellence in quality and innovation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleAuthClick("login")}
                className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
              >
                Sign In
              </button>
              <button
                onClick={() => handleAuthClick("signup")}
                className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
              >
                Create Account
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-neutral-600">Regular Customers</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">11+</p>
                <p className="text-sm text-neutral-600">Years in Business</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-neutral-600">Quality Guaranteed</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden md:block">
            <div className="relative w-full h-96 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <div className="space-y-4 text-center">
                      <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-4xl">👕</span>
                      </div>
                      <p className="text-neutral-600 font-medium">Custom Apparel Gallery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        mode={authMode}
        onSwitchMode={handleAuthClick}
      />
    </>
  )
}
