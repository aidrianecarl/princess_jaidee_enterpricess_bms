"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, Calendar, Eye, DollarSign, FileText, Loader, Eye as EyeIcon } from "lucide-react"

interface OrderItem {
  id: number
  order_id: number
  quotation_items_id: number
  service_id: number | null
  quantity: number
  unit_price: number
  service?: { id: number; name: string }
}

interface Order {
  id: number
  order_number: string
  quotation_id: number
  customer_id: number
  order_date: string
  subtotal: number
  discount: number
  tax: number
  total: number
  payment_status: string
  order_status: string
  payment_method: string | null
  notes: string | null
  created_at: string
  items?: OrderItem[]
}

const statusColors: Record<string, { badge: string; text: string }> = {
  pending: { badge: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200", text: "text-yellow-700" },
  paid: { badge: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200", text: "text-green-700" },
  unpaid: { badge: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200", text: "text-red-700" },
  completed: { badge: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200", text: "text-blue-700" },
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchMyOrders()
    }
  }, [user])

  const fetchMyOrders = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")

      if (!token || !user) {
        router.push("/")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

      // Fetch all orders and filter by created user (current logged in user)
      const response = await fetch(`${apiUrl}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`)
      }

      const data = await response.json()
      const ordersData = data.data || data
      setOrders(Array.isArray(ordersData) ? ordersData : [])
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
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <DashboardHeader user={user} />

      <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">My Orders</h1>
          <p className="text-neutral-600 dark:text-neutral-400">View and track your orders</p>
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
              <Loader className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
              <p className="text-neutral-600 dark:text-neutral-400">Loading your orders...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600 mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No orders yet</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">You don&apos;t have any orders yet.</p>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div className="grid gap-4 md:gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{order.order_number}</h3>
                        <Badge className={statusColors[order.payment_status]?.badge || statusColors.unpaid.badge}>
                          {order.payment_status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Order Date: {formatDate(order.order_date)}</p>
                    </div>
                    <Button
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <EyeIcon size={16} className="mr-2" />
                      View Details
                    </Button>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Subtotal</p>
                      <p className="font-semibold text-neutral-900 dark:text-white">₱{order.subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Items</p>
                      <p className="font-semibold text-neutral-900 dark:text-white">{order.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Tax</p>
                      <p className="font-semibold text-neutral-900 dark:text-white">₱{order.tax.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                      <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">Total</p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">₱{order.total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
