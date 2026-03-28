"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Eye, FileText, Loader2 } from "lucide-react"
import Link from "next/link"

interface Quotation {
  id: number
  quotation_number: string
  total: number
  status: string
  created_at: string
  customer: {
    name: string
    email: string
  }
  has_price?: number
}

export default function QuotedProposalsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user")

      if (!token || !userData) {
        router.push("/")
        return
      }

      const user = JSON.parse(userData)
      setUser(user)

      await fetchPricedQuotations(token)
    }

    checkAuth()
  }, [router])

  const fetchPricedQuotations = async (token: string) => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`${apiUrl}/quotations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch quotations")
      }

      const data = await response.json()
      const allQuotations = data.data || data

      // Filter to only show quotations with has_price = 1
      const pricedQuotations = allQuotations.filter(
        (q: Quotation) => q.has_price === 1 || q.has_price === "1"
      )

      setQuotations(pricedQuotations)

      if (pricedQuotations.length === 0) {
        setError("No quoted proposals available yet. Check back when the admin has set prices.")
      }
    } catch (err) {
      console.error("Error fetching quotations:", err)
      setError("Failed to load quoted proposals. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

      <div className="pt-14 sm:pt-16 md:ml-64 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quoted Proposals</h1>
            <p className="text-gray-600">
              View all quotation proposals with pricing set by the admin
            </p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <span className="ml-2 text-gray-600">Loading quoted proposals...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="p-8 text-center bg-yellow-50 border-yellow-200">
            <FileText className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <p className="text-yellow-800 font-medium">{error}</p>
          </Card>
        )}

        {/* Quotations List */}
        {!isLoading && quotations.length > 0 && (
          <div className="space-y-4">
            {quotations.map((quotation) => (
              <Card key={quotation.id} className="p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {quotation.quotation_number}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(quotation.status)}`}>
                        {quotation.status === "sent" ? "Sent to Production" : quotation.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Customer: <span className="font-medium">{quotation.customer?.name}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Date: {formatDate(quotation.created_at)}
                    </p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(quotation.total)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/quotations/view/${quotation.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && quotations.length === 0 && !error && (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              No quoted proposals available yet
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Check back when the admin has set prices for your quotations
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
