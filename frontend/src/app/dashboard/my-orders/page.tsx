"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Loader, Eye as EyeIcon, Package, DollarSign, Clock, Zap, CheckCircle2, Check } from "lucide-react"

interface OrderItem {
  id: number
  order_id: number
  quotation_items_id: number
  service_id: number | null
  quantity: number
  unit_price: number
  status?: string
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
  job_order?: {
    id: number
    status: string
    released_date?: string
  }
}

const statusColors: Record<string, { badge: string; text: string }> = {
  pending: { badge: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300", text: "text-yellow-700" },
  paid: { badge: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300", text: "text-green-700" },
  partial: { badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", text: "text-blue-700" },
  unpaid: { badge: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300", text: "text-red-700" },
  completed: { badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300", text: "text-emerald-700" },
}

const orderStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
  InProduction: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  " InProduction": "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  completed: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
}

// Mini Progress Bar Component for Order Cards
function MiniOrderProgressBar({ items }: { items: OrderItem[] }) {
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

  return (
    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Order Progress</span>
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-500">
          {getStatusLabel()} ({Math.round(progress)}%)
        </span>
      </div>
      
      {/* Progress Steps */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-neutral-200 dark:bg-neutral-700 mx-3" />
        
        {/* Progress Line */}
        <div 
          className="absolute top-3 left-0 h-0.5 bg-gradient-to-r from-yellow-500 via-blue-500 to-green-500 mx-3 transition-all duration-700 ease-out"
          style={{ width: `calc(${Math.min(progress, 100)}% - 24px)` }}
        />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {/* Pending */}
          <div className="flex flex-col items-center z-10">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
              getStepClass('pending') && progress > 0
                ? 'bg-green-500 text-white'
                : progress === 0
                ? 'bg-yellow-500 text-white ring-2 ring-yellow-200 dark:ring-yellow-900/50 animate-pulse'
                : 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500'
            }`}>
              {progress > 0 ? <Check size={12} /> : <Clock size={12} />}
            </div>
            <span className="mt-1 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">Pending</span>
          </div>
          
          {/* In Production */}
          <div className="flex flex-col items-center z-10">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
              progress === 100
                ? 'bg-green-500 text-white'
                : progress > 0 && progress < 100
                ? 'bg-blue-500 text-white ring-2 ring-blue-200 dark:ring-blue-900/50 animate-pulse'
                : 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500'
            }`}>
              {progress === 100 ? <Check size={12} /> : <Zap size={12} />}
            </div>
            <span className="mt-1 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">In Production</span>
          </div>
          
          {/* Completed */}
          <div className="flex flex-col items-center z-10">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
              progress === 100
                ? 'bg-green-500 text-white ring-2 ring-green-200 dark:ring-green-900/50'
                : 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500'
            }`}>
              <CheckCircle2 size={12} />
            </div>
            <span className="mt-1 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">Completed</span>
          </div>
        </div>
      </div>

      {/* Items Progress */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-neutral-500 dark:text-neutral-500 mb-1">
          <span>Items Completed</span>
          <span>{completedCount} / {totalCount}</span>
        </div>
        <div className="relative h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      setError("")
      const token = localStorage.getItem("auth_token")

      if (!token || !user) {
        router.push("/")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      
      console.log("[v0] MyOrders - Fetching from:", apiUrl)
      console.log("[v0] MyOrders - Auth token:", token ? "Present" : "Missing")

      const response = await fetch(`${apiUrl}/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("[v0] MyOrders - Response status:", response.status)
      console.log("[v0] MyOrders - Response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] MyOrders - Error response text:", errorText)
        
        if (response.status === 401) {
          console.log("[v0] MyOrders - Unauthorized, redirecting to home")
          router.push("/")
          return
        }
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] MyOrders - Response data:", data)
      
      const ordersData = data.data || data
      
      if (Array.isArray(ordersData)) {
        console.log("[v0] MyOrders - Orders loaded:", ordersData.length)
        setOrders(ordersData)
      } else {
        console.warn("[v0] MyOrders - Data is not an array:", ordersData)
        setOrders([])
      }
    } catch (err) {
      console.error("[v0] MyOrders - Error fetching orders:", err)
      console.error("[v0] MyOrders - Error details:", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      })
      setError(err instanceof Error ? err.message : "Failed to load orders")
      setOrders([])
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

  const getOrderStatusLabel = (status: string) => {
    if (!status) return 'Pending'
    const normalized = status.trim().toLowerCase()
    if (normalized === 'inproduction') return 'In Production'
    return status.charAt(0).toUpperCase() + status.slice(1).trim()
  }

  const getTotalItemsCount = (items?: OrderItem[]) => {
    if (!items || items.length === 0) return 0
    return items.reduce((acc, item) => acc + (item.quantity || 1), 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <DashboardHeader user={user} />

      <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">My Orders</h1>
          <p className="text-neutral-600 dark:text-neutral-400">View and track your orders</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl animate-fade-in">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center animate-fade-in">
              <Loader className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
              <p className="text-neutral-600 dark:text-neutral-400">Loading your orders...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <FileText className="h-10 w-10 text-neutral-400 dark:text-neutral-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No orders yet</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">You don&apos;t have any orders yet.</p>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div className="grid gap-5 md:gap-6">
            {orders.map((order, index) => (
              <Card 
                key={order.id} 
                className="overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-5 md:p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white truncate">{order.order_number}</h3>
                        <Badge className={orderStatusColors[order.order_status] || orderStatusColors.pending}>
                          {getOrderStatusLabel(order.order_status)}
                        </Badge>
                        {order.order_status === 'completed' && order.job_order?.released_date ? (
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-bold">
                            ✓ Released
                          </Badge>
                        ) : order.order_status === 'completed' ? (
                          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-bold animate-pulse">
                            📦 Ready to Pickup
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Calendar size={14} />
                        <span>{formatDate(order.order_date)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                      className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/25 transition-all duration-300 flex-shrink-0"
                      size="sm"
                    >
                      <EyeIcon size={16} className="mr-1.5" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <Package size={14} className="text-neutral-500" />
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Services</p>
                      </div>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'service' : 'services'}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        {getTotalItemsCount(order.items)} total items
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={14} className="text-red-500" />
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Remaining Balance</p>
                      </div>
                      <p className={`font-bold ${(order.remaining_balance || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        ₱{(order.remaining_balance || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        {order.payment_status === 'paid' ? 'Fully Paid' : order.payment_status === 'partial' ? 'Partially Paid' : 'Unpaid'}
                      </p>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1 p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-100 dark:border-orange-900/30 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={14} className="text-orange-500" />
                        <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">Total Amount</p>
                      </div>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        ₱{order.total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <MiniOrderProgressBar items={order.items || []} />
                </div>
              </Card>
            ))}
          </div>
        )}
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
