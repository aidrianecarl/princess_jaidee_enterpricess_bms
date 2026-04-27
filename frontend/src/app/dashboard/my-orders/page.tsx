"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Loader, Eye as EyeIcon, Package, DollarSign, Clock, Zap, CheckCircle2, Check, Search, ChevronLeft, ChevronRight, Download, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { generateQuotationPDF } from "@/lib/pdf-generator"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

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

interface JobOrder {
  id: number
  status: string
  released_date?: string
  released_by?: string
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
  branch_id?: number
  branch?: {
    id: number
    branch_name: string
  }
  quotation?: any
  items?: OrderItem[]
  job_order?: JobOrder
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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "orders" | "history">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10
  const router = useRouter()
  const { toast } = useToast()

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

  // Filter orders by search term and filter type
  useEffect(() => {
    let filtered = orders.filter(order =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Apply filter type logic
    if (filterType === "orders") {
      // Only show orders that are NOT released (job_order status is not released)
      filtered = filtered.filter(order => 
        !order.job_order?.released_date || order.order_status !== 'completed'
      )
    } else if (filterType === "history") {
      // Only show released orders (job_order is released)
      filtered = filtered.filter(order => 
        order.job_order?.released_date && order.order_status === 'completed'
      )
    }
    // if filterType === "all", show everything

    setFilteredOrders(filtered)
    setCurrentPage(1) // Reset to first page when searching
  }, [searchTerm, orders, filterType])

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
      
      const response = await fetch(`${apiUrl}/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/")
          return
        }
        throw new Error(`Failed to fetch orders: ${response.status}`)
      }

      const data = await response.json()
      const ordersData = data.data || data
      
      if (Array.isArray(ordersData)) {
        setOrders(ordersData)
        setFilteredOrders(ordersData)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error("[v0] Error fetching orders:", err)
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

  const getOrderStatusLabel = (order: Order) => {
    // Check if order is completed and has released info
    if (order.order_status === 'completed' && order.job_order?.released_date && order.job_order?.released_by) {
      return 'Released'
    }
    // Show "Ready to Pickup" for completed orders that haven't been released yet
    if (order.order_status === 'completed' && (!order.job_order?.released_date || !order.job_order?.released_by)) {
      return 'Ready to Pickup'
    }
    if (!order.order_status) return 'Pending'
    const normalized = order.order_status.trim().toLowerCase()
    if (normalized === 'inproduction') return 'In Production'
    return order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1).trim()
  }

  const getOrderStatusBadge = (order: Order) => {
    if (order.order_status === 'completed' && order.job_order?.released_date && order.job_order?.released_by) {
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
    }
    if (order.order_status === 'completed' && (!order.job_order?.released_date || !order.job_order?.released_by)) {
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
    }
    return orderStatusColors[order.order_status] || orderStatusColors.pending
  }

  const getTotalItemsCount = (items?: OrderItem[]) => {
    if (!items || items.length === 0) return 0
    return items.reduce((acc, item) => acc + (item.quantity || 1), 0)
  }

  const handleDownloadPDF = async (data: any) => {
      try {
        console.log("[v0] PDF Download - Starting for quotation/order ID:", data.id)
  
        // If it's an order (has quotation_id), get the quotation ID; otherwise use id
        const quotationId = data.quotation_id || data.id
        
        const response = await apiClient.admin().get(`/admin/quotations/${quotationId}`)
        console.log("[v0] PDF Download - API response received:", response)
  
        const quotationData = response.data.data || response.data
        console.log("[v0] PDF Download - Quotation data:", quotationData)
  
        if (!quotationData) {
          throw new Error("No quotation data received from API")
        }
  
        // Generate PDF with quotation data
        console.log("[v0] PDF Download - Calling generateQuotationPDF")
        generateQuotationPDF(quotationData)
        console.log("[v0] PDF Download - PDF generated successfully")
  
        toast({
          title: "Success",
          description: `Quotation ${quotationData.quotation_number || quotationData.number || "PDF"} downloaded successfully`,
          variant: "default"
        })
      } catch (error: any) {
        console.error("[v0] PDF Download - Error occurred:", error)
        const errorMessage = error?.response?.data?.error || error?.message || "Failed to download quotation"
        console.log("[v0] PDF Download - Error message:", errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    }

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <DashboardHeader user={user} />

      <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">My Orders</h1>
          <p className="text-neutral-600 dark:text-neutral-400">View and track your orders</p>
        </div>

        {/* Search Bar and Filters */}
        <div className="mb-6 space-y-4 animate-fade-in">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-600" size={20} />
            <Input
              type="text"
              placeholder="Search by order number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === "all"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilterType("orders")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === "orders"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setFilterType("history")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === "history"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              Order History
            </button>
          </div>
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
        {!isLoading && filteredOrders.length === 0 && orders.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <FileText className="h-10 w-10 text-neutral-400 dark:text-neutral-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No orders yet</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">You don&apos;t have any orders yet.</p>
          </div>
        )}

        {/* No search results */}
        {!isLoading && searchTerm && filteredOrders.length === 0 && orders.length > 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Search className="h-10 w-10 text-neutral-400 dark:text-neutral-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No orders found</h3>
            <p className="text-neutral-600 dark:text-neutral-400">No orders match &quot;{searchTerm}&quot;</p>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && paginatedOrders.length > 0 && (
          <>
            <div className="grid gap-5 md:gap-6">
              {paginatedOrders.map((order, index) => (
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
                          <Badge className={getOrderStatusBadge(order)}>
                            {getOrderStatusLabel(order)}
                          </Badge>
                          {order.branch?.branch_name && (
                            <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                              {order.branch.branch_name}
                            </Badge>
                          )}
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
                      <button
                            onClick={() => handleDownloadPDF(order)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition text-sm font-medium hover:scale-105 active:scale-95"
                          >
                            <Download size={16} />
                            Statement
                          </button>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
                      
                      <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 size={14} className="text-indigo-500" />
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Branch</p>
                        </div>
                        <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                          {order.branch?.branch_name || 'N/A'}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                          Pick-up location
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign size={14} className="text-red-500" />
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Remaining</p>
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

                    {/* Release Date and Progress Bar */}
                    {order.job_order?.released_date && (
                      <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={14} className="text-purple-600" />
                          <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">Release Date</p>
                        </div>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {formatDate(order.job_order.released_date)}
                        </p>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <MiniOrderProgressBar items={order.items || []} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Showing {startIndex + 1}-{Math.min(startIndex + ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  
                  {/* Page indicators */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={`${currentPage === page ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
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
