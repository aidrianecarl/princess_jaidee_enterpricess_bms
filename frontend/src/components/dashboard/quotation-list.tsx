"use client"

import { useEffect, useState } from "react"
import { FileText, Send, Edit, Package, Loader2, Download } from "lucide-react"
import { QuotationSkeleton } from "./quotation-skeleton"
import { QuotationViewModal } from "./quotation-view-modal"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { generateQuotationPDF } from "@/lib/pdf-generator"

interface Quotation {
  id: number
  quotation_number: string
  total: number
  status: string
  created_at: string
  customer: any
  items: any[]
  items_count?: number
  subtotal: number
  discount: number
  tax: number
  notes: string
  has_price?: number
}

export function QuotationList() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("pending")
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [quotationToSend, setQuotationToSend] = useState<Quotation | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [branches, setBranches] = useState<any[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const { toast } = useToast()

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")

      if (!token) {
        console.error("No auth token found")
        setIsLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()

        const quotationsList = Array.isArray(data) ? data : data.data || data || []

        const quotationsWithCount = (Array.isArray(quotationsList) ? quotationsList : []).map((q: Quotation) => ({
          ...q,
          items_count: q.items?.length || 0,
        }))

        setQuotations(quotationsWithCount)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: "Failed to load quotations",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching quotations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredQuotations = quotations.filter((q) => {
    // if (filter === "draft") return q.status === "draft"
    if (filter === "pending") return q.status === "pending" && (q.has_price !== 1 && q.has_price !== "1")
    return q.status === filter
  })

  const counts = {
    all: quotations.length,
    // draft: quotations.filter((q) => q.status === "draft").length,
    pending: quotations.filter((q) => q.status === "pending").length,
    approved: quotations.filter((q) => q.status === "approved").length,
    rejected: quotations.filter((q) => q.status === "rejected").length,
  }

  // Pagination
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedQuotations = filteredQuotations.slice(startIndex, startIndex + itemsPerPage)

  const handleViewQuotation = async (quotation: Quotation) => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations/${quotation.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const detailedQuotation = data.data || data

        // Parse JSON fields in items
        const processedItems = (detailedQuotation.items || []).map((item: any) => {
          let sizeSpecs = item.size_specifications
          if (typeof sizeSpecs === 'string' && sizeSpecs) {
            try {
              sizeSpecs = JSON.parse(sizeSpecs)
            } catch (e) {
              sizeSpecs = null
            }
          }

          let designConsultation = item.design_consultation
          if (typeof designConsultation === 'string' && designConsultation) {
            try {
              designConsultation = JSON.parse(designConsultation)
            } catch (e) {
              designConsultation = null
            }
          }

          let teamRoster = item.team_roster
          if (typeof teamRoster === 'string' && teamRoster) {
            try {
              teamRoster = JSON.parse(teamRoster)
            } catch (e) {
              teamRoster = null
            }
          }

          let notes = item.notes
          if (typeof notes === 'string' && notes) {
            try {
              notes = JSON.parse(notes)
            } catch (e) {
              notes = null
            }
          }

          return {
            ...item,
            size_specifications: sizeSpecs,
            design_consultation: designConsultation,
            team_roster: teamRoster,
            notes: notes,
          }
        })

        setSelectedQuotation({ ...detailedQuotation, items: processedItems })
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error("Error fetching quotation details:", error)
      setSelectedQuotation(quotation)
      setIsModalOpen(true)
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-green-100 text-green-800"
      case "priced": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const fetchBranches = async () => {
    setIsLoadingBranches(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const branchList = Array.isArray(data) ? data : data.branches || data.data || []
        setBranches(branchList)

        const mainBranch = branchList?.find((b: any) => b.is_main_branch)
        if (mainBranch) {
          setSelectedBranchId(mainBranch.id)
        } else if (branchList?.length > 0) {
          setSelectedBranchId(branchList[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
    } finally {
      setIsLoadingBranches(false)
    }
  }

  const handleSendForApproval = (quotation: Quotation) => {
    setQuotationToSend(quotation)
    setShowSendDialog(true)
    fetchBranches()
  }

  const confirmSendForApproval = async () => {
    if (!quotationToSend) return
    setIsSending(true)

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quotations/${quotationToSend.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "pending", branch_id: selectedBranchId }),
        }
      )

      if (response.ok) {
        toast({
          title: "Quotation Sent",
          description: `Quotation ${quotationToSend.quotation_number} has been sent for admin approval`,
        })

        setQuotations(
          quotations.map((q) =>
            q.id === quotationToSend.id ? { ...q, status: "pending" } : q
          )
        )
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to send quotation for approval",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending the quotation",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
      setShowSendDialog(false)
      setQuotationToSend(null)
      setSelectedBranchId(null)
    }
  }

  const handleEditQuotation = (quotation: Quotation) => {
    window.location.href = `/dashboard/quotations/edit/${quotation.id}`
  }

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
    <>
      <div className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap border-b border-gray-200 pb-4">
          {["draft", "pending"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {/* Show count badge */}
              <span className="ml-2 text-xs opacity-75">
                ({counts[status as keyof typeof counts] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {filteredQuotations.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 font-medium">No quotations found</p>
            <p className="text-sm text-gray-500 mt-1">Create your first quotation to get started</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedQuotations.map((quotation) => (
              <div
                key={quotation.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition group"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-red-600 transition">
                    {quotation.quotation_number}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <span>
                      {new Date(quotation.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      <Package size={12} />
                      {quotation.items_count || 0} items
                    </span>
                  </div>
                </div>

                <div className="text-right mr-6 hidden sm:block">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${getStatusColor(quotation.status)}`}
                  >
                    {quotation.status === "pending"
                      ? "Pending"
                      : quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                  </span>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleViewQuotation(quotation)}
                    className="p-2 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg transition"
                    title="View Quotation"
                  >
                    <FileText size={18} />
                  </button>

                  {quotation.has_price === 1 && (
                    <button
                      onClick={() => generateQuotationPDF(quotation, `quotation-${quotation.quotation_number}`)}
                      className="p-2 hover:bg-green-100 text-gray-600 hover:text-green-600 rounded-lg transition"
                      title="Download PDF"
                    >
                      <Download size={18} />
                    </button>
                  )}

                  {quotation.status === "draft" && (
                    <button
                      onClick={() => handleEditQuotation(quotation)}
                      className="p-2 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-lg transition"
                      title="Edit Quotation"
                    >
                      <Edit size={18} />
                    </button>
                  )}

                  {quotation.status === "draft" && (
                    <button
                      onClick={() => handleSendForApproval(quotation)}
                      className="p-2 hover:bg-green-100 text-gray-600 hover:text-green-600 rounded-lg transition"
                      title="Send to Admin for Approval"
                    >
                      <Send size={18} />
                    </button>
                  )}
                </div>
              </div>
              ))}
            </div>

            {/* Modern Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition font-medium ${
                        currentPage === page
                          ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results info */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredQuotations.length)} of {filteredQuotations.length} quotations
            </div>
          </>
        )}
      </div>

      <QuotationViewModal quotation={selectedQuotation} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Send for Approval Modal */}
      {showSendDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Send Quotation for Admin Review
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Are you sure you want to send quotation{" "}
              <span className="font-bold text-gray-900 dark:text-white">{quotationToSend?.quotation_number}</span> to admin
              for review and scheduling?
              <br />
              <br />
              Once sent, you won&apos;t be able to edit this quotation until it&apos;s reviewed.
            </p>

            {isLoadingBranches ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading branches...</span>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                  Select Branch
                </label>
                <select
                  value={selectedBranchId || ""}
                  onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Select a branch --</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} {branch.is_main_branch ? "(Main)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowSendDialog(false)
                  setQuotationToSend(null)
                  setSelectedBranchId(null)
                }}
                variant="outline"
                className="flex-1"
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSendForApproval}
                disabled={isSending || !selectedBranchId || isLoadingBranches}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSending ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send for Review"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
