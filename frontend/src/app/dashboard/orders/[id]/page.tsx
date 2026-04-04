"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, DollarSign, Package, Loader, Calendar, FileText } from "lucide-react"

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

const statusColors: Record<string, string> = {
  unpaid: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  paid: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
}

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    if (user && params.id) {
      fetchOrderDetails()
    }
  }, [user, params.id])

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")

      if (!token) {
        router.push("/")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"
      const response = await fetch(`${apiUrl}/orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch order details")
      }

      const data = await response.json()
      const orderData = data.data || data
      setOrder(orderData)
    } catch (err) {
      console.error("[v0] Error fetching order:", err)
      setError("Failed to load order details")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <DashboardHeader user={user} />
        <main className="pt-14 sm:pt-16 md:ml-64 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <Loader className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
            <p className="text-neutral-600 dark:text-neutral-400">Loading order details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <DashboardHeader user={user} />
        <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
          <Button onClick={() => router.back()} className="mb-6" variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error || "Order not found"}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <DashboardHeader user={user} />

      <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button onClick={() => router.back()} className="mb-6" variant="outline">
          <ArrowLeft size={16} className="mr-2" />
          Back to Orders
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">{order.order_number}</h1>
            <Badge className={statusColors[order.payment_status] || statusColors.pending}>
              {order.payment_status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Order placed on {formatDate(order.order_date)}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Subtotal</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
                  ₱{order.subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Package className="text-orange-500" size={32} />
            </div>
          </Card>

          <Card className="p-6 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Discount</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
                  ₱{order.discount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="text-blue-500" size={32} />
            </div>
          </Card>

          <Card className="p-6 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Tax</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
                  ₱{order.tax.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <FileText className="text-green-500" size={32} />
            </div>
          </Card>

          <Card className="p-6 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">Total</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  ₱{order.total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="text-orange-500" size={32} />
            </div>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="border-neutral-200 dark:border-neutral-800 mb-8">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Package size={24} className="text-orange-500" />
              Order Items
            </h2>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {item.service?.name || `Item #${item.id}`}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        ₱{(item.unit_price * item.quantity).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        ₱{item.unit_price.toLocaleString("en-PH", { minimumFractionDigits: 2 })} each
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-neutral-600 dark:text-neutral-400">
                No items in this order
              </div>
            )}
          </div>
        </Card>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-neutral-200 dark:border-neutral-800">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Order Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Order Date</p>
                <p className="text-neutral-900 dark:text-white mt-1">{formatDate(order.order_date)}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Payment Status</p>
                <Badge className={`mt-1 ${statusColors[order.payment_status] || statusColors.pending}`}>
                  {order.payment_status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Payment Method</p>
                <p className="text-neutral-900 dark:text-white mt-1 capitalize">
                  {order.payment_method || "Not specified"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-neutral-200 dark:border-neutral-800">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={20} />
              Additional Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Items</p>
                <p className="text-neutral-900 dark:text-white mt-1">{order.items?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Notes</p>
                <p className="text-neutral-900 dark:text-white mt-1">
                  {order.notes || "No additional notes"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
