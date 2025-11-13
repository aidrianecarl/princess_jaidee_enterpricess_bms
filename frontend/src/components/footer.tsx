import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">PJ</span>
              </div>
              <span className="font-bold text-lg">Princess Jaidee</span>
            </div>
            <p className="text-neutral-400">Premium custom apparel and sportswear solutions since 2014.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#home" className="hover:text-primary transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-primary transition">
                  About
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-primary transition">
                  Services
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-primary transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>Custom Jerseys</li>
              <li>Team Uniforms</li>
              <li>Corporate Apparel</li>
              <li>Custom Printing</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-neutral-400">
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-primary" />
                <span>+63 9XX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-primary" />
                <span>info@jaidee.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={18} className="text-primary mt-1" />
                <span>Calinog, Iloilo, Philippines</span>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="py-12 border-t border-neutral-800">
          <h3 className="font-semibold mb-6 text-center">Our Location</h3>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d486.0025654399159!2d124.00560389511456!3d12.97053847250623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a0ef171d4bdfc7%3A0x94c81a6687fbad2b!2sPrincess%20Jaidee%20Enterprises!5e0!3m2!1sen!2sph!4v1763016141937!5m2!1sen!2sph"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: "0.5rem" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-neutral-800 py-8 flex flex-col md:flex-row justify-between items-center text-neutral-400 text-sm">
          <p>&copy; 2025 Princess Jaidee Enterprises. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
