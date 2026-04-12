"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Eye, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { generateQuotationPDF } from "@/lib/pdf-generator"

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
  const [statusFilter, setStatusFilter] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredQuotations, setFilteredQuotations] = useState<any[]>([])
  const itemsPerPage = 10
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchQuotations()
  }, [statusFilter])

  useEffect(() => {
    const filtered = quotations.filter((q) => {
      const quotationNumber = q.quotation_number?.toLowerCase() || ""
      const customerName = (q.customer?.bill_to_name || q.bill_to_name || "").toLowerCase()
      const customerEmail = (q.customer?.bill_to_email || q.bill_to_email || "").toLowerCase()
      const query = searchQuery.toLowerCase()

      return quotationNumber.includes(query) || customerName.includes(query) || customerEmail.includes(query)
    })

    setFilteredQuotations(filtered)
    setCurrentPage(1)
  }, [searchQuery, quotations])

  const fetchQuotations = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.admin().get("/admin/quotations", {
        params: {
          status: statusFilter !== "priced" ? statusFilter : undefined,
        },
      })

      let filtered = response.data.data || response.data || []

      if (statusFilter === "pending") {
        filtered = filtered.filter((q: any) => (q.has_price === 0 || q.has_price === "0" || !q.has_price))
      } else if (statusFilter === "priced") {
        filtered = filtered.filter((q: any) => (q.has_price === 1 || q.has_price === "1"))
      }

      setQuotations(filtered)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to fetch quotations"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewQuotation = (quotationId: number) => {
    if (!quotationId) {
      toast({ title: "Error", description: "Invalid quotation ID", variant: "destructive" })
      return
    }
    router.push(`/admin/quotations/${quotationId}/pricing`)
  }

  const handleDownloadPDF = async (quotation: any) => {
    try {
      const response = await apiClient.admin().get(`/admin/quotations/${quotation.id}`)
      const quotationData = response.data.data || response.data

      if (!quotationData) {
        throw new Error("No quotation data received from API")
      }

      generateQuotationPDF(quotationData)

      toast({
        title: "Success",
        description: `Quotation ${quotation.quotation_number} downloaded successfully`,
        variant: "default",
      })
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to download quotation"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Quotation Management</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Review and approve pending client quotations</p>
        </div>

        <div className="animate-slide-up">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Quotation #, Customer, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 animate-slide-up">
          {[
            { key: "pending", label: "Pending (No Price)" },
            { key: "priced", label: "Priced Quotations" },
            { key: "rejected", label: "Rejected" },
          ].map((filter: any) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                statusFilter === filter.key
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg scale-105"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation.id}>
                    <td className="px-4 py-3 text-right">
                      {statusFilter !== "rejected" && (
                        <div className="flex gap-2 justify-end">
                          {statusFilter === "pending" && (
                            <button onClick={() => handleViewQuotation(quotation.id)}>
                              <Eye size={16} /> View
                            </button>
                          )}

                          {statusFilter === "priced" && (
                            <>
                              <button onClick={() => handleViewQuotation(quotation.id)}>
                                <Eye size={16} /> View
                              </button>
                              {quotation.has_price && (
                                <button onClick={() => handleDownloadPDF(quotation)}>
                                  <Download size={16} /> PDF
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}