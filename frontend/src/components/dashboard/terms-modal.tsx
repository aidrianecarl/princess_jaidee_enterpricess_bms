"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"

interface TermsModalProps {
  onAccept: () => void
}

export function TermsConditionsModal({ onAccept }: TermsModalProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  const handleAccept = () => {
    localStorage.setItem("terms_accepted", "true")
    onAccept()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-neutral-200 bg-neutral-50">
          <AlertCircle className="text-primary" size={24} />
          <h2 className="text-2xl font-bold text-neutral-900">Terms & Conditions</h2>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-6"
          onScroll={(e) => {
            const target = e.target as HTMLDivElement
            setIsScrolled(target.scrollHeight - target.scrollTop <= target.clientHeight + 50)
          }}
        >
          <div className="space-y-4 text-sm text-neutral-700">
            <section>
              <h3 className="font-bold mb-2">1. Agreement to Terms</h3>
              <p>
                By accessing and using Princess Jaidee Enterprises services, you accept and agree to be bound by the
                terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">2. Service Description</h3>
              <p>
                We provide custom apparel design, quotation generation, and order management services. All products and
                services are subject to availability and confirmation.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">3. User Responsibilities</h3>
              <p>
                Users agree to provide accurate information and maintain confidentiality of login credentials. Users are
                responsible for all activities under their account.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">4. Payment Terms</h3>
              <p>
                Prices are in Philippine Peso (₱). Payment terms and conditions will be specified in individual
                quotations. We accept various payment methods as indicated during checkout.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">5. Quotation Validity</h3>
              <p>
                Quotations are valid for 30 days from issuance unless otherwise stated. Prices are subject to change
                based on material costs and market conditions.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">6. Order Fulfillment</h3>
              <p>
                Orders will be processed in the order they are received. Delivery timelines will be communicated upon
                confirmation. We reserve the right to adjust timelines based on production capacity.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">7. Intellectual Property</h3>
              <p>
                All designs, logos, and content on our platform remain the property of Princess Jaidee Enterprises
                unless otherwise agreed upon in writing.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">8. Limitation of Liability</h3>
              <p>
                Princess Jaidee Enterprises shall not be liable for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use of our services.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">9. Privacy Policy</h3>
              <p>
                Your personal information will be handled according to our privacy policy. We are committed to
                protecting your data.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2">10. Modifications to Terms</h3>
              <p>
                We reserve the right to modify these terms at any time. Continued use of our services constitutes
                acceptance of changes.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-6 bg-neutral-50">
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              disabled={!isScrolled}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              I Accept
            </button>
            <button className="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-lg hover:bg-neutral-100 transition">
              Decline
            </button>
          </div>
          {!isScrolled && (
            <p className="text-xs text-neutral-500 mt-3 text-center">Please scroll to the bottom to accept</p>
          )}
        </div>
      </div>
    </div>
  )
}
