"use client"

import { Mail, Phone, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Footer() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <footer className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className={`space-y-4 transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300">
                <span className="text-white font-bold">PJ</span>
              </div>
              <span className="font-bold text-lg">Princess Jaidee</span>
            </div>
            <p className="text-neutral-400">Premium custom apparel and sportswear solutions since 2014.</p>
          </div>

          {/* Quick Links */}
          <div className={`transition-all duration-1000 delay-200 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h3 className="font-semibold mb-4 text-red-400">Quick Links</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#home" className="hover:text-red-400 transition duration-300">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-red-400 transition duration-300">
                  About
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-red-400 transition duration-300">
                  Services
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-red-400 transition duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className={`transition-all duration-1000 delay-300 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h3 className="font-semibold mb-4 text-red-400">Services</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>Custom Jerseys</li>
              <li>Team Uniforms</li>
              <li>Corporate Apparel</li>
              <li>Custom Printing</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={`space-y-4 transition-all duration-1000 delay-400 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h3 className="font-semibold mb-4 text-red-400">Contact Us</h3>
            <div className="space-y-3 text-neutral-400">
              <div className="flex items-center gap-2 hover:translate-x-1 transition-transform duration-300">
                <Phone size={18} className="text-red-500" />
                <span>+63 9XX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2 hover:translate-x-1 transition-transform duration-300">
                <Mail size={18} className="text-red-500" />
                <span>info@jaidee.com</span>
              </div>
              <div className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-300">
                <MapPin size={18} className="text-red-500 mt-1" />
                <span>Calinog, Iloilo, Philippines</span>
              </div>
            </div>
          </div>
        </div>

        {/* Locations section */}
        <div className="py-12 border-t border-neutral-800">
          <h3 className="font-semibold mb-8 text-center text-lg bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Our Locations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sorsogon City Location */}
            <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 transform hover:scale-105">
              <h4 className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 font-semibold">Sorsogon City Branch</h4>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d486.0025654399159!2d124.00560389511456!3d12.97053847250623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a0ef171d4bdfc7%3A0x94c81a6687fbad2b!2sPrincess%20Jaidee%20Enterprises!5e0!3m2!1sen!2sph!4v1763016141937!5m2!1sen!2sph"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Irosin Branch Location */}
            <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 transform hover:scale-105">
              <h4 className="bg-gradient-to-r from-red-700 to-red-600 px-4 py-3 font-semibold">Irosin Branch</h4>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3892.13131688612!2d124.02797197404608!3d12.704851020672555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a0cf7d4b826cc5%3A0x3ec14dbbf67c4947!2sPRINCESS%20JAIDEE%20ENTERPRISES!5e0!3m2!1sen!2sph!4v1763365314640!5m2!1sen!2sph"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-neutral-800 py-8 flex flex-col md:flex-row justify-between items-center text-neutral-400 text-sm">
          <p>&copy; 2025 Princess Jaidee Enterprises. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-red-400 transition duration-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-red-400 transition duration-300">
              Terms of Service
            </a>
            <a href="#" className="hover:text-red-400 transition duration-300">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
