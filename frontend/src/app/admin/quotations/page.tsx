"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Check, X, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState("pending")
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchQuotations()
  }, [statusFilter])

  const fetchQuotations = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.admin().get("/admin/quotations", {
        params: {
          status: statusFilter === "all" ? undefined : statusFilter === "pending" ? "pending_approval" : statusFilter,
        },
      })
      setQuotations(response.data.data || response.data)
    } catch (error) {
      console.error("[v0] Error fetching quotations:", error)
      toast({ title: "Error", description: "Failed to fetch quotations", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (quotation: any) => {
    try {
      setIsUpdating(true)
      await apiClient.admin().put(`/admin/quotations/${quotation.id}/status`, {
        status: "approved",
      })
      toast({ title: "Success", description: "Quotation approved successfully" })
      fetchQuotations()
      setShowModal(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve quotation", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReject = async (quotation: any) => {
    try {
      setIsUpdating(true)
      await apiClient.admin().put(`/admin/quotations/${quotation.id}/status`, {
        status: "rejected",
      })
      toast({ title: "Success", description: "Quotation rejected" })
      fetchQuotations()
      setShowModal(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject quotation", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Quotation Management</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Review and approve pending client quotations</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["pending", "approved", "rejected", "all"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === filter
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {filter === "pending" ? "Pending" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Quotations Table */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
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
                      Status
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
                  {quotations.map((quotation) => (
                    <tr
                      key={quotation.id}
                      className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
                        {quotation.quotation_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                        {quotation.customer?.first_name} {quotation.customer?.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white">
                        ${Number.parseFloat(quotation.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quotation.status)}`}
                        >
                          {quotation.status.toUpperCase()}
                        </span>
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
                          onClick={() => {
                            setSelectedQuotation(quotation)
                            setShowModal(true)
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition text-sm font-medium"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {selectedQuotation.quotation_number}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Customer</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {selectedQuotation.customer?.first_name} {selectedQuotation.customer?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Amount</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    ${Number.parseFloat(selectedQuotation.total).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Items</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {selectedQuotation.items?.length || 0}
                  </p>
                </div>
              </div>

              {/* Items */}
              {selectedQuotation.items && selectedQuotation.items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Items</h3>
                  <div className="space-y-2">
                    {selectedQuotation.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {item.product?.name || item.service?.name}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          ${(item.unit_price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedQuotation.notes && (
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Notes</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">{selectedQuotation.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedQuotation.status === "pending" && (
              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-6 flex gap-3">
                <button
                  onClick={() => handleReject(selectedQuotation)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedQuotation)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Approve & Schedule
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
