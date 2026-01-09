"use client"

import { useState, useEffect } from "react"

export function Partnerships() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const logos = [
    { name: "SSU", img: "/partnership-logo/ssulogo.png" },
    { name: "CCDI", img: "/partnership-logo/ccdilogo.png" },
    { name: "SSU", img: "/partnership-logo/ssulogo.png" },
    { name: "CCDI", img: "/partnership-logo/ccdilogo.png" },
    { name: "SSU", img: "/partnership-logo/ssulogo.png" },
    { name: "CCDI", img: "/partnership-logo/ccdilogo.png" },
    { name: "SSU", img: "/partnership-logo/ssulogo.png" },
    { name: "CCDI", img: "/partnership-logo/ccdilogo.png" },
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto">
        <h2 
          className={`text-2xl sm:text-3xl font-bold text-center mb-12 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Trusted Partnerships
        </h2>

        <div className="relative overflow-hidden rounded-2xl bg-white border border-red-200 p-8">
          <style>{`
            @keyframes smoothScroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            
            .carousel-track {
              animation: smoothScroll 40s linear infinite;
              display: flex;
              gap: 2rem;
              width: max-content;
            }
            
            .carousel-track:hover {
              animation-play-state: paused;
            }
          `}</style>
          
          <div className="overflow-hidden">
            <div className="carousel-track">
              {[...logos, ...logos, ...logos].map((logo, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-40 h-24 flex items-center justify-center bg-gradient-to-br from-red-50 to-white rounded-xl font-semibold text-neutral-600 border border-red-100 hover:border-red-400 hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden group"
                >
                  <img 
                    src={logo.img || "/placeholder.svg"} 
                    alt={logo.name}
                    className="max-w-full max-h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
