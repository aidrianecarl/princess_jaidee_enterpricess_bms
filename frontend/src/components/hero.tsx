"use client"
import { AuthModal } from "./auth-modal"
import { useState, useEffect } from "react"
import { ArrowRight } from 'lucide-react'

export function Hero() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  return (
    <>
      <section id="home" className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-white to-red-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 transition-all duration-1000 transform ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Premium Custom <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent animate-pulse">Apparel</span> Solutions
              </h1>
              <p 
                className={`text-lg text-neutral-600 leading-relaxed transition-all duration-1000 delay-200 transform ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Crafting personalized sportswear and custom apparel for teams, organizations, and individuals. Over a
                decade of excellence in quality and innovation.
              </p>
            </div>

            <div 
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-300 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <button
                onClick={() => handleAuthClick("login")}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-semibold hover:shadow-xl hover:shadow-red-300 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Sign In
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={() => handleAuthClick("signup")}
                className="px-8 py-3 border-2 border-red-600 text-red-600 rounded-full font-semibold hover:bg-red-50 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Create Account
              </button>
            </div>

            <div 
              className={`grid grid-cols-3 gap-6 pt-8 transition-all duration-1000 delay-500 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 hover:shadow-md hover:scale-105 transition-all duration-300">
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">500+</p>
                <p className="text-sm text-neutral-600">Regular Customers</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-red-100 to-red-200 hover:shadow-md hover:scale-105 transition-all duration-300">
                <p className="text-3xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">11+</p>
                <p className="text-sm text-neutral-600">Years in Business</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-red-50 to-orange-100 hover:shadow-md hover:scale-105 transition-all duration-300">
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">100%</p>
                <p className="text-sm text-neutral-600">Quality Guaranteed</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div 
              className={`relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl transition-all duration-1000 delay-700 transform group ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <img 
                src="/princessjd-hero.png" 
                alt="Custom Apparel Gallery"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
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
