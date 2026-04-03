"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, Calendar, User, FileText, Package } from "lucide-react"

interface JobOrderItem {
  id: number
  product_id: number | null
  service_id: number | null
  description: string
  quantity: number
  unit_price: number
  product?: { id: number; name: string }
  service?: { id: number; name: string }
}

interface JobOrder {
  id: number
  job_order_number: string
  quotation_id: number
  customer_id: number
  assigned_to: number
  start_date: string
  due_date: string
  status: string
  notes: string | null
  created_at: string
  assignedTo?: { first_name: string; last_name: string; email: string }
  items?: JobOrderItem[]
}

const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
  pending: { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-400", badge: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" },
  "in-progress": { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", badge: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" },
  completed: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", badge: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" },
  cancelled: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", badge: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" },
}

export default function MyOrdersPage() {
  const [user, setUser] = useState(null)
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchMyOrders()
  }, [])

  const fetchMyOrders = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

      if (!token || !userData) {
        router.push("/login")
        return
      }

      const user = JSON.parse(userData)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com"

      // Fetch job orders for this customer
      const response = await fetch(`${apiUrl}/api/job-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Filter orders for current customer
      const myOrders = data.data.filter((order: JobOrder) => order.customer_id === user.customer_id)
      setJobOrders(myOrders)
    } catch (err) {
      console.error("[v0] Error fetching orders:", err)
      setError(err instanceof Error ? err.message : "Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    return statusColors[status] || statusColors.pending
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">My Orders</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Track and manage your job orders</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-neutral-600 dark:text-neutral-400">Loading your orders...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && jobOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600 mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No orders yet</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">You don&apos;t have any job orders yet. Create a quotation to get started.</p>
            <Button onClick={() => router.push("/dashboard/quotations/create")} className="bg-orange-500 hover:bg-orange-600 text-white">
              Create New Quotation
            </Button>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && jobOrders.length > 0 && (
          <div className="space-y-4">
            {jobOrders.map((order) => {
              const colors = getStatusColor(order.status)
              const daysRemaining = calculateDaysRemaining(order.due_date)
              const isOverdue = daysRemaining < 0
              const isUrgent = daysRemaining >= 0 && daysRemaining <= 7

              return (
                <Card key={order.id} className={`overflow-hidden transition-all duration-300 ${colors.bg} border-l-4 border-orange-500`}>
                  <div
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{order.job_order_number}</h3>
                          <Badge className={colors.badge}>{order.status.replace("_", " ").toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Created on {formatDate(order.created_at)}</p>
                      </div>
                      <ChevronDown
                        size={24}
                        className={`text-neutral-600 dark:text-neutral-400 transition-transform ${expandedOrderId === order.id ? "rotate-180" : ""}`}
                      />
                    </div>

                    {/* Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-orange-500" />
                        <div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">Start Date</p>
                          <p className="font-semibold text-neutral-900 dark:text-white">{formatDate(order.start_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className={isOverdue ? "text-red-500" : isUrgent ? "text-yellow-500" : "text-green-500"} />
                        <div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">Due Date</p>
                          <p className="font-semibold text-neutral-900 dark:text-white">{formatDate(order.due_date)}</p>
                          <p className={`text-xs font-semibold ${isOverdue ? "text-red-600 dark:text-red-400" : isUrgent ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                            {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-orange-500" />
                        <div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">Assigned To</p>
                          <p className="font-semibold text-neutral-900 dark:text-white">{order.assignedTo?.first_name} {order.assignedTo?.last_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-orange-500" />
                        <div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">Items</p>
                          <p className="font-semibold text-neutral-900 dark:text-white">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-white/50 dark:bg-neutral-800/50 p-2 rounded italic border-l-2 border-orange-300">"{order.notes}"</p>}
                  </div>

                  {/* Expanded Items Section */}
                  {expandedOrderId === order.id && (
                    <div className="border-t border-neutral-300 dark:border-neutral-700 p-6 bg-white/30 dark:bg-neutral-800/30">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <Package size={18} />
                        Order Items
                      </h4>
                      <div className="space-y-3">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                              <div className="flex-1">
                                <p className="font-semibold text-neutral-900 dark:text-white">{item.service?.name || item.product?.name || item.description}</p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-neutral-900 dark:text-white">Qty: {item.quantity}</p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">₱{(item.unit_price).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-neutral-600 dark:text-neutral-400 text-center py-4">No items in this order</p>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
