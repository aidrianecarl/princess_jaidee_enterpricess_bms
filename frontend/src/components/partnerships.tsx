"use client"

import { useState, useEffect } from "react"

export function Partnerships() {
  const [position, setPosition] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => (prev + 1) % 100)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  const logos = ["Nike", "Adidas", "Puma", "Under Armour", "Spalding", "Mikasa", "Wilson"]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 text-neutral-900">Trusted Partnerships</h2>

        <div className="relative h-24 bg-gradient-to-r from-white via-transparent to-white">
          <div
            className="flex gap-8 whitespace-nowrap"
            style={{
              transform: `translateX(-${position}%)`,
              transition: "transform 0.03s linear",
            }}
          >
            {[...logos, ...logos].map((logo, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-32 h-24 flex items-center justify-center bg-neutral-100 rounded-lg font-semibold text-neutral-600"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
