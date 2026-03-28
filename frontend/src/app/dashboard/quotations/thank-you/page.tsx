"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, MapPin, Clock, Phone } from "lucide-react"

export default function ThankYouPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quotationId = searchParams.get("quotation")
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/dashboard/quoted-proposals")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation Container */}
        <div className="animate-fadeIn mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
              <CheckCircle size={80} className="text-green-500 animate-slideIn" />
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Thank You for Your Order!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your quotation has been successfully submitted for production.
            </p>

            {/* Message Section */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8 mb-8 border-2 border-red-200">
              <p className="text-xl text-gray-800 font-semibold mb-4">
                Please visit the nearest branch of
              </p>
              <p className="text-3xl font-bold text-red-600 mb-4">
                Princess Jaidee Enterprises
              </p>
              <p className="text-gray-700 mb-6">
                in your area to settle the payment and finalize your order.
              </p>

              {/* Branch Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <MapPin className="text-red-600 mx-auto mb-2" size={24} />
                  <p className="text-sm text-gray-600">Visit any branch</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <Phone className="text-red-600 mx-auto mb-2" size={24} />
                  <p className="text-sm text-gray-600">Call us for help</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <Clock className="text-red-600 mx-auto mb-2" size={24} />
                  <p className="text-sm text-gray-600">Business hours</p>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="mb-8">
              <p className="text-gray-600 mb-2">Returning to Quoted Proposals in</p>
              <div className="text-5xl font-bold text-red-600 font-mono">
                {countdown}s
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/dashboard/quoted-proposals")}
                className="bg-gradient-to-r from-red-600 to-orange-500 text-white hover:shadow-lg px-8"
              >
                Back to Quoted Proposals
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="px-8"
              >
                Go to Dashboard
              </Button>
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Order Reference: <span className="font-mono font-semibold text-gray-700">#{quotationId}</span>
              </p>
              <p className="text-xs text-gray-400">
                An email confirmation has been sent to your registered email address.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
