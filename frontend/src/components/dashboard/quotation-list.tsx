"use client"

import { useEffect, useState } from "react"
import { Eye, FileText, Download, Printer } from "lucide-react"
import { QuotationSkeleton } from "./quotation-skeleton"

interface Quotation {
  id: number
  quotation_number: string
  total: number
  status: string
  created_at: string
}

export function QuotationList() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setQuotations(data)
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredQuotations = quotations.filter((q) => {
    if (filter === "all") return true
    return q.status === filter
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <QuotationSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "draft", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredQuotations.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto mb-4 text-neutral-300" />
          <p className="text-neutral-600">No quotations found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredQuotations.map((quotation) => (
            <div
              key={quotation.id}
              className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary/30 transition"
            >
              <div className="flex-1">
                <p className="font-semibold text-neutral-900">{quotation.quotation_number}</p>
                <p className="text-sm text-neutral-600">{new Date(quotation.created_at).toLocaleDateString()}</p>
              </div>

              <div className="text-right mr-6">
                <p className="font-bold text-neutral-900">₱{quotation.total.toLocaleString()}</p>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    quotation.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : quotation.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : quotation.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {quotation.status}
                </span>
              </div>

              <div className="flex gap-2">
                <button className="p-2 hover:bg-neutral-200 rounded-lg transition" title="View">
                  <Eye size={18} className="text-neutral-600" />
                </button>
                <button className="p-2 hover:bg-neutral-200 rounded-lg transition" title="Download PDF">
                  <Download size={18} className="text-neutral-600" />
                </button>
                <button className="p-2 hover:bg-neutral-200 rounded-lg transition" title="Print">
                  <Printer size={18} className="text-neutral-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
