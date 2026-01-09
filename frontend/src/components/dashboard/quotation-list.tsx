"use client"

import { useEffect, useState } from "react"
import { Eye, FileText, Download, Printer, Send, Edit, Package } from "lucide-react"
import { QuotationSkeleton } from "./quotation-skeleton"
import { QuotationViewModal } from "./quotation-view-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

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
}

export function QuotationList() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [quotationToSend, setQuotationToSend] = useState<Quotation | null>(null)
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

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
        const quotationsList = Array.isArray(data) ? data : data.data || []
        const quotationsWithCount = quotationsList.map((q: Quotation) => ({
          ...q,
          items_count: q.items?.length || 0,
        }))
        setQuotations(quotationsWithCount)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      case "draft":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-blue-100 text-blue-700"
    }
  }

  const handleViewQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setIsModalOpen(true)
  }

  const handleSendForApproval = (quotation: Quotation) => {
    setQuotationToSend(quotation)
    setShowSendDialog(true)
  }

  const confirmSendForApproval = async () => {
    if (!quotationToSend) return
    setIsSending(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/quotations/${quotationToSend.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "pending" }),
      })

      if (response.ok) {
        toast({
          title: "Quotation Sent",
          description: `Quotation ${quotationToSend.quotation_number} has been sent for admin approval`,
        })
        // Update local state
        setQuotations(quotations.map((q) => (q.id === quotationToSend.id ? { ...q, status: "pending" } : q)))
      } else {
        toast({
          title: "Error",
          description: "Failed to send quotation for approval",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to send quotation:", error)
      toast({
        title: "Error",
        description: "An error occurred while sending the quotation",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
      setShowSendDialog(false)
      setQuotationToSend(null)
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
          {["all", "draft", "pending", "approved", "rejected"].map((status) => (
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
                ({quotations.filter((q) => (status === "all" ? true : q.status === status)).length})
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
          <div className="space-y-3">
            {filteredQuotations.map((quotation) => (
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
                  <p className="font-bold text-gray-900">₱{Number(quotation.total).toLocaleString()}</p>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mt-1 ${getStatusColor(quotation.status)}`}
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
                    <Eye size={18} />
                  </button>

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

                  <button
                    className="p-2 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-lg transition"
                    title="Download PDF"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    className="p-2 hover:bg-purple-100 text-gray-600 hover:text-purple-600 rounded-lg transition"
                    title="Print"
                  >
                    <Printer size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <QuotationViewModal quotation={selectedQuotation} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Quotation for Approval?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send quotation{" "}
              <span className="font-bold text-gray-900">{quotationToSend?.quotation_number}</span> to admin for approval
              and scheduling?
              <br />
              <br />
              Once sent, you won't be able to edit this quotation until it's reviewed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSendForApproval}
              disabled={isSending}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
            >
              {isSending ? "Sending..." : "Send for Approval"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
