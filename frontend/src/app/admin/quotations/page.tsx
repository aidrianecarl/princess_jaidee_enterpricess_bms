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
    // Filter quotations based on search query
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
      
      // Filter quotations based on status
      let filtered = response.data.data || response.data || []
      
      // For pending, exclude quotations that already have price set (has_price = 1)
      if (statusFilter === "pending") {
        filtered = filtered.filter((q: any) => (q.has_price === 0 || q.has_price === "0" || !q.has_price))
      }
      // For priced, show only quotations with has_price = 1
      else if (statusFilter === "priced") {
        filtered = filtered.filter((q: any) => (q.has_price === 1 || q.has_price === "1"))
      }
      
      setQuotations(filtered)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to fetch quotations"
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
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
    console.log("Navigating to quotation pricing:", quotationId)
    router.push(`/admin/quotations/${quotationId}/pricing`)
  }

  const handleDownloadPDF = async (quotation: any) => {
    try {
      console.log("[v0] PDF Download - Starting for quotation ID:", quotation.id)
      
      const response = await apiClient.admin().get(`/admin/quotations/${quotation.id}`)
      console.log("[v0] PDF Download - API response received:", response)
      
      const quotationData = response.data.data || response.data
      console.log("[v0] PDF Download - Quotation data:", quotationData)
      
      if (!quotationData) {
        throw new Error("No quotation data received from API")
      }
      
      // Generate PDF with quotation data
      console.log("[v0] PDF Download - Calling generateQuotationPDF")
      generateQuotationPDF(quotationData)
      console.log("[v0] PDF Download - PDF generated successfully")
      
      toast({
        title: "Success",
        description: `Quotation ${quotation.quotation_number} downloaded successfully`,
        variant: "default"
      })
    } catch (error: any) {
      console.error("[v0] PDF Download - Error occurred:", error)
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to download quotation"
      console.log("[v0] PDF Download - Error message:", errorMessage)
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Quotation Management</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Review and approve pending client quotations</p>
        </div>

        {/* Search Bar */}
        <div className="animate-slide-up">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Quotation #, Customer, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 animate-slide-up">
          {[
            { key: "pending", label: "Pending (No Price)", hideCount: true },
            { key: "priced", label: "Priced Quotations" },
            { key: "rejected", label: "Rejected", hideCount: true },
          ].map((filter: any) => (
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
          ) : filteredQuotations.length === 0 ? (
            <div className="flex items-center justify-center p-12 text-neutral-500 dark:text-neutral-400">
              <p>{searchQuery ? "No quotations match your search" : "No quotations found"}</p>
            </div>
          ) : (
            <>
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
                        Email
                      </th>
                      {statusFilter === "priced" && (
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                          Amount
                        </th>
                      )}
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
                      : filteredQuotations
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((quotation, idx) => {
                        // Get customer data from relationship
                        const customerName = quotation.customer?.bill_to_name || quotation.bill_to_name || "Unknown Customer"
                        const customerEmail = quotation.customer?.bill_to_email || quotation.bill_to_email || "-"

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
                            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{customerEmail}</td>
                            {statusFilter === "priced" && (
                              <td className="px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white">
                                ₱
                                {Number.parseFloat(quotation.total).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            )}
                            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                              {new Date(quotation.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex gap-2 justify-end">
                                {/* Pending (No Price) → View only */}
                                {statusFilter === "pending" && (
                                  <button
                                    onClick={() => handleViewQuotation(quotation.id)}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition text-sm font-medium hover:scale-105 active:scale-95"
                                  >
                                    <Eye size={16} />
                                    View
                                  </button>
                                )}

                                {/* Priced → PDF only */}
                                {statusFilter === "priced" && quotation.has_price && (
                                  <button
                                    onClick={() => handleDownloadPDF(quotation)}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition text-sm font-medium hover:scale-105 active:scale-95"
                                  >
                                    <Download size={16} />
                                    PDF
                                  </button>
                                )}

                                {/* Rejected → No actions */}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredQuotations.length > itemsPerPage && (
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredQuotations.length)} of {filteredQuotations.length} quotations
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(filteredQuotations.length / itemsPerPage) }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-2 rounded-lg font-medium transition ${
                          currentPage === i + 1
                            ? "bg-orange-600 text-white"
                            : "border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredQuotations.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredQuotations.length / itemsPerPage)}
                      className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
