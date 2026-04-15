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
  remaining_balance: number
  notes: string | null
  created_at: string
  items?: OrderItem[]
}

const statusColors: Record<string, string> = {
  unpaid: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  paid: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  partial: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
}

// Order Progress Bar Component (same style as admin)
function OrderProgressBar({ items }: { items: OrderItem[] }) {
  const completedCount = items?.filter(item => item.status === 'completed').length || 0
  const totalCount = items?.length || 0
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const getStatusLabel = () => {
    if (progress === 0) return 'Pending'
    if (progress === 100) return 'Completed'
    return 'In Production'
  }

  const getStepClass = (step: 'pending' | 'inProduction' | 'completed') => {
    if (step === 'pending') return progress >= 0
    if (step === 'inProduction') return progress > 0
    if (step === 'completed') return progress === 100
    return false
  }

  const getCircleClass = (step: 'pending' | 'inProduction' | 'completed') => {
    const baseClass = 'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500'
    
    if (step === 'pending') {
      if (progress === 0) {
        return `${baseClass} bg-yellow-500 text-white ring-4 ring-yellow-200 dark:ring-yellow-900/50 animate-pulse`
      }
      return `${baseClass} bg-green-500 text-white`
    }
    
    if (step === 'inProduction') {
      if (progress > 0 && progress < 100) {
        return `${baseClass} bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900/50 animate-pulse`
      }
      if (progress === 100) {
        return `${baseClass} bg-green-500 text-white`
      }
      return `${baseClass} bg-neutral-300 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400`
    }
    
    if (step === 'completed') {
      if (progress === 100) {
        return `${baseClass} bg-green-500 text-white ring-4 ring-green-200 dark:ring-green-900/50`
      }
      return `${baseClass} bg-neutral-300 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400`
    }
    
    return baseClass
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">
          Order Progress
        </h3>
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {getStatusLabel()} ({Math.round(progress)}%)
        </span>
      </div>
      
      {/* Progress Steps */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-5 md:top-6 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-700 mx-5 md:mx-6" />
        
        {/* Progress Line */}
        <div 
          className="absolute top-5 md:top-6 left-0 h-1 bg-gradient-to-r from-yellow-500 via-blue-500 to-green-500 mx-5 md:mx-6 transition-all duration-700 ease-out"
          style={{ width: `calc(${Math.min(progress, 100)}% - 40px)` }}
        />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {/* Pending Step */}
          <div className="flex flex-col items-center z-10">
            <div className={getCircleClass('pending')}>
              {progress > 0 ? <Check size={20} /> : <Clock size={20} />}
            </div>
            <span className="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Pending
            </span>
          </div>
          
          {/* In Production Step */}
          <div className="flex flex-col items-center z-10">
            <div className={getCircleClass('inProduction')}>
              {progress === 100 ? <Check size={20} /> : <Zap size={20} />}
            </div>
            <span className="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              In Production
            </span>
          </div>
          
          {/* Completed Step */}
          <div className="flex flex-col items-center z-10">
            <div className={getCircleClass('completed')}>
              <CheckCircle2 size={20} />
            </div>
            <span className="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* Items Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-500 mb-1">
          <span>Items Completed</span>
          <span>{completedCount} / {totalCount}</span>
        </div>
        <div className="relative h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
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
      
      console.log("[v0] OrderDetail - Fetching from:", apiUrl)
      console.log("[v0] OrderDetail - Order ID:", params.id)
      console.log("[v0] OrderDetail - Auth token:", token ? "Present" : "Missing")
      
      const response = await fetch(`${apiUrl}/orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] OrderDetail - Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] OrderDetail - Error response:", errorText)
        throw new Error(`Failed to fetch order details: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] OrderDetail - Order data:", data)
      
      let orderData = data.data || data
      
      // Fetch order items with their status
      if (orderData.id) {
        try {
          const itemsResponse = await fetch(`${apiUrl}/order-items?order_id=${orderData.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          
          console.log("[v0] OrderDetail - Items response status:", itemsResponse.status)
          
          if (itemsResponse.ok) {
            const itemsData = await itemsResponse.json()
            console.log("[v0] OrderDetail - Items data:", itemsData)
            
            let items = itemsData.data || itemsData
            
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
      console.error("[v0] Error details:", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      })
      setError(err instanceof Error ? err.message : "Failed to load order details")
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <DashboardHeader user={user} />
        <main className="pt-14 sm:pt-16 md:ml-64 flex justify-center items-center min-h-screen">
          <div className="text-center animate-fade-in">
            <Loader className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
            <p className="text-neutral-600 dark:text-neutral-400">Loading order details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <DashboardHeader user={user} />
        <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
          <Button onClick={() => router.back()} className="mb-6" variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div className="text-center py-12 animate-fade-in">
            <p className="text-red-600 dark:text-red-400">{error || "Order not found"}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <DashboardHeader user={user} />

      <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button onClick={() => router.back()} className="mb-6 animate-fade-in" variant="outline">
          <ArrowLeft size={16} className="mr-2" />
          Back to Orders
        </Button>

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h1 className="text-2xl md:text-4xl font-bold text-neutral-900 dark:text-white">{order.order_number}</h1>
            <div className="flex gap-2 flex-wrap">
              <Badge className={statusColors[order.payment_status] || statusColors.pending}>
                {order.payment_status?.toUpperCase()}
              </Badge>
              {order.order_status === 'completed' && (
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                  READY TO PICKUP
                </Badge>
              )}
            </div>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">Order placed on {formatDate(order.order_date)}</p>

          {/* Order Progress Bar */}
          <Card className="p-6 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <OrderProgressBar items={order.items || []} />
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium uppercase tracking-wide">Subtotal</p>
                <p className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  ₱{order.subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Package className="text-neutral-500" size={20} />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium uppercase tracking-wide">Discount</p>
                <p className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  ₱{order.discount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="text-blue-500" size={20} />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium uppercase tracking-wide">Remaining Balance</p>
                <p className={`text-xl md:text-2xl font-bold mt-1 ${(order.remaining_balance || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  ₱{(order.remaining_balance || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(order.remaining_balance || 0) > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <DollarSign className={(order.remaining_balance || 0) > 0 ? 'text-red-500' : 'text-green-500'} size={20} />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium uppercase tracking-wide">Total</p>
                <p className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  ₱{order.total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-900/50 flex items-center justify-center">
                <DollarSign className="text-orange-600" size={20} />
              </div>
            </div>
          </Card>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white animate-fade-in">Order Items</h2>
            
            {order.items.filter((item, index, arr) => arr.findIndex(t => t.id === item.id) === index).map((item, index) => {
              const teamRoster = Array.isArray(item.team_roster) ? item.team_roster : null
              const sizeSpecs = typeof item.size_specifications === 'object' ? item.size_specifications : null
              const statusColor = item.status === 'completed' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : item.status === 'InProduction' || item.status === 'ongoing'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'

              return (
                <Card 
                  key={item.id} 
                  className="overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${350 + index * 100}ms` }}
                >
                  {/* Item Header */}
                  <div className="p-5 md:p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white mb-2">
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
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Total</p>
                        <p className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">
                          ₱{(item.quantity * item.unit_price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6 space-y-6">
                    {/* Team Roster */}
                    {teamRoster && teamRoster.length > 0 && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
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
                                  <td className="px-4 py-3 text-center text-neutral-900 dark:text-white">{player.sizeTop || '-'}</td>
                                  <td className="px-4 py-3 text-center text-neutral-900 dark:text-white">{player.sizeBottom || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Size Specifications */}
                    {sizeSpecs && Object.keys(sizeSpecs).length > 0 && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                        <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-4 text-lg">
                          {item.service?.name?.includes('Tarpaulin') ? 'Tarpaulin Size Specification' : 'Size Specification'}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {sizeSpecs.width && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Width</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.width} ft</p>
                            </div>
                          )}
                          {sizeSpecs.height && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Height</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.height} ft</p>
                            </div>
                          )}
                          {sizeSpecs.totalSqft && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Total Sq Ft</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.totalSqft} sq ft</p>
                            </div>
                          )}
                          {sizeSpecs.top && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Top Size</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.top}</p>
                            </div>
                          )}
                          {sizeSpecs.bottom && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Bottom Size</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.bottom}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Design Preview */}
                    {item.design_file_url && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-gray-200 dark:border-gray-800">
                        <h4 className="font-bold text-gray-900 dark:text-gray-300 mb-4 text-lg">Design Preview</h4>
                        <div className="relative w-full h-64 md:h-80 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                          <img 
                            src={getApiImageUrl(item.design_file_url)} 
                            alt="Design preview" 
                            crossOrigin="anonymous"
                            onError={(e) => {
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
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-4 text-lg">Notes</h4>
                        <div className="space-y-3">
                          {item.notes.designNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Design Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.designNotes}</p>
                            </div>
                          )}
                          {item.notes.sizeNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Size Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.sizeNotes}</p>
                            </div>
                          )}
                          {item.notes.teamNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Team Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.teamNotes}</p>
                            </div>
                          )}
                          {item.notes.additionalNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Additional Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.additionalNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <Card className="p-5 md:p-6 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-orange-500" />
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

          <Card className="p-5 md:p-6 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-orange-500" />
              Additional Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Total Services</p>
                <p className="text-neutral-900 dark:text-white mt-1">{order.items?.length || 0} service(s)</p>
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

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
