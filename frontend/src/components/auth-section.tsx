"use client"
import { CheckCircle, Zap, Shield } from 'lucide-react'

export function AuthSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-red-50/30 to-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fadeInUp">
          <div className="inline-block mb-4 px-4 py-2 bg-red-100 rounded-full">
            <span className="text-sm font-bold text-red-600">ABOUT US</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-4">
            Princess Jaidee Enterprises
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Established in 2014, we've been crafting premium custom apparel and sportswear for teams, organizations, and individuals across the region with exceptional quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Premium Quality",
              description: "Using finest materials and expert craftsmanship in every piece",
              icon: CheckCircle,
              color: "from-red-500 to-red-600",
              delay: "animation-delay-0",
            },
            {
              title: "Innovation",
              description: "Latest designs and cutting-edge printing techniques",
              icon: Zap,
              color: "from-orange-500 to-red-500",
              delay: "animation-delay-100",
            },
            {
              title: "Reliability",
              description: "Consistent delivery and professional service every time",
              icon: Shield,
              color: "from-red-600 to-orange-600",
              delay: "animation-delay-200",
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div 
                key={i} 
                className={`group bg-white p-8 rounded-2xl border border-red-100 hover:border-red-300 shadow-lg hover:shadow-2xl transition duration-500 hover:scale-105 ${item.delay} animate-slideUp`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300`}>
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
