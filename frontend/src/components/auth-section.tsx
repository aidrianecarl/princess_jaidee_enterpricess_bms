export function AuthSection() {
  return (
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">About Princess Jaidee Enterprises</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Established in 2014, we've been crafting premium custom apparel and sportswear for teams, organizations, and
            individuals across the region.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Quality",
              description: "Premium materials and expert craftsmanship in every piece",
              icon: "⭐",
            },
            {
              title: "Innovation",
              description: "Latest designs and printing techniques for modern aesthetics",
              icon: "🎨",
            },
            {
              title: "Reliability",
              description: "Consistent delivery and professional service every time",
              icon: "✅",
            },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-xl border border-neutral-200 hover:shadow-lg transition">
              <p className="text-4xl mb-4">{item.icon}</p>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{item.title}</h3>
              <p className="text-neutral-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
