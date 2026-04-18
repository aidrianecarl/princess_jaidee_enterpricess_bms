"use client"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { SetPaymentModal } from "@/components/admin/modals/set-payment-modal"
import { UpdatePaymentModal } from "@/components/admin/modals/update-payment-modal"
import { ViewItemsModal } from "@/components/admin/modals/view-items-modal"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, MapPin, DollarSign, Users, Loader2, CheckCircle, Clock, Eye, Settings, Search, X, Calendar, CheckCircle2, Package, Building2, CreditCard, User, TrendingDown } from "lucide-react"
import { OrderProgressBar } from "@/components/order/order-progress-bar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"

interface SentQuotation {
  id: number
  quotation_number: string
  total: number
  status: string
  created_at: string
  created_by?: number
  branch_id?: number
  creator?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  customer: {
    name: string
    email: string
    phone: string
  }
  branch?: {
    id: number
    name: string
    location?: string
  }
  items?: any[]
}

interface Order {
  id: number
  order_number: string
  quotation_id: number
  customer_id: number
  created_by: number
  branch_id?: number
  order_date: string
  subtotal: number
  discount: number
  total: number
  payment_status: string
  order_status: string
  payment_method: string
  remaining_balance: number
  customer?: {
    id?: number
    bill_to_name?: string
    bill_to_email?: string
    bill_to_phone?: string
    name?: string // fallback
    email?: string
    phone?: string
  }
  quotation?: any
  branch?: {
    id: number
    name: string
    location?: string
  }
  completed_date?: string
  released_date?: string
  released_by?: number
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  user_type: string
}

interface JobOrder {
  id: number
  job_order_number: string
  order_id: number
  status: 'pending' | 'InProduction' | 'completed' | 'cancelled'
  start_date: string
  due_date: string
  completed_date?: string
  released_date?: string
  released_by?: number
  is_priority?: number | boolean
  notes?: string
  customer?: {
    bill_to_name: string
    bill_to_email: string
    bill_to_phone?: string
  }
  assigned_to?: number | {id: number; first_name: string; last_name: string; email: string}
  assignedTo?: {
    id?: number
    first_name: string
    last_name: string
    email: string
  }
  branch?: {
    id: number
    name: string
    location?: string
  }
  order?: {
    id: number
    order_status: string
    payment_status: string
    items?: any[]
    branch?: {
      id: number
      name: string
      location?: string
    }
  }
}

