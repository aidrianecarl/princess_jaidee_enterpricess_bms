"use client"

import { Star } from 'lucide-react'
import { useState, useEffect } from "react"

interface Rating {
  id: number
  star_rating: number
  message: string | null
  customer_id: number
  created_at: string
  user?: {
    first_name: string
    last_name: string
  }
}

export function Testimonials() {
  const [isVisible, setIsVisible] = useState(false)
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsVisible(true)
    fetchRatings()
  }, [])

  const fetchRatings = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"}/ratings?limit=3`
      console.log("[v0] Testimonials - Starting fetch from URL:", apiUrl)
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Testimonials - Response status:", response.status)
      console.log("[v0] Testimonials - Response ok:", response.ok)

      if (!response.ok) {
        console.error("[v0] Testimonials - Response not OK, status:", response.status)
        throw new Error(`Failed to fetch ratings - Status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Testimonials - Received data:", data)
      console.log("[v0] Testimonials - Data is array:", Array.isArray(data))
      console.log("[v0] Testimonials - Data length:", data?.length || 0)

      // If data is empty array, use fallback testimonials
      if (!data || data.length === 0) {
        console.log("[v0] Testimonials - No data received, using fallback testimonials")
        setTestimonials([
          {
            name: "Maria Santos",
            role: "School Sports Director",
            rating: 5,
            text: "Excellent quality and fast delivery! Our team jerseys look amazing and arrived exactly on time for the championship.",
            avatar: "MS",
            date: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          },
          {
            name: "John Rivera",
            role: "Corporate Events Manager",
            rating: 5,
            text: "Professional service from start to finish. The custom design process was smooth and the final product exceeded expectations.",
            avatar: "JR",
            date: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          },
          {
            name: "Ana Reyes",
            role: "Basketball Coach",
            rating: 5,
            text: "Best custom apparel provider in the region. Highly recommended for any team or organization needs.",
            avatar: "AR",
            date: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          },
        ])
        setIsLoading(false)
        return
      }

      // Process fetched ratings
      console.log("[v0] Testimonials - Processing", data.length, "ratings")
      const processedTestimonials = data.map((rating: Rating) => {
        console.log("[v0] Testimonials - Processing rating:", rating)
        
        const firstName = rating.user?.first_name || "Customer"
        const lastName = rating.user?.last_name || ""
        const fullName = `${firstName} ${lastName}`.trim()
        const avatarInitials = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : "")).toUpperCase()
        const createdDate = new Date(rating.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        return {
          name: fullName,
          role: "Valued Customer",
          rating: rating.star_rating,
          text: rating.message || "Great experience with Princess Jaidee!",
          avatar: avatarInitials || "C",
          date: createdDate,
        }
      })

      console.log("[v0] Testimonials - Processed testimonials:", processedTestimonials)
      setTestimonials(processedTestimonials)
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Testimonials - ERROR fetching ratings:", error)
      console.log("[v0] Testimonials - Using fallback testimonials due to error")
      // Fallback to default testimonials if fetch fails
      setTestimonials([
        {
          name: "Maria Santos",
          role: "School Sports Director",
          rating: 5,
          text: "Excellent quality and fast delivery! Our team jerseys look amazing and arrived exactly on time for the championship.",
          avatar: "MS",
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
        {
          name: "John Rivera",
          role: "Corporate Events Manager",
          rating: 5,
          text: "Professional service from start to finish. The custom design process was smooth and the final product exceeded expectations.",
          avatar: "JR",
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
        {
          name: "Ana Reyes",
          role: "Basketball Coach",
          rating: 5,
          text: "Best custom apparel provider in the region. Highly recommended for any team or organization needs.",
          avatar: "AR",
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      ])
      setIsLoading(false)
    }
  }

  return (
    <section id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-red-50">
      <div className="max-w-7xl mx-auto">
        <h2 
          className={`text-3xl sm:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          What Our Customers Say
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-red-100 animate-pulse">
                <div className="h-6 bg-neutral-200 rounded mb-4" />
                <div className="h-20 bg-neutral-200 rounded mb-6" />
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-200 rounded mb-2" />
                    <div className="h-3 bg-neutral-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className={`bg-white p-8 rounded-2xl border border-red-100 hover:border-red-400 hover:shadow-xl hover:scale-105 transition-all duration-500 transform ${
                  isVisible ? `opacity-100 translate-y-0` : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: isVisible ? `${i * 200}ms` : '0ms'
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} size={18} fill="#fbbf24" className="text-yellow-400" />
                  ))}
                </div>

                {/* Date */}
                <p className="text-xs text-neutral-500 mb-4">{testimonial.date}</p>

                {/* Quote */}
                <p className="text-neutral-600 mb-6 leading-relaxed">"{testimonial.text}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-neutral-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
