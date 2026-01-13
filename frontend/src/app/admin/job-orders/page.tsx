"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { CheckCircle, Circle, Clock, AlertCircle, Calendar, User, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const JobOrderSkeleton = () => (
  <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-20 mb-2" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-32" />
      </div>
      <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-24" />
    </div>
    <div className="space-y-2 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-48" />
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-40" />
    </div>
    <div className="space-y-2">
      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-32" />
    </div>
  </div>
)

export default function JobOrdersPage() {
  const [jobOrders, setJobOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJobOrder, setSelectedJobOrder] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchJobOrders()
  }, [statusFilter])

  const fetchJobOrders = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.admin().get("/admin/job-orders", {
        params: statusFilter !== "all" ? { status: statusFilter } : {},
      })
      const data = response.data.data || response.data
      if (Array.isArray(data)) {
        setJobOrders(data)
      } else {
        console.error("[v0] Invalid data structure:", data)
        toast({ title: "Error", description: "Invalid data structure", variant: "destructive" })
      }
    } catch (error) {
      console.error("[v0] Error fetching job orders:", error)
      toast({ title: "Error", description: "Failed to fetch job orders", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteItem = async (jobOrderId: number, itemId: number) => {
    if (!selectedJobOrder) return

    try {
      setIsUpdating(true)

      // Update the item status locally for immediate feedback
      const updatedItems = selectedJobOrder.items.map((item: any) =>
        item.id === itemId ? { ...item, completed: true } : item,
      )
      setSelectedJobOrder({ ...selectedJobOrder, items: updatedItems })

      // Send completion update to backend
      await apiClient.admin().post(`/admin/job-orders/${jobOrderId}/complete-item`, { item_id: itemId })

      toast({ title: "Success", description: "Item marked as complete" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark item as complete", variant: "destructive" })
      // Revert on error
      fetchJobOrders()
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCompleteJobOrder = async (jobOrderId: number) => {
    try {
      setIsUpdating(true)
      await apiClient.admin().put(`/admin/job-orders/${jobOrderId}/status`, {
        status: "completed",
      })
      toast({ title: "Success", description: "Job order marked as complete" })
      fetchJobOrders()
      setShowModal(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete job order", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.replace("_", "-")
    switch (normalizedStatus) {
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "on-hold":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.replace("_", "-")
    switch (normalizedStatus) {
      case "completed":
        return <CheckCircle size={18} />
      case "pending":
        return <Circle size={18} />
      case "in-progress":
        return <Clock size={18} />
      default:
        return <AlertCircle size={18} />
    }
  }

  const getCompletionPercentage = (items: any[]) => {
    if (!items || items.length === 0) return 0
    const completed = items.filter((item) => item.completed).length
    return Math.round((completed / items.length) * 100)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Job Orders Management</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Track job progress and mark items as complete</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 animate-slide-up">
          {["pending", "in_progress", "completed", "all"].map((filter, idx) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                statusFilter === filter
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {filter === "in_progress" ? "In Progress" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Job Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <JobOrderSkeleton key={i} />)
          ) : jobOrders.length === 0 ? (
            <div className="col-span-full flex items-center justify-center p-12 text-neutral-500 dark:text-neutral-400">
              <p>No job orders found</p>
            </div>
          ) : (
            jobOrders.map((jobOrder, idx) => (
              <div
                key={jobOrder.id}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 animate-fade-in"
                onClick={() => {
                  setSelectedJobOrder(jobOrder)
                  setShowModal(true)
                }}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Job Order</p>
                    <p className="font-bold text-neutral-900 dark:text-white">{jobOrder.job_order_number}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(jobOrder.status)}`}
                  >
                    {getStatusIcon(jobOrder.status)}
                    {jobOrder.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="space-y-2 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <User size={16} />
                    <span>
                      {jobOrder.customer?.first_name} {jobOrder.customer?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Calendar size={16} />
                    <span>
                      Due: {new Date(jobOrder.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {jobOrder.items && jobOrder.items.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Progress</p>
                      <p className="text-xs font-bold text-red-600 dark:text-red-400">
                        {getCompletionPercentage(jobOrder.items)}%
                      </p>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-600 to-orange-600 h-full transition-all duration-300"
                        style={{ width: `${getCompletionPercentage(jobOrder.items)}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {jobOrder.items.filter((item: any) => item.completed).length} of {jobOrder.items.length} items
                      done
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedJobOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {selectedJobOrder.job_order_number}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedJobOrder.customer?.first_name} {selectedJobOrder.customer?.last_name}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 text-2xl hover:scale-110 active:scale-95 transition-transform"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Status</p>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getStatusColor(selectedJobOrder.status)}`}
                  >
                    {getStatusIcon(selectedJobOrder.status)}
                    {selectedJobOrder.status.replace("_", " ").toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Due Date</p>
                  <p className="font-semibold text-neutral-900 dark:text-white mt-1">
                    {new Date(selectedJobOrder.due_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Start Date</p>
                  <p className="font-semibold text-neutral-900 dark:text-white mt-1">
                    {new Date(selectedJobOrder.start_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Assigned To</p>
                  <p className="font-semibold text-neutral-900 dark:text-white mt-1">
                    {selectedJobOrder.assignedTo?.first_name} {selectedJobOrder.assignedTo?.last_name}
                  </p>
                </div>
              </div>

              {/* Progress */}
              {selectedJobOrder.items && selectedJobOrder.items.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Progress</h3>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      {getCompletionPercentage(selectedJobOrder.items)}% Complete
                    </p>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden mb-4">
                    <div
                      className="bg-gradient-to-r from-red-600 to-orange-600 h-full transition-all duration-300"
                      style={{ width: `${getCompletionPercentage(selectedJobOrder.items)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Items Checklist */}
              {selectedJobOrder.items && selectedJobOrder.items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Items to Complete</h3>
                  <div className="space-y-2">
                    {selectedJobOrder.items.map((item: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => !item.completed && handleCompleteItem(selectedJobOrder.id, item.id)}
                        disabled={isUpdating}
                        className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left hover:scale-102 ${
                          item.completed
                            ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                            : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-red-400 dark:hover:border-red-600"
                        } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="mt-1">
                          {item.completed ? (
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle size={20} className="text-neutral-400 dark:text-neutral-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium ${item.completed ? "line-through text-neutral-500 dark:text-neutral-400" : "text-neutral-900 dark:text-white"}`}
                          >
                            {item.product?.name || item.service?.name}
                          </p>
                          {item.quantity && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Qty: {item.quantity}</p>
                          )}
                          {item.description && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{item.description}</p>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                          {item.completed ? "Done" : "Click to mark done"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedJobOrder.notes && (
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Notes</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                    {selectedJobOrder.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedJobOrder.status !== "completed" && (
              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-6 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-semibold transition hover:scale-105 active:scale-95"
                >
                  Close
                </button>
                {getCompletionPercentage(selectedJobOrder.items) === 100 && (
                  <button
                    onClick={() => handleCompleteJobOrder(selectedJobOrder.id)}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Mark Job Complete
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
