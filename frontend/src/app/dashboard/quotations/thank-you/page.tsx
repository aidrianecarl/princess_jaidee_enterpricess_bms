"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, MapPin, Clock, Phone, Mail } from "lucide-react"

function ThankYouContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quotationId = searchParams.get("quotation")
  const [countdown, setCountdown] = useState(60)
  const [isClient, setIsClient] = useState(false)
  const [branch, setBranch] = useState<any>(null)
  const [isLoadingBranch, setIsLoadingBranch] = useState(true)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !quotationId) {
      setIsLoadingBranch(false)
      return
    }

    // Fetch quotation to get branch_id
    const fetchQuotationAndBranch = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

        // Get quotation details
        const quotationResponse = await fetch(`${apiUrl}/quotations/${quotationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (quotationResponse.ok) {
          const quotationData = await quotationResponse.json()
          const branchId = quotationData.data?.branch_id || quotationData.branch_id

          if (branchId) {
            // Fetch branch details
            const branchResponse = await fetch(`${apiUrl}/branches/${branchId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })

            if (branchResponse.ok) {
              const branchData = await branchResponse.json()
              const branchInfo = branchData.data || branchData
              setBranch(branchInfo)
              console.log("[v0] Branch loaded:", branchInfo)
            }
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching branch:", error)
      } finally {
        setIsLoadingBranch(false)
      }
    }

    fetchQuotationAndBranch()
  }, [isClient, quotationId])

  useEffect(() => {
    if (!isClient) return

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
  }, [router, isClient])

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center p-4">
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
                Please visit
              </p>
              {isLoadingBranch ? (
                <p className="text-2xl font-bold text-orange-500 mb-4">Loading branch details...</p>
              ) : branch ? (
                <>
                  <p className="text-3xl font-bold text-red-600 mb-4">
                    {branch.name}
                  </p>
                  <p className="text-gray-700 mb-6">
                    of Princess Jaidee Enterprises to settle the payment and finalize your order.
                  </p>

                  {/* Branch Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 bg-white rounded-lg p-6">
                    <div className="border-b sm:border-b-0 sm:border-r pb-4 sm:pb-0 sm:pr-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="text-red-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Address</p>
                          <p className="text-sm font-medium text-gray-800">{branch.address || "N/A"}</p>
                          {branch.location && (
                            <p className="text-xs text-gray-600 mt-1">{branch.location}</p>
                          )}
                          {branch.zip_code && (
                            <p className="text-xs text-gray-600">{branch.zip_code}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-b sm:border-b-0 pb-4 sm:pb-0">
                      <div className="space-y-3">
                        {branch.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone className="text-red-600 flex-shrink-0" size={18} />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                              <p className="text-sm font-medium text-gray-800">{branch.phone_number}</p>
                            </div>
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="text-red-600 flex-shrink-0" size={18} />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                              <p className="text-sm font-medium text-gray-800">{branch.email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-red-600 mb-4">
                    Princess Jaidee Enterprises
                  </p>
                  <p className="text-gray-700 mb-6">
                    to settle the payment and finalize your order.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Contact the nearest branch for more details</p>
                  </div>
                </>
              )}
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
                Order Reference: <span className="font-mono font-semibold text-gray-700">#{quotationId || "Pending"}</span>
              </p>
              <p className="text-xs text-gray-400">
                An email confirmation has been sent to your registered email address.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
