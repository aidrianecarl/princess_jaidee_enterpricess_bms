"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">PJ</span>
            </div>
            <span className="font-bold text-lg text-neutral-900 hidden sm:inline">Princess Jaidee</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#home" className="text-neutral-600 hover:text-primary transition">
              Home
            </Link>
            <Link href="#about" className="text-neutral-600 hover:text-primary transition">
              About
            </Link>
            <Link href="#services" className="text-neutral-600 hover:text-primary transition">
              Services
            </Link>
            <Link href="#testimonials" className="text-neutral-600 hover:text-primary transition">
              Testimonials
            </Link>
            <a href="#contact" className="text-neutral-600 hover:text-primary transition">
              Contact
            </a>
          </div>

          {/* Contact Button */}
          <div className="hidden md:flex">
            <a
              href="#contact"
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition"
            >
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2" aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-neutral-200">
            <Link href="#home" className="block py-2 text-neutral-600 hover:text-primary">
              Home
            </Link>
            <Link href="#about" className="block py-2 text-neutral-600 hover:text-primary">
              About
            </Link>
            <Link href="#services" className="block py-2 text-neutral-600 hover:text-primary">
              Services
            </Link>
            <Link href="#testimonials" className="block py-2 text-neutral-600 hover:text-primary">
              Testimonials
            </Link>
            <a href="#contact" className="block py-2 text-neutral-600 hover:text-primary">
              Contact
            </a>
            <a
              href="#contact"
              className="block mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium text-center"
            >
              Contact
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
