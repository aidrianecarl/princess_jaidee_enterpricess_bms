"use client"

import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  FileText,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Package,
} from "lucide-react"

interface JobOrderItem {
  id: number
  job_order_id: number
  description: string
  quantity: number
  unit_price: string | number
  line_total: string | number
  completed: boolean
  completed_at?: string
}

interface JobOrder {
  id: number
  job_order_number: string
  quotation_id?: number
  customer_id: number
  assigned_to: number
  start_date: string
  due_date: string
  completed_date?: string
  status: "pending" | "ongoing" | "completed"
  priority: "low" | "medium" | "high"
  notes?: string
  items?: JobOrderItem[]
  customer?: {
    id: number
    bill_to_name: string
    bill_to_email: string
    bill_to_phone?: string
  }
  assignedTo?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  assigned_to?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
}

export default function JobOrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const [savingItemId, setSavingItemId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const handleSidebarToggle = (open: boolean) => {
    setIsSidebarOpen(open)
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    const userData = localStorage.getItem("admin_user")
    if (userData) setUser(JSON.parse(userData))

    fetchJobOrders(token)
  }, [])

  const fetchJobOrders = async (token: string) => {
    try {
      setIsLoading(true)
      setError("")

      console.log("[v0] Fetching job orders from:", `${apiUrl}/admin/job-orders`)

      const response = await fetch(`${apiUrl}/admin/job-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API Error:", errorText)
        throw new Error(`API Error ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Job orders received:", data)

      const jobOrders = Array.isArray(data) ? data : data.data || data
      setJobOrders(jobOrders)
    } catch (err) {
      console.error("[v0] Error fetching job orders:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`Failed to load job orders: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateItemStatus = async (itemId: number, jobOrderId: number, newStatus: "pending" | "ongoing" | "finished") => {
    const token = localStorage.getItem("admin_token")
    if (!token) return

    try {
      setSavingItemId(itemId)
      console.log("[v0] Updating item status:", { itemId, jobOrderId, status: newStatus })

      const response = await fetch(`${apiUrl}/admin/job-order-items/${itemId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          completed: newStatus === "finished",
          completed_at: newStatus === "finished" ? new Date().toISOString() : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update item status")
      }

      console.log("[v0] Item status updated")

      // Update local state
      setJobOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === jobOrderId && order.items) {
            const updatedItems = order.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    completed: newStatus === "finished",
                    completed_at: newStatus === "finished" ? new Date().toISOString() : undefined,
                  }
                : item
            )

            // Check if all items are finished
            const allFinished = updatedItems.every((item) => item.completed)

            // If all items are finished, update job order status to completed
            if (allFinished && order.status !== "completed") {
              updateJobOrderStatus(jobOrderId, "completed", token)
            }

            return { ...order, items: updatedItems }
          }
          return order
        })
      )
    } catch (err) {
      console.error("[v0] Error updating item status:", err)
      alert("Failed to update item status")
    } finally {
      setSavingItemId(null)
    }
  }

  const updateJobOrderStatus = async (jobOrderId: number, status: string, token: string) => {
    try {
      console.log("[v0] Updating job order status:", { jobOrderId, status })

      const response = await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
          completed_date: status === "completed" ? new Date().toISOString().split("T")[0] : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update job order status")
      }

      console.log("[v0] Job order status updated successfully")

      // Update local state
      setJobOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === jobOrderId ? { ...order, status: status as any } : order))
      )
    } catch (err) {
      console.error("[v0] Error updating job order status:", err)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (value: number | string | null | undefined) => {
    const num = typeof value === "string" ? parseFloat(value) : value

    if (!num || isNaN(Number(num))) return "₱0.00"

    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(num))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
      case "ongoing":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      default:
        return "bg-neutral-100 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
      case "medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"
      case "high":
        return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
      default:
        return "bg-neutral-50 dark:bg-neutral-900/20 text-neutral-700 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800"
    }
  }

  const getItemStatusColor = (completed: boolean) => {
    return completed
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Job Orders</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage and track all job orders and their progress
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Card className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-400">Error</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Loading State */}
            {isLoading ? (
              <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <Loader2 size={32} className="animate-spin text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">Loading job orders...</p>
              </Card>
            ) : jobOrders.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <Package size={32} className="text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">No job orders found</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                  Create one from the Sales & Orders page
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {jobOrders.map((jobOrder) => (
                  <Card
                    key={jobOrder.id}
                    className="overflow-hidden hover:shadow-lg transition bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                  >
                    {/* Job Order Header */}
                    <div
                      onClick={() => setExpandedOrder(expandedOrder === jobOrder.id ? null : jobOrder.id)}
                      className="p-4 md:p-6 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                              {jobOrder.job_order_number}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(jobOrder.status)}`}>
                              {jobOrder.status
                                ? jobOrder.status.charAt(0).toUpperCase() + jobOrder.status.slice(1)
                                : "Unknown"}
                            </span>
                            {jobOrder.priority && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(jobOrder.priority)}`}>
                                {jobOrder.priority.toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs">Customer</p>
                              <p className="font-semibold text-neutral-900 dark:text-white">
                                {jobOrder.customer?.bill_to_name || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs">Assigned To</p>
                              <p className="font-semibold text-neutral-900 dark:text-white">
                                {jobOrder.assigned_to 
                                  ? `${jobOrder.assigned_to.first_name} ${jobOrder.assigned_to.last_name}`
                                  : jobOrder.assignedTo
                                  ? `${jobOrder.assignedTo.first_name} ${jobOrder.assignedTo.last_name}`
                                  : "N/A"
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs">Start Date</p>
                              <p className="font-semibold text-neutral-900 dark:text-white">
                                {formatDate(jobOrder.start_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs">Due Date</p>
                              <p className="font-semibold text-neutral-900 dark:text-white">
                                {formatDate(jobOrder.due_date)}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {jobOrder.items && jobOrder.items.length > 0 && (
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Progress</p>
                                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                                  {jobOrder.items.filter((i) => i.completed).length}/{jobOrder.items.length} items finished
                                </p>
                              </div>
                              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${(jobOrder.items.filter((i) => i.completed).length / jobOrder.items.length) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            onClick={() => router.push(`/admin/job-orders/${jobOrder.id}/orders`)}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm"
                            size="sm"
                          >
                            View Orders
                          </Button>
                          <button className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition">
                            {expandedOrder === jobOrder.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedOrder === jobOrder.id && (
                      <div className="p-4 md:p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50 space-y-6">
                        {/* Job Order Items */}
                        {jobOrder.items && jobOrder.items.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">
                              Items ({jobOrder.items.length})
                            </h4>
                            <div className="space-y-2">
                              {jobOrder.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 gap-3"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-neutral-900 dark:text-white text-sm">{item.description}</p>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                      Qty: {item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.line_total)}
                                    </p>
                                  </div>

                                  {/* Item Status Selector */}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdateItemStatus(item.id, jobOrder.id, "pending")}
                                      disabled={savingItemId === item.id}
                                      className={`px-3 py-1 rounded text-xs font-semibold transition ${
                                        !item.completed
                                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-2 border-yellow-400 dark:border-yellow-600"
                                          : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border-2 border-neutral-200 dark:border-neutral-600 hover:border-yellow-400 dark:hover:border-yellow-600"
                                      }`}
                                    >
                                      Pending
                                    </button>
                                    <button
                                      onClick={() => handleUpdateItemStatus(item.id, jobOrder.id, "ongoing")}
                                      disabled={savingItemId === item.id}
                                      className={`px-3 py-1 rounded text-xs font-semibold transition ${
                                        !item.completed
                                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-2 border-blue-400 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-600"
                                          : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border-2 border-neutral-200 dark:border-neutral-600"
                                      }`}
                                    >
                                      Ongoing
                                    </button>
                                    <button
                                      onClick={() => handleUpdateItemStatus(item.id, jobOrder.id, "finished")}
                                      disabled={savingItemId === item.id}
                                      className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
                                        item.completed
                                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-400 dark:border-green-600"
                                          : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border-2 border-neutral-200 dark:border-neutral-600 hover:border-green-400 dark:hover:border-green-600"
                                      }`}
                                    >
                                      {savingItemId === item.id ? (
                                        <Loader2 size={12} className="animate-spin" />
                                      ) : (
                                        <CheckCircle size={12} />
                                      )}
                                      Finished
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {/* Notes */}
                        {jobOrder.notes && (
                          <div>
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-2">Notes</h4>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                              {jobOrder.notes}
                            </p>
                          </div>
                        )}

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Customer Email</p>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white break-all">
                              {jobOrder.customer?.bill_to_email || "N/A"}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Customer Phone</p>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {jobOrder.customer?.bill_to_phone || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
