import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Maria Santos",
      role: "School Sports Director",
      rating: 5,
      text: "Excellent quality and fast delivery! Our team jerseys look amazing and arrived exactly on time for the championship.",
      avatar: "MS",
    },
    {
      name: "John Rivera",
      role: "Corporate Events Manager",
      rating: 5,
      text: "Professional service from start to finish. The custom design process was smooth and the final product exceeded expectations.",
      avatar: "JR",
    },
    {
      name: "Ana Reyes",
      role: "Basketball Coach",
      rating: 5,
      text: "Best custom apparel provider in the region. Highly recommended for any team or organization needs.",
      avatar: "AR",
    },
  ]

  return (
    <section id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-neutral-900">What Our Customers Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-white p-8 rounded-xl border border-neutral-200 hover:shadow-lg transition">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} size={18} fill="#dc2626" className="text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-neutral-600 mb-6 leading-relaxed">"{testimonial.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                  <p className="text-sm text-neutral-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
