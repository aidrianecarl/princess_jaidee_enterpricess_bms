"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Eye, Download, FileText, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { generateQuotationPDF } from "@/lib/pdf-generator"
import { Button } from "@/components/ui/button"

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
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; quotationId: number | null }>({
    isOpen: false,
    quotationId: null,
  })
  const itemsPerPage = 10
  const { toast } = useToast()
  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

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
      console.log("[v0] Fetched quotations:", filtered.length, "items")
      
      // For pending, exclude quotations that already have price set (has_price = 1)
      if (statusFilter === "pending") {
        filtered = filtered.filter((q: any) => (q.has_price === 0 || q.has_price === "0" || !q.has_price))
        console.log("[v0] After pending filter:", filtered.length, "items")
      }
      // For priced, show only quotations with has_price = 1
      else if (statusFilter === "priced") {
        filtered = filtered.filter((q: any) => (q.has_price === 1 || q.has_price === "1"))
        console.log("[v0] After priced filter:", filtered.length, "items")
      }
      
      // Sort quotations: "sent" status (Request Order available) first, then "ordered" status last
      // For priced filter: items with status 'sent' should show first (can Request Order), 
      // items with status 'ordered' should show last (already ordered)
      filtered = filtered.sort((a: any, b: any) => {
        const aStatus = a.status?.toLowerCase() || ''
        const bStatus = b.status?.toLowerCase() || ''
        
        console.log("[v0] Comparing quotations - A:", a.id, "status:", aStatus, "| B:", b.id, "status:", bStatus)
        
        // "ordered" status comes last - these are already converted to orders
        if (aStatus === 'ordered' && bStatus !== 'ordered') {
          console.log("[v0] A is ordered, B is not - A goes after B")
          return 1
        }
        if (aStatus !== 'ordered' && bStatus === 'ordered') {
          console.log("[v0] B is ordered, A is not - B goes after A")
          return -1
        }
        
        // "sent" status (can Request Order) comes first - these are quotations ready for ordering
        if (aStatus === 'sent' && bStatus !== 'sent') {
          console.log("[v0] A is sent, B is not - A comes first")
          return -1
        }
        if (aStatus !== 'sent' && bStatus === 'sent') {
          console.log("[v0] B is sent, A is not - B comes first")
          return 1
        }
        
        // Sort others by created_at descending (newest first)
        const result = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        console.log("[v0] Sorting by date - result:", result)
        return result
      })
      
      console.log("[v0] After sorting, filtered quotations order:")
      filtered.forEach((q: any, idx: number) => {
        console.log(`[v0] ${idx + 1}. Quotation #${q.quotation_number} - Status: ${q.status}`)
      })
      
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
    router.push(`/admin/quotations/${quotationId}/pricing`)
  }

  const handleDownloadPDF = async (quotation: any) => {
    try {
      const response = await apiClient.admin().get(`/admin/quotations/${quotation.id}`)
      
      const quotationData = response.data.data || response.data
      
      if (!quotationData) {
        throw new Error("No quotation data received from API")
      }
      
      // Generate PDF with quotation data
      generateQuotationPDF(quotationData)
      
      toast({
        title: "Success",
        description: `Quotation ${quotation.quotation_number} downloaded successfully`,
        variant: "default"
      })
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to download quotation"
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      })
    }
  }

  const handleRequestOrder = async (quotationId: number) => {
    try {
      setSendingId(quotationId)

      let token = localStorage.getItem("admin_token")
      
      // Fallback to auth_token if admin_token not found
      if (!token) {
        token = localStorage.getItem("auth_token")
      }
      
      if (!token) {
        throw new Error("No authentication token found. Please log in again.")
      }

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
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to request order")
      }

      // Update the quotation in the list
      setQuotations(
        quotations.map((q) =>
          q.id === quotationId ? { ...q, status: "sent" } : q
        )
      )

      toast({
        title: "Success",
        description: "Order request sent to production successfully",
        variant: "default"
      })

      setConfirmModal({ isOpen: false, quotationId: null })
      // Refresh the quotations list
      fetchQuotations()
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to request order"
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      })
    } finally {
      setSendingId(null)
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                        Branch
                      </th>
                      {statusFilter === "priced" && (
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                          Amount
                        </th>
                      )}
                      {statusFilter === "priced" && (
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                          Status
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
                            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                              {quotation.branch?.name ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                  {quotation.branch.name}
                                </span>
                              ) : (
                                <span className="text-neutral-400 italic">-</span>
                              )}
                            </td>
                            {statusFilter === "priced" && (
                              <td className="px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white">
                                ₱
                                {Number.parseFloat(quotation.total).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            )}
                            {statusFilter === "priced" && (
                              <td className="px-4 py-3 text-sm">
                                {quotation.status === "ordered" ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                    <CheckCircle size={12} className="mr-1" />
                                    Ordered
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                    Ready to Order
                                  </span>
                                )}
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

                                {/* Priced → PDF + Request Order or Ordered */}
                                {statusFilter === "priced" && quotation.has_price && (
                                  <>
                                    <button
                                      onClick={() => handleDownloadPDF(quotation)}
                                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition text-sm font-medium hover:scale-105 active:scale-95"
                                    >
                                      <Download size={16} />
                                      PDF
                                    </button>
                                    {quotation.status === "ordered" ? (
                                      <button
                                        disabled
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 text-sm font-medium cursor-not-allowed opacity-60"
                                      >
                                        <CheckCircle size={16} />
                                        Ordered
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setConfirmModal({ isOpen: true, quotationId: quotation.id })}
                                        disabled={sendingId === quotation.id}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition text-sm font-medium hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {sendingId === quotation.id ? (
                                          <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Sending...
                                          </>
                                        ) : (
                                          <>
                                            <FileText size={16} />
                                            Request Order
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </>
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

        {/* Confirmation Modal */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Request Order</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Are you sure you want to request this quotation for production? This will update the status to sent.
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
                      handleRequestOrder(confirmModal.quotationId)
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
                    "Yes, Request Order"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
