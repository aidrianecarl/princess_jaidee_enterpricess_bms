"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, DollarSign, Package, Loader, Calendar, FileText, Check, Clock, Zap, CheckCircle2 } from "lucide-react"
import { getApiImageUrl } from "@/lib/api-urls"

interface OrderItem {
  id: number
  order_id: number
  quotation_items_id: number
  service_id: number | null
  quantity: number
  unit_price: number
  status?: string
  design_file_url?: string
  team_roster?: any
  size_specifications?: any
  notes?: any
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

const orderStatusSteps = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "processing", label: "Processing", icon: Zap },
  { key: "InProduction", label: "In Production", icon: Package },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
]

const getOrderStatusIndex = (status: string): number => {
  return orderStatusSteps.findIndex(step => step.key === status)
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

  const parseJSON = (value: any): any => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }

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
      let orderData = data.data || data
      
      // Fetch order items with their status - filter by order_id
      if (orderData.id) {
        try {
          const itemsResponse = await fetch(`${apiUrl}/order-items?order_id=${orderData.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          
          if (itemsResponse.ok) {
            const itemsData = await itemsResponse.json()
            let items = itemsData.data || itemsData
            
            // Ensure we're filtering by order_id in case API returns all items
            if (Array.isArray(items)) {
              items = items.filter((item: OrderItem) => item.order_id === orderData.id)
              
              orderData.items = items.map((item: OrderItem) => ({
                ...item,
                team_roster: parseJSON(item.team_roster),
                size_specifications: parseJSON(item.size_specifications),
                notes: parseJSON(item.notes),
              }))
            }
          }
        } catch (itemErr) {
          console.error("[v0] Error fetching order items:", itemErr)
        }
      }
      
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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">{order.order_number}</h1>
            <div className="flex gap-2 flex-wrap">
              <Badge className={statusColors[order.payment_status] || statusColors.pending}>
                {order.payment_status.toUpperCase()}
              </Badge>
              {order.order_status === 'completed' && (
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  READY TO PICKUP
                </Badge>
              )}
            </div>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">Order placed on {formatDate(order.order_date)}</p>

          {/* Order Status Timeline */}
          <Card className="p-6 border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-800 dark:to-neutral-900">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Order Status</h3>
            <div className="flex items-center justify-between">
              {orderStatusSteps.map((step, index) => {
                const currentIndex = getOrderStatusIndex(order.order_status || "pending")
                const isActive = index <= currentIndex
                const isCurrent = index === currentIndex
                const Icon = step.icon

                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                          isActive
                            ? isCurrent
                              ? "bg-orange-500 text-white scale-110 animate-pulse"
                              : "bg-green-500 text-white"
                            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                        }`}
                      >
                        {isActive && !isCurrent ? <Check size={24} /> : <Icon size={24} />}
                      </div>
                      {index < orderStatusSteps.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-2 transition-all duration-500 ${
                            index < currentIndex
                              ? "bg-green-500"
                              : "bg-neutral-200 dark:bg-neutral-700"
                          }`}
                        />
                      )}
                    </div>
                    <p className={`text-sm font-medium mt-2 text-center ${
                      isActive
                        ? isCurrent
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-green-600 dark:text-green-400"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}>
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
        {order.items && order.items.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Order Items</h2>
            
            {order.items.filter((item, index, arr) => arr.findIndex(t => t.id === item.id) === index).map((item) => {
              const teamRoster = Array.isArray(item.team_roster) ? item.team_roster : null
              const sizeSpecs = typeof item.size_specifications === 'object' ? item.size_specifications : null
              const statusColor = item.status === 'completed' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : item.status === 'InProduction'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                : item.status === 'processing'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'

              return (
                <div key={item.id} className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shadow-md hover:shadow-lg transition">
                  {/* Item Header */}
                  <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                          {item.service?.name || `Item #${item.id}`}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            Quantity: <span className="font-semibold text-neutral-900 dark:text-white">{item.quantity}</span>
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                            {(item.status || 'pending').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Total</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          ₱{(item.quantity * item.unit_price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Team Roster */}
                    {teamRoster && teamRoster.length > 0 && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-4 text-lg">Team Roster</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900/50">
                                <th className="px-4 py-3 text-left font-semibold text-blue-900 dark:text-blue-300">Player Name</th>
                                <th className="px-4 py-3 text-center font-semibold text-blue-900 dark:text-blue-300">Jersey #</th>
                                <th className="px-4 py-3 text-center font-semibold text-blue-900 dark:text-blue-300">Top Size</th>
                                <th className="px-4 py-3 text-center font-semibold text-blue-900 dark:text-blue-300">Bottom Size</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teamRoster.map((player: any, idx: number) => (
                                <tr key={idx} className="border-b border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
                                  <td className="px-4 py-3 text-neutral-900 dark:text-white font-medium">{player.name}</td>
                                  <td className="px-4 py-3 text-center text-neutral-900 dark:text-white font-semibold">#{player.number}</td>
                                  <td className="px-4 py-3 text-center text-neutral-900 dark:text-white">{player.sizeTop || '—'}</td>
                                  <td className="px-4 py-3 text-center text-neutral-900 dark:text-white">{player.sizeBottom || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Size Specifications */}
                    {sizeSpecs && Object.keys(sizeSpecs).length > 0 && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-4 text-lg">
                          {item.service?.name?.includes('Tarpaulin') ? 'Tarpaulin Size Specification' : 'Uniform Size'}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {sizeSpecs.width && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Width</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.width} ft</p>
                            </div>
                          )}
                          {sizeSpecs.height && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Height</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.height} ft</p>
                            </div>
                          )}
                          {sizeSpecs.totalSqft && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Total Sq Ft</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.totalSqft} sq ft</p>
                            </div>
                          )}
                          {sizeSpecs.top && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Top Size</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.top}</p>
                            </div>
                          )}
                          {sizeSpecs.bottom && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Bottom Size</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.bottom}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Design Preview */}
                    {item.design_file_url && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                        <h4 className="font-bold text-gray-900 dark:text-gray-300 mb-4 text-lg">Design Preview</h4>
                        <div className="relative w-full h-64 md:h-80 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                          <img 
                            src={getApiImageUrl(item.design_file_url)} 
                            alt="Design preview" 
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.error("[v0] Image failed to load:", item.design_file_url)
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E"
                            }}
                            className="w-full h-full object-contain p-4"
                          />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          <span className="font-semibold">File:</span> {item.design_file_url?.split('/').pop() || 'Unknown'}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && typeof item.notes === 'object' && Object.keys(item.notes).length > 0 && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-4 text-lg">Notes</h4>
                        <div className="space-y-3">
                          {item.notes.designNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Design Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.designNotes}</p>
                            </div>
                          )}
                          {item.notes.sizeNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Size Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.sizeNotes}</p>
                            </div>
                          )}
                          {item.notes.teamNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Team Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.teamNotes}</p>
                            </div>
                          )}
                          {item.notes.additionalNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Additional Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.additionalNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

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
