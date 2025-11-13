import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { AuthSection } from "@/components/auth-section"
import { Partnerships } from "@/components/partnerships"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <AuthSection />
      <Partnerships />
      <Testimonials />
      <Footer />
    </main>
  )
}
