"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  CheckCircle,
  Clock,
} from "lucide-react"

interface OrderItem {
  id: number
  description: string
  quantity: number
  unit_price: string | number
  line_total: string | number
}

interface JobOrder {
  id: number
  job_order_number: string
  order_id: number
  status: string
  assigned_to: number
}

interface Order {
  id: number
  order_number: string
  order_date: string
  total: number
  items?: OrderItem[]
}

export default function JobOrdersManagementPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [jobOrder, setJobOrder] = useState<JobOrder | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)
  const router = useRouter()
  const params = useParams()
  const jobOrderId = params.jobOrderId

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  const handleSidebarToggle = (open: boolean) => {
    setIsSidebarOpen(open)
  }

  // Check authentication and fetch data
  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    const userData = localStorage.getItem("admin_user")
    if (userData) setUser(JSON.parse(userData))

    fetchJobOrderAndOrder(token)
  }, [])

  const fetchJobOrderAndOrder = async (token: string) => {
    try {
      setIsLoading(true)
      setError("")

      // Fetch job order
      const jobOrderResponse = await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!jobOrderResponse.ok) {
        throw new Error("Job order not found")
      }

      const jobOrderData = await jobOrderResponse.json()
      const jobOrder = jobOrderData.data || jobOrderData
      
      console.log("[v0] Job order:", jobOrder)
      setJobOrder(jobOrder)

      // Check if current user is assigned to this job order or is admin
      const currentUserId = user?.id
      if (jobOrder.assigned_to !== currentUserId && user?.role !== "admin") {
        setError("You don't have permission to view this job order")
        return
      }

      // Fetch order details if order_id exists
      if (jobOrder.order_id) {
        const orderResponse = await fetch(`${apiUrl}/admin/orders/${jobOrder.order_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (orderResponse.ok) {
          const orderData = await orderResponse.json()
          const order = orderData.data || orderData
          console.log("[v0] Order:", order)
          setOrder(order)
        }
      }
    } catch (err) {
      console.error("[v0] Error fetching job order:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateItemStatus = async (
    itemId: number,
    newStatus: "pending" | "ongoing" | "completed"
  ) => {
    const token = localStorage.getItem("admin_token")
    if (!token) return

    try {
      setUpdatingItemId(itemId)

      const response = await fetch(`${apiUrl}/admin/order-items/${itemId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update item status")
      }

      // Update local state
      setOrder((prevOrder) => {
        if (!prevOrder || !prevOrder.items) return prevOrder
        return {
          ...prevOrder,
          items: prevOrder.items.map((item) =>
            item.id === itemId ? { ...item } : item
          ),
        }
      })

      console.log("[v0] Item status updated successfully")
    } catch (err) {
      console.error("[v0] Error updating item status:", err)
      alert("Failed to update item status")
    } finally {
      setUpdatingItemId(null)
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <AdminSidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
          <main className="flex-1 p-4 md:p-8 flex items-center justify-center min-h-screen">
            <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <Loader2 size={32} className="animate-spin text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">Loading job order...</p>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <AdminSidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-6 transition"
              >
                <ArrowLeft size={20} />
                Back
              </button>

              <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-400">Error</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-6 transition"
            >
              <ArrowLeft size={20} />
              Back to Job Orders
            </button>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                {jobOrder?.job_order_number}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {order?.order_number && `Order: ${order.order_number}`}
              </p>
            </div>

            {/* Order Summary */}
            {order && (
              <Card className="p-6 mb-8 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">Order Number</p>
                    <p className="font-semibold text-neutral-900 dark:text-white text-lg">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">Order Date</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {new Date(order.order_date).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">Total Amount</p>
                    <p className="font-bold text-neutral-900 dark:text-white text-lg">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Order Items */}
            {order?.items && order.items.length > 0 ? (
              <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Order Items & Status</h2>
                </div>
                <div className="space-y-4 p-6">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <p className="font-semibold text-neutral-900 dark:text-white mb-1">{item.description}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Qty: {item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.line_total)}
                          </p>
                        </div>
                      </div>

                      {/* Status Update Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleUpdateItemStatus(item.id, "pending")}
                          disabled={updatingItemId === item.id}
                          variant="outline"
                          className="border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                          size="sm"
                        >
                          <Clock size={16} className="mr-2" />
                          Pending
                        </Button>
                        <Button
                          onClick={() => handleUpdateItemStatus(item.id, "ongoing")}
                          disabled={updatingItemId === item.id}
                          variant="outline"
                          className="border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          size="sm"
                        >
                          <Loader2 size={16} className="mr-2" />
                          Ongoing
                        </Button>
                        <Button
                          onClick={() => handleUpdateItemStatus(item.id, "completed")}
                          disabled={updatingItemId === item.id}
                          variant="outline"
                          className="border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          size="sm"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Completed
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <Package size={32} className="text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">No order items found</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