export default function OrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [sentQuotations, setSentQuotations] = useState<SentQuotation[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [jobOrdersStats, setJobOrdersStats] = useState<{[key: number]: {completed: number; total: number}}>({})
  const [employees, setEmployees] = useState<Employee[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const [selectedQuotation, setSelectedQuotation] = useState<SentQuotation | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [updatePaymentModalOpen, setUpdatePaymentModalOpen] = useState(false)
  const [viewItemsModalOpen, setViewItemsModalOpen] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"pending" | "sales" | "partial" | "paid" | "completed" | "released">("pending")
  const [currentPage, setCurrentPage] = useState(1)
  const [isReleasing, setIsReleasing] = useState<number | null>(null)
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false)
  const [releaseOrderId, setReleaseOrderId] = useState<number | null>(null)
  const itemsPerPage = 6

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin")
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        await fetchEmployees(token)
        await fetchSentQuotations(token)
        await fetchAllOrders(token)
        await fetchJobOrders(token)
      } catch (err) {
        console.error("[v0] Error loading data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const fetchEmployees = async (token: string) => {
    try {
      const response = await fetch(`${apiUrl}/users/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch employees")

      const data = await response.json()
      setEmployees(data.data || data)
    } catch (err) {
      console.error("[v0] Error fetching employees:", err)
    }
  }

  const fetchSentQuotations = async (token: string) => {
    try {
      console.log("[v0] === FETCHING QUOTATIONS START ===")
      
      // Use the existing adminIndex endpoint with status filter
      const url = `${apiUrl}/admin/quotations?status=sent`
      console.log("[v0] Fetching from URL:", url)
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] Response status:", response.status, response.statusText)

      if (!response.ok) {
        console.warn("[v0] Failed to fetch sent quotations, HTTP status:", response.status)
        setSentQuotations([])
        return
      }

      const data = await response.json()
      console.log("[v0] Raw API response:", data)
      console.log("[v0] Response is array?", Array.isArray(data))
      
      // The adminIndex returns an array directly, not wrapped in data property
      const quotations = Array.isArray(data) ? data : (data.data || [])
      console.log("[v0] Parsed quotations count:", quotations.length)
      
      quotations.forEach((q, index) => {
        console.log(`[v0] Quotation #${index}:`, {
          id: q.id,
          number: q.quotation_number,
          branch_id: q.branch_id,
          has_branch_object: !!q.branch,
          branch: q.branch,
          total: q.total
        })
      })
      
      console.log("[v0] Setting state with", quotations.length, "quotations")
      setSentQuotations(quotations)
      console.log("[v0] === FETCHING QUOTATIONS END ===")
    } catch (err) {
      console.error("[v0] Error fetching quotations:", err)
      console.error("[v0] Error stack:", err instanceof Error ? err.stack : "")
      setSentQuotations([])
    }
  }

  const fetchAllOrders = async (token: string) => {
    try {
      console.log("[v0] === FETCHING ALL ORDERS START ===")
      
      const url = `${apiUrl}/admin/orders`
      console.log("[v0] Fetching from URL:", url)
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] Orders response status:", response.status, response.statusText)

      if (!response.ok) throw new Error("Failed to fetch orders")

      const data = await response.json()
      console.log("[v0] Raw orders data:", data)
      
      const orders = data.data || data
      console.log("[v0] Parsed orders count:", orders.length)
      
      orders.forEach((order: any, idx: number) => {
        console.log(`[v0] Order #${idx}:`, {
          id: order.id,
          number: order.order_number,
          branch_id: order.branch_id,
          has_branch_object: !!order.branch,
          branch: order.branch,
          payment_status: order.payment_status,
          remaining_balance: order.remaining_balance
        })
      })
      
      console.log("[v0] Setting state with", orders.length, "orders")
      setAllOrders(orders)
      console.log("[v0] === FETCHING ALL ORDERS END ===")
    } catch (err) {
      console.error("[v0] Error fetching orders:", err)
      console.error("[v0] Error stack:", err instanceof Error ? err.stack : "")
    }
  }

  const fetchJobOrders = async (token: string) => {
    try {
      console.log("[v0] === FETCHING JOB ORDERS START ===")
      
      const url = `${apiUrl}/admin/job-orders`
      console.log("[v0] Fetching from URL:", url)
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log("[v0] Job orders response status:", response.status, response.statusText)

      if (!response.ok) {
        console.error('[v0] Failed to fetch job orders - HTTP:', response.status)
        return
      }

      const data = await response.json()
      console.log("[v0] Raw job orders data:", data)
      
      const orders = data.data || data || []
      console.log("[v0] Parsed job orders count:", orders.length)
      
      orders.forEach((jobOrder: JobOrder, idx: number) => {
        console.log(`[v0] Job Order #${idx}:`, {
          id: jobOrder.id,
          number: jobOrder.job_order_number,
          status: jobOrder.status,
          has_order: !!jobOrder.order,
          order_id: jobOrder.order_id,
          branch_id: jobOrder.order?.branch_id,
          has_branch: !!jobOrder.order?.branch,
          branch: jobOrder.order?.branch
        })
      })
      
      console.log("[v0] Setting state with", orders.length, "job orders")
      setJobOrders(orders)
      
      orders.forEach((jobOrder: JobOrder) => {
        fetchJobOrderItems(jobOrder.id, token)
      })
      
      console.log("[v0] === FETCHING JOB ORDERS END ===")
    } catch (err) {
      console.error('[v0] Error fetching job orders:', err)
      console.error('[v0] Error stack:', err instanceof Error ? err.stack : "")
    }
  }

  const fetchJobOrderItems = async (jobOrderId: number, token: string) => {
    try {
      const response = await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}/orders`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) return

      const data = await response.json()
      const items = data.data || data || []
      
      const completed = items.filter((item: any) => item.status === 'completed').length
      setJobOrdersStats(prev => ({
        ...prev,
        [jobOrderId]: { completed, total: items.length }
      }))
    } catch (err) {
      console.error('[v0] Error fetching job order items:', err)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (e) {
      return dateString
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
      case 'inproduction':
        return 'px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
      case 'completed':
        return 'px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
      case 'released':
        return 'px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
      case 'partial':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      default:
        return 'px-3 py-1.5 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'inproduction':
        return 'In Production'
      case 'completed':
        return 'Completed'
      case 'released':
        return 'Released'
      default:
        return status || 'Unknown'
    }
  }

  const handleSaveOrder = async (paymentMethod: string, paymentStatus: string, remainingBalance: number) => {
    if (!selectedQuotation) {
      console.log("[v0] handleSaveOrder - No selectedQuotation")
      return
    }

    console.log("[v0] handleSaveOrder - Starting order creation", {
      quotationId: selectedQuotation.id,
      quotationNumber: selectedQuotation.quotation_number,
      paymentMethod,
      paymentStatus,
      remainingBalance
    })

    try {
      setSavingId(selectedQuotation.id)
      const token = localStorage.getItem("admin_token")

      const requestUrl = `${apiUrl}/admin/quotations/${selectedQuotation.id}/convert-to-order`
      console.log("[v0] handleSaveOrder - Request URL:", requestUrl)

      const requestBody = {
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        remaining_balance: remainingBalance,
      }
      console.log("[v0] handleSaveOrder - Request body:", requestBody)

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] handleSaveOrder - Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] handleSaveOrder - Error response:", errorData)
        throw new Error(errorData.message || errorData.error || "Failed to create order")
      }

      const successData = await response.json()
      console.log("[v0] handleSaveOrder - Success response:", successData)

      // Refresh the data after successful conversion
      const refreshToken = localStorage.getItem("admin_token")
      if (refreshToken) {
        await fetchSentQuotations(refreshToken)
        await fetchAllOrders(refreshToken)
        await fetchJobOrders(refreshToken)
      }

      setSentQuotations(sentQuotations.filter(q => q.id !== selectedQuotation.id))
      setSelectedQuotation(null)
      setPaymentModalOpen(false)
      setError("")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create order"
      console.error("[v0] handleSaveOrder - Error:", errorMsg)
      setError(errorMsg)
    } finally {
      setSavingId(null)
    }
  }

  const handleUpdatePaymentStatus = async (paymentStatus: "paid", remainingBalance: number) => {
    if (!selectedOrder) return

    try {
      setSavingId(selectedOrder.id)
      const token = localStorage.getItem("admin_token")

      const response = await fetch(
        `${apiUrl}/admin/orders/${selectedOrder.id}/payment-status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_status: paymentStatus,
            remaining_balance: remainingBalance,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update payment status")
      }

      setAllOrders(
        allOrders.map(order =>
          order.id === selectedOrder.id
            ? { ...order, payment_status: paymentStatus, remaining_balance: remainingBalance }
            : order
        )
      )

      setSelectedOrder(null)
      setUpdatePaymentModalOpen(false)
      setError("")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update payment status"
      setError(errorMsg)
    } finally {
      setSavingId(null)
    }
  }

  const handleReleaseConfirm = (orderId: number) => {
    setReleaseOrderId(orderId)
    setReleaseConfirmOpen(true)
  }

  const handleReleaseOrder = async () => {
    if (!releaseOrderId) return
    
    const token = localStorage.getItem("admin_token")
    if (!token) return

    try {
      setIsReleasing(releaseOrderId)
      
      const response = await fetch(`${apiUrl}/admin/job-orders/${releaseOrderId}/release`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setJobOrders(
          jobOrders.map(jo =>
            jo.id === releaseOrderId
              ? { ...jo, released_date: new Date().toISOString() }
              : jo
          )
        )
        setReleaseConfirmOpen(false)
        setError("")
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to release order')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release order')
    } finally {
      setIsReleasing(null)
    }
  }

  const displayData = useMemo(() => {
    console.log("[v0] === DISPLAYDATA CALCULATION START ===")
    console.log("[v0] filterStatus:", filterStatus)
    console.log("[v0] sentQuotations count:", sentQuotations.length)
    console.log("[v0] sentQuotations data:", sentQuotations)
    
    let filtered: any[] = []

    if (filterStatus === "pending") {
      console.log("[v0] Using pending quotations")
      filtered = sentQuotations
      console.log("[v0] Pending quotations after filter:", filtered)
      filtered.forEach((item, idx) => {
        console.log(`[v0] Item ${idx} has branch:`, item.branch)
      })
    } else if (filterStatus === "partial") {
      console.log("[v0] Using partial orders")
      filtered = allOrders
        .filter(o => o.payment_status === "partial")
        .map(order => {
          console.log("[v0] Mapping partial order:", {
            order_id: order.id,
            order_number: order.order_number,
            branch_id: order.branch_id,
            has_branch_object: !!order.branch,
            branch: order.branch
          })
          return {
            id: order.id,
            quotation_number: order.order_number,
            total: order.total,
            remaining_balance: order.remaining_balance,
            customer: { 
              name: order.customer?.bill_to_name || order.customer?.name || `Customer ${order.customer_id}`, 
              email: order.customer?.bill_to_email || order.customer?.email || "", 
              phone: order.customer?.bill_to_phone || order.customer?.phone || "" 
            },
            created_at: order.order_date,
            payment_status: order.payment_status,
            order_status: order.order_status,
            subtotal: order.subtotal,
            discount: order.discount,
            payment_method: order.payment_method,
            quotation: order.quotation,
            branch: order.branch,
            isOrder: true
          }
        })
    } else if (filterStatus === "paid") {
      console.log("[v0] Using paid orders")
      filtered = allOrders
        .filter(o => o.payment_status === "paid" && !o.released_date)
        .map(order => {
          console.log("[v0] Mapping paid order:", {
            order_id: order.id,
            order_number: order.order_number,
            branch_id: order.branch_id,
            has_branch_object: !!order.branch,
            branch: order.branch
          })
          return {
            id: order.id,
            quotation_number: order.order_number,
            total: order.total,
            remaining_balance: order.remaining_balance,
            customer: { 
              name: order.customer?.bill_to_name || order.customer?.name || `Customer ${order.customer_id}`, 
              email: order.customer?.bill_to_email || order.customer?.email || "", 
              phone: order.customer?.bill_to_phone || order.customer?.phone || "" 
            },
            created_at: order.order_date,
            payment_status: order.payment_status,
            order_status: order.order_status,
            subtotal: order.subtotal,
            discount: order.discount,
            payment_method: order.payment_method,
            quotation: order.quotation,
            branch: order.branch,
            isOrder: true,
            completed_date: order.completed_date,
            released_date: order.released_date
          }
        })
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.quotation_number.toLowerCase().includes(query) ||
        (item.customer?.name && item.customer.name.toLowerCase().includes(query))
      )
    }

    console.log("[v0] Final displayData count:", filtered.length)
    console.log("[v0] Final displayData:", filtered)
    console.log("[v0] === DISPLAYDATA CALCULATION END ===")
    
    return filtered
  }, [filterStatus, sentQuotations, allOrders, searchQuery])

  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    return displayData.slice(startIdx, startIdx + itemsPerPage)
  }, [displayData, currentPage])

  const totalPages = Math.ceil(displayData.length / itemsPerPage)

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      <AdminSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">Orders Management</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Manage quotations, orders, and payments</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Modern Filter Cards */}
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {/* Pending Card */}
            <button
              onClick={() => {
                setFilterStatus("pending")
                setCurrentPage(1)
              }}
              className={`group relative overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                filterStatus === "pending"
                  ? "bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white shadow-xl shadow-orange-500/30 ring-2 ring-orange-400/50"
                  : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:shadow-lg hover:shadow-orange-500/10 border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${filterStatus === "pending" ? "opacity-100" : ""}`} />
              <div className="relative flex flex-col items-center gap-2">
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  filterStatus === "pending" 
                    ? "bg-white/20 shadow-inner" 
                    : "bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50"
                }`}>
                  <Clock className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:scale-110 ${
                    filterStatus === "pending" ? "text-white" : "text-orange-600 dark:text-orange-400"
                  }`} />
                </div>
                <span className="font-bold text-sm md:text-base">Pending</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
                  filterStatus === "pending" 
                    ? "bg-white/20 text-white" 
                    : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                }`}>
                  {sentQuotations.length}
                </span>
              </div>
            </button>

            {/* Partial Payment Card */}
            <button
              onClick={() => {
                setFilterStatus("partial")
                setCurrentPage(1)
              }}
              className={`group relative overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                filterStatus === "partial"
                  ? "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 ring-2 ring-blue-400/50"
                  : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:shadow-lg hover:shadow-blue-500/10 border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${filterStatus === "partial" ? "opacity-100" : ""}`} />
              <div className="relative flex flex-col items-center gap-2">
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  filterStatus === "partial" 
                    ? "bg-white/20 shadow-inner" 
                    : "bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50"
                }`}>
                  <DollarSign className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:scale-110 ${
                    filterStatus === "partial" ? "text-white" : "text-blue-600 dark:text-blue-400"
                  }`} />
                </div>
                <span className="font-bold text-sm md:text-base text-center">Partial</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
                  filterStatus === "partial" 
                    ? "bg-white/20 text-white" 
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                }`}>
                  {allOrders.filter(o => o.payment_status === "partial").length}
                </span>
              </div>
            </button>

            {/* Fully Paid Card */}
            <button
              onClick={() => {
                setFilterStatus("paid")
                setCurrentPage(1)
              }}
              className={`group relative overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                filterStatus === "paid"
                  ? "bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white shadow-xl shadow-green-500/30 ring-2 ring-green-400/50"
                  : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:shadow-lg hover:shadow-green-500/10 border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${filterStatus === "paid" ? "opacity-100" : ""}`} />
              <div className="relative flex flex-col items-center gap-2">
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  filterStatus === "paid" 
                    ? "bg-white/20 shadow-inner" 
                    : "bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50"
                }`}>
                  <CheckCircle className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:scale-110 ${
                    filterStatus === "paid" ? "text-white" : "text-green-600 dark:text-green-400"
                  }`} />
                </div>
                <span className="font-bold text-sm md:text-base text-center">Fully Paid</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
                  filterStatus === "paid" 
                    ? "bg-white/20 text-white" 
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                }`}>
                  {allOrders.filter(o => o.payment_status === "paid" && !o.released_date).length}
                </span>
              </div>
            </button>

            {/* Completed Card */}
            <button
              onClick={() => {
                setFilterStatus("completed")
                setCurrentPage(1)
              }}
              className={`group relative overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                filterStatus === "completed"
                  ? "bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30 ring-2 ring-amber-400/50"
                  : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:shadow-lg hover:shadow-amber-500/10 border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${filterStatus === "completed" ? "opacity-100" : ""}`} />
              <div className="relative flex flex-col items-center gap-2">
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  filterStatus === "completed" 
                    ? "bg-white/20 shadow-inner" 
                    : "bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50"
                }`}>
                  <Package className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:scale-110 ${
                    filterStatus === "completed" ? "text-white" : "text-amber-600 dark:text-amber-400"
                  }`} />
                </div>
                <span className="font-bold text-sm md:text-base">Completed</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
                  filterStatus === "completed" 
                    ? "bg-white/20 text-white" 
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                }`}>
                  {jobOrders.filter(jo => jo.status?.toLowerCase() === "completed" && !jo.released_date).length}
                </span>
              </div>
            </button>

            {/* Released Card */}
            <button
              onClick={() => {
                setFilterStatus("released")
                setCurrentPage(1)
              }}
              className={`group relative overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 col-span-2 sm:col-span-1 ${
                filterStatus === "released"
                  ? "bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 text-white shadow-xl shadow-purple-500/30 ring-2 ring-purple-400/50"
                  : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:shadow-lg hover:shadow-purple-500/10 border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${filterStatus === "released" ? "opacity-100" : ""}`} />
              <div className="relative flex flex-col items-center gap-2">
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  filterStatus === "released" 
                    ? "bg-white/20 shadow-inner" 
                    : "bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50"
                }`}>
                  <CheckCircle2 className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:scale-110 ${
                    filterStatus === "released" ? "text-white" : "text-purple-600 dark:text-purple-400"
                  }`} />
                </div>
                <span className="font-bold text-sm md:text-base">Released</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
                  filterStatus === "released" 
                    ? "bg-white/20 text-white" 
                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                }`}>
                  {jobOrders.filter(jo => !!jo.released_date).length}
                </span>
              </div>
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="animate-spin mr-2" />
              <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
            </div>
          ) : (filterStatus === "completed" || filterStatus === "released") ? (
            (() => {
              // Filter job orders by status first
              let filteredJobOrders = jobOrders.filter((jo: JobOrder) => {
                if (filterStatus === "completed") {
                  return jo.status?.toLowerCase() === "completed" && !jo.released_date
                } else if (filterStatus === "released") {
                  return !!jo.released_date
                }
                return false
              })
              
              // Apply search filter for Completed and Released tabs
              if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                filteredJobOrders = filteredJobOrders.filter((jo: JobOrder) => 
                  jo.job_order_number?.toLowerCase().includes(query) ||
                  jo.customer?.bill_to_name?.toLowerCase().includes(query) ||
                  jo.customer?.bill_to_email?.toLowerCase().includes(query)
                )
              }
              
              return filteredJobOrders.length === 0 ? (
                <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-300 font-medium">
                    {searchQuery.trim() ? `No ${filterStatus} job orders match your search` : `No ${filterStatus} job orders found`}
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:gap-6">
                  {filteredJobOrders.map((jobOrder: JobOrder) => (
                  <Card
                    key={jobOrder.id}
                    className="overflow-hidden bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:shadow-2xl hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700"
                  >
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-6 flex-wrap">
                            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                              {jobOrder.job_order_number}
                            </h3>
                            <div className="flex gap-2 flex-wrap items-center">
                              <span className={`${getStatusColor(jobOrder.status)}`}>
                                {getStatusLabel(jobOrder.status)}
                              </span>
                              {jobOrder.is_priority && (
                                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                                  Priority
                                </span>
                              )}
                            </div>
                          </div>

                          {jobOrdersStats[jobOrder.id] && jobOrdersStats[jobOrder.id].total > 0 && (
                            <div className="mb-4 w-full p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                              <OrderProgressBar items={Array.from({ length: jobOrdersStats[jobOrder.id].total }, (_, i) => ({
                                id: i,
                                status: i < jobOrdersStats[jobOrder.id].completed ? 'completed' : 'pending'
                              }))} />
                            </div>
                          )}

                          <div className="mb-6 pb-6 border-b-2 border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider">Customer</p>
                            </div>
                            <div className="space-y-2 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg p-3">
                              <p className="text-sm md:text-base font-bold text-neutral-900 dark:text-white">
                                {jobOrder.customer?.bill_to_name || 'N/A'}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                {jobOrder.customer?.bill_to_email || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                                <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase">Start Date</p>
                              </div>
                              <p className="font-bold text-neutral-900 dark:text-white text-sm">
                                {formatDate(jobOrder.start_date)}
                              </p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-orange-600 dark:text-orange-400" />
                                <p className="text-xs text-orange-600 dark:text-orange-300 font-bold uppercase">Due Date</p>
                              </div>
                              <p className="font-bold text-neutral-900 dark:text-white text-sm">
                                {formatDate(jobOrder.due_date)}
                              </p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Users size={16} className="text-purple-600 dark:text-purple-400" />
                                <p className="text-xs text-purple-600 dark:text-purple-300 font-bold uppercase">Assigned</p>
                              </div>
                              <p className="font-bold text-sm text-neutral-900 dark:text-white">
                                {(() => {
                                  const assignedToObj = jobOrder.assignedTo || (typeof jobOrder.assigned_to === 'object' ? jobOrder.assigned_to : null)
                                  const firstName = assignedToObj?.first_name
                                  const lastName = assignedToObj?.last_name
                                  return (firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : 'Unassigned'
                                })()}
                              </p>
                            </div>
                            {jobOrder.order?.branch && (
                              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building2 size={16} className="text-green-600 dark:text-green-400" />
                                  <p className="text-xs text-green-600 dark:text-green-300 font-bold uppercase">Branch</p>
                                </div>
                                <p className="font-bold text-sm text-neutral-900 dark:text-white">
                                  {jobOrder.order.branch.name}
                                  {jobOrder.order.branch.location && ` - ${jobOrder.order.branch.location}`}
                                </p>
                              </div>
                            )}
                            {!jobOrder.order?.branch && (
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400">[v0] No branch - Check console</p>
                              </div>
                            )}
                          </div>

                          {jobOrder.notes && (
                            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase mb-2">Notes</p>
                              <p className="text-sm text-neutral-700 dark:text-neutral-300">{jobOrder.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 w-full md:w-auto flex-col md:flex-row">
                          <Button
                            onClick={() => router.push(`/admin/job-orders/${jobOrder.id}/orders`)}
                            disabled={!!jobOrder.released_date}
                            className={`${jobOrder.released_date ? 'opacity-50 cursor-not-allowed' : ''} bg-orange-500 hover:bg-orange-600 text-white h-10 md:h-auto md:min-w-[160px] flex items-center justify-center gap-2`}
                          >
                            <Eye size={18} />
                            <span className="hidden sm:inline">View</span>
                          </Button>

                          {jobOrder.status?.toLowerCase() === 'completed' && !jobOrder.released_date ? (
                            <Button
                              onClick={() => handleReleaseConfirm(jobOrder.id)}
                              disabled={isReleasing === jobOrder.id}
                              className="bg-purple-600 hover:bg-purple-700 text-white h-10 md:h-auto md:min-w-[160px] flex items-center justify-center gap-2"
                            >
                              {isReleasing === jobOrder.id ? (
                                <>
                                  <Loader2 size={18} className="animate-spin" />
                                  <span className="hidden sm:inline">Releasing...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={18} />
                                  <span className="hidden sm:inline">Release</span>
                                </>
                              )}
                            </Button>
                          ) : jobOrder.released_date ? (
                            <Button
                              disabled={true}
                              className="bg-green-600 text-white h-10 md:h-auto md:min-w-[160px] flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                            >
                              <CheckCircle2 size={18} />
                              <span className="hidden sm:inline">Released</span>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
            })()
          ) : displayData.length === 0 ? (
            <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-300 font-medium">
                {searchQuery ? "No results found" : "No data available"}
              </p>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                {paginatedData.map((item: any, idx: number) => (
                  <Card 
                    key={`${item.isOrder ? "order" : "quot"}-${item.id}`} 
                    className="overflow-hidden bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:shadow-2xl hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 hover:scale-[1.01] hover:-translate-y-1 animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="p-6 sm:p-8">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b-2 border-neutral-200 dark:border-neutral-700">
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                            {item.quotation_number}
                          </h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {item.isOrder ? `Order ID: ${item.id}` : `Quotation ID: ${item.id}`}
                          </p>
                        </div>
                        <div>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${getStatusColor(item.payment_status)}`}>
                            {item.isOrder && item.payment_status 
                              ? (
                                <>
                                  {item.payment_status === 'paid' && <CheckCircle size={14} />}
                                  {item.payment_status === 'partial' && <TrendingDown size={14} />}
                                  {item.payment_status === 'pending' && <Clock size={14} />}
                                  {item.payment_status.charAt(0).toUpperCase() + item.payment_status.slice(1)}
                                </>
                              )
                              : "Pending"}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider mb-3">Customer</p>
                        <p className="font-bold text-neutral-900 dark:text-white text-lg mb-2">{item.customer?.name || item.customer?.bill_to_name || 'Unknown'}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.customer?.email || item.customer?.bill_to_email || '-'}</p>
                      </div>

                      {/* Key Information Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {item.isOrder && item.branch && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
                              <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase">Branch</p>
                            </div>
                            <p className="font-bold text-neutral-900 dark:text-white text-sm">{item.branch.name}</p>
                            {item.branch.location && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">📍 {item.branch.location}</p>
                            )}
                          </div>
                        )}

                        {item.isOrder && item.created_by && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <User size={16} className="text-purple-600 dark:text-purple-400" />
                              <p className="text-xs text-purple-600 dark:text-purple-300 font-bold uppercase">Created By</p>
                            </div>
                            <p className="font-bold text-neutral-900 dark:text-white text-sm">#{item.created_by}</p>
                          </div>
                        )}

                        {item.isOrder && item.order_date && (
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar size={16} className="text-orange-600 dark:text-orange-400" />
                              <p className="text-xs text-orange-600 dark:text-orange-300 font-bold uppercase">Order Date</p>
                            </div>
                            <p className="font-bold text-neutral-900 dark:text-white text-sm">{formatDate(item.order_date || item.created_at)}</p>
                          </div>
                        )}

                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800/50">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={16} className="text-green-600 dark:text-green-400" />
                            <p className="text-xs text-green-600 dark:text-green-300 font-bold uppercase">Subtotal</p>
                          </div>
                          <p className="font-bold text-neutral-900 dark:text-white text-sm">₱{Number.parseFloat(item.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800/50">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
                            <p className="text-xs text-red-600 dark:text-red-300 font-bold uppercase">Discount</p>
                          </div>
                          <p className="font-bold text-neutral-900 dark:text-white text-sm">₱{Number.parseFloat(item.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800/50">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <p className="text-xs text-indigo-600 dark:text-indigo-300 font-bold uppercase">Total</p>
                          </div>
                          <p className="font-bold text-neutral-900 dark:text-white text-lg">₱{Number.parseFloat(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>

                        {(!item.isOrder && item.branch) && (
                          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 size={16} className="text-teal-600 dark:text-teal-400" />
                              <p className="text-xs text-teal-600 dark:text-teal-300 font-bold uppercase">Branch</p>
                            </div>
                            <p className="font-bold text-neutral-900 dark:text-white text-sm">{item.branch.name}</p>
                            {item.branch.location && (
                              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">📍 {item.branch.location}</p>
                            )}
                          </div>
                        )}
                        {(!item.isOrder && !item.branch) && (
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">[v0] No branch data - Check console logs</p>
                          </div>
                        )}

                        {item.isOrder && item.payment_method && (
                          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard size={16} className="text-pink-600 dark:text-pink-400" />
                              <p className="text-xs text-pink-600 dark:text-pink-300 font-bold uppercase">Payment Method</p>
                            </div>
                            <p className="font-bold text-neutral-900 dark:text-white text-sm capitalize">{item.payment_method || 'N/A'}</p>
                          </div>
                        )}

                        {item.isOrder && item.remaining_balance !== undefined && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard size={16} className="text-amber-600 dark:text-amber-400" />
                              <p className="text-xs text-amber-600 dark:text-amber-300 font-bold uppercase">Remaining Balance</p>
                            </div>
                            <p className="font-bold text-neutral-900 dark:text-white text-sm">₱{Number.parseFloat(item.remaining_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 flex-wrap">
                        {!item.isOrder && (
                          <Button
                            onClick={() => {
                              const quotation = sentQuotations.find(q => q.id === item.id)
                              if (quotation) {
                                setSelectedQuotation(quotation)
                                setViewItemsModalOpen(true)
                              }
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 h-10 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                          >
                            <Eye size={18} />
                            <span>View Items</span>
                          </Button>
                        )}

                        {item.isOrder && item.payment_status === "partial" && (
                          <Button
                            onClick={() => {
                              setSelectedOrder(item)
                              setUpdatePaymentModalOpen(true)
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 h-10 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                          >
                            <Settings size={18} />
                            <span>Update</span>
                          </Button>
                        )}

                        {!item.isOrder && (
                          <Button
                            onClick={() => {
                              setSelectedQuotation(item)
                              setPaymentModalOpen(true)
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 h-10 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                          >
                            <CheckCircle size={18} />
                            <span>Create Order</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Modals */}
          <SetPaymentModal
            isOpen={paymentModalOpen}
            onOpenChange={setPaymentModalOpen}
            quotation={selectedQuotation}
            employees={employees}
            onConfirm={handleSaveOrder}
            isSaving={savingId !== null}
          />
          <UpdatePaymentModal
            isOpen={updatePaymentModalOpen}
            onOpenChange={setUpdatePaymentModalOpen}
            order={selectedOrder}
            onConfirm={handleUpdatePaymentStatus}
            isSaving={savingId !== null}
          />
          <ViewItemsModal
            isOpen={viewItemsModalOpen}
            onOpenChange={setViewItemsModalOpen}
            quotation={selectedQuotation}
          />

          {/* Release Confirmation Dialog */}
          <AlertDialog open={releaseConfirmOpen} onOpenChange={setReleaseConfirmOpen}>
            <AlertDialogContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-neutral-900 dark:text-white">
                  Release Job Order #{releaseOrderId && jobOrders.find(jo => jo.id === releaseOrderId)?.job_order_number}?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
                  Are you sure you want to release job order{' '}
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    #{releaseOrderId && jobOrders.find(jo => jo.id === releaseOrderId)?.job_order_number}
                  </span>
                  ? This Action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3">
                <AlertDialogCancel className="hover:bg-neutral-100 dark:hover:bg-neutral-700">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleReleaseOrder()}
                  disabled={isReleasing === releaseOrderId}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isReleasing === releaseOrderId ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2 inline" />
                      Releasing...
                    </>
                  ) : (
                    'Release'
                  )}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  )
}
