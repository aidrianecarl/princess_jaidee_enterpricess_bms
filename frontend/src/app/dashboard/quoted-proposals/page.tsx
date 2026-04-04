"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Eye, FileText, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
  items?: any[]
}

export default function QuotedProposalsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<"pending" | "sent" | "approved" | "all">("pending")
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; quotationId: number | null }>({
    isOpen: false,
    quotationId: null,
  })

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

  const handleSendForProduction = async (quotationId: number) => {
    try {
      setSendingId(quotationId)
      const token = localStorage.getItem("auth_token")

      const response = await fetch(`${apiUrl}/quotations/${quotationId}/send-production`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "sent",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send for production")
      }

      // Update the quotation in the list
      setQuotations(
        quotations.map((q) =>
          q.id === quotationId ? { ...q, status: "sent" } : q
        )
      )

      // Redirect to thank you page
      router.push(`/dashboard/quotations/thank-you?quotation=${quotationId}`)
      setConfirmModal({ isOpen: false, quotationId: null })
    } catch (error) {
      console.error("Error sending for production:", error)
      alert("Failed to send for production. Please try again.")
      setConfirmModal({ isOpen: false, quotationId: null })
    } finally {
      setSendingId(null)
    }
  }

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

      // Filter to only show quotations with has_price = 1 (all statuses: pending, sent, approved)
      const pricedQuotations = allQuotations.filter(
        (q: Quotation) => (q.has_price === 1 || q.has_price === "1") && ["pending", "sent", "approved"].includes(q.status)
      )

      console.log("[v0] All quotations:", allQuotations.length)
      console.log("[v0] Priced quotations:", pricedQuotations.length)
      console.log("[v0] Priced quotations data:", pricedQuotations)

      setQuotations(pricedQuotations)
      filterQuotations(pricedQuotations, "pending")

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

  const filterQuotations = (quots: Quotation[], status: "pending" | "sent" | "approved" | "all") => {
    console.log("[v0] Filtering with status:", status)
    console.log("[v0] Total quotations:", quots.length)
    
    let filtered = quots
    if (status === "pending") {
      // Only show pending quotations with prices
      filtered = quots.filter((q) => {
        const hasPriceCheck = q.has_price === 1 || q.has_price === "1" || q.has_price === true
        const statusCheck = q.status === "pending"
        console.log("[v0] Q", q.id, "- has_price:", q.has_price, "status:", q.status, "matches:", hasPriceCheck && statusCheck)
        return hasPriceCheck && statusCheck
      })
    } else if (status === "sent") {
      // Only show sent quotations
      filtered = quots.filter((q) => {
        const matches = q.status === "sent"
        console.log("[v0] Q", q.id, "- status:", q.status, "matches:", matches)
        return matches
      })
    } else if (status === "approved") {
      // Only show approved quotations
      filtered = quots.filter((q) => {
        const matches = q.status === "approved"
        console.log("[v0] Q", q.id, "- status:", q.status, "matches:", matches)
        return matches
      })
    } else if (status === "all") {
      // Show pending, sent, and approved (all with has_price)
      filtered = quots.filter((q) => {
        const hasPriceCheck = q.has_price === 1 || q.has_price === "1" || q.has_price === true
        const statusCheck = ["pending", "sent", "approved"].includes(q.status)
        console.log("[v0] Q", q.id, "- has_price:", q.has_price, "status:", q.status, "matches:", hasPriceCheck && statusCheck)
        return hasPriceCheck && statusCheck
      })
    }
    
    console.log("[v0] Filtered results:", filtered.length)
    setFilteredQuotations(filtered)
    setStatusFilter(status)
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
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <DashboardHeader user={user} />

      <div className="pt-14 sm:pt-16 md:ml-64 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">Quoted Proposals</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            View all quotation proposals with pricing set by the admin
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => filterQuotations(quotations, "pending")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              statusFilter === "pending"
                ? "bg-orange-500 text-white"
                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            Pending ({quotations.filter((q) => (q.has_price === 1 || q.has_price === "1") && q.status === "pending").length})
          </button>
          <button
            onClick={() => filterQuotations(quotations, "sent")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              statusFilter === "sent"
                ? "bg-green-500 text-white"
                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            Sent to Production ({quotations.filter((q) => q.status === "sent").length})
          </button>
          <button
            onClick={() => filterQuotations(quotations, "approved")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              statusFilter === "approved"
                ? "bg-blue-500 text-white"
                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            Approved ({quotations.filter((q) => q.status === "approved").length})
          </button>
          <button
            onClick={() => filterQuotations(quotations, "all")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              statusFilter === "all"
                ? "bg-purple-500 text-white"
                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            All Proposals ({quotations.filter((q) => (q.has_price === 1 || q.has_price === "1") && ["pending", "sent", "approved"].includes(q.status)).length})
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading quoted proposals...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="p-8 text-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900">
            <FileText className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">{error}</p>
          </Card>
        )}

        {/* Quotations List */}
        {!isLoading && filteredQuotations.length > 0 && (
          <div className="space-y-4">
            {filteredQuotations.map((quotation) => (
              <Card key={quotation.id} className="p-6 hover:shadow-md transition border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {quotation.quotation_number}
                      </h3>
                      <Badge className={`${getStatusColor(quotation.status)}`}>
                        {quotation.status === "sent" ? "Sent to Production" : quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Items</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">{quotation.items?.length || 0} item(s)</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Date</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">{formatDate(quotation.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-3">
                      {formatCurrency(quotation.total)}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href={`/dashboard/quotations/view/${quotation.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 w-full sm:w-auto border-neutral-300 dark:border-neutral-700"
                      >
                        <Eye size={16} />
                        View Details
                      </Button>
                    </Link>
                    {(quotation.has_price === 1 || quotation.has_price === "1") && quotation.status !== "sent" && (
                      <Button
                        onClick={() => setConfirmModal({ isOpen: true, quotationId: quotation.id })}
                        disabled={sendingId === quotation.id}
                        className="flex items-center gap-2 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                        size="sm"
                      >
                        {sendingId === quotation.id ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <FileText size={16} />
                            Send for Production
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredQuotations.length === 0 && quotations.length > 0 && !error && (
          <Card className="p-8 text-center border-neutral-200 dark:border-neutral-800">
            <FileText className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">
              No proposals with this status
            </p>
          </Card>
        )}

        {!isLoading && quotations.length === 0 && !error && (
          <Card className="p-8 text-center border-neutral-200 dark:border-neutral-800">
            <FileText className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">
              No quoted proposals available yet
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
              Check back when the admin has set prices for your quotations
            </p>
          </Card>
        )}

        {/* Confirmation Modal */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Confirm Order</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Are you sure you want to send this quotation for production? This will finalize your proposal and send it to our production team.
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={() => setConfirmModal({ isOpen: false, quotationId: null })}
                  variant="outline"
                  className="flex-1 border-neutral-300 dark:border-neutral-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (confirmModal.quotationId) {
                      handleSendForProduction(confirmModal.quotationId)
                    }
                  }}
                  disabled={sendingId !== null}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {sendingId ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Confirming...
                    </>
                  ) : (
                    "Yes, Confirm"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
