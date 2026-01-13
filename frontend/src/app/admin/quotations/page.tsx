"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const QuotationSkeleton = () => (
  <tr>
    <td className="px-4 py-3">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-20 animate-pulse" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-32 animate-pulse" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24 animate-pulse" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-20 animate-pulse" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-28 animate-pulse" />
    </td>
  </tr>
)

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("pending_approval")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchQuotations()
  }, [statusFilter])

  const fetchQuotations = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.admin().get("/admin/quotations", {
        params: {
          status: statusFilter,
        },
      })
      console.log("[v0] Quotations response:", response.data)
      setQuotations(response.data.data || response.data)
    } catch (error) {
      console.error("[v0] Error fetching quotations:", error)
      toast({ title: "Error", description: "Failed to fetch quotations", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewQuotation = (quotationId: number) => {
    if (!quotationId) {
      toast({ title: "Error", description: "Invalid quotation ID", variant: "destructive" })
      return
    }
    console.log("[v0] Navigating to quotation:", quotationId)
    router.push(`/admin/quotations/${quotationId}/preview`)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Quotation Management</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Review and approve pending client quotations</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 animate-slide-up">
          {[
            { key: "pending_approval", label: "Pending" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                statusFilter === filter.key
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg scale-105"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Quotations Table */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-scale-in">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full" />
              </div>
            </div>
          ) : quotations.length === 0 ? (
            <div className="flex items-center justify-center p-12 text-neutral-500 dark:text-neutral-400">
              <p>No quotations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                      Quotation #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => <QuotationSkeleton key={i} />)
                    : quotations.map((quotation, idx) => {
                        const customerName = quotation.customer
                          ? `${quotation.customer.first_name || ""} ${quotation.customer.last_name || ""}`.trim()
                          : "Unknown Customer"

                        return (
                          <tr
                            key={quotation.id}
                            className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition animate-fade-in"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
                              {quotation.quotation_number}
                            </td>
                            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{customerName}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white">
                              ₱
                              {Number.parseFloat(quotation.total).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                              {new Date(quotation.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleViewQuotation(quotation.id)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition text-sm font-medium hover:scale-105 active:scale-95"
                              >
                                <Eye size={16} />
                                View
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
