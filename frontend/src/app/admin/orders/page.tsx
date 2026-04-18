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
import { FileText, MapPin, DollarSign, Users, Loader2, CheckCircle, Clock, Eye, Settings, Search, X, Calendar, CheckCircle2, Package } from "lucide-react"
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
  items?: any[]
}

interface Order {
  id: number
  order_number: string
  quotation_id: number
  customer_id: number
  created_by: number
  order_date: string
  subtotal: number
  discount: number
  total: number
  payment_status: string
  order_status: string
  payment_method: string
  remaining_balance: number
  customer?: {
    name: string
    email: string
    phone: string
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
  order?: {
    id: number
    order_status: string
    payment_status: string
    items?: any[]
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
      // Use the existing adminIndex endpoint with status filter
      const response = await fetch(`${apiUrl}/admin/quotations?status=sent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.warn("[v0] Failed to fetch sent quotations, using empty array")
        setSentQuotations([])
        return
      }

      const data = await response.json()
      // The adminIndex returns an array directly, not wrapped in data property
      setSentQuotations(Array.isArray(data) ? data : (data.data || []))
    } catch (err) {
      console.error("[v0] Error fetching quotations:", err)
      setSentQuotations([])
    }
  }

  const fetchAllOrders = async (token: string) => {
    try {
      const response = await fetch(`${apiUrl}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch orders")

      const data = await response.json()
      setAllOrders(data.data || data)
    } catch (err) {
      console.error("[v0] Error fetching orders:", err)
    }
  }

  const fetchJobOrders = async (token: string) => {
    try {
      const response = await fetch(`${apiUrl}/admin/job-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('[v0] Failed to fetch job orders')
        return
      }

      const data = await response.json()
      const orders = data.data || data || []
      setJobOrders(orders)
      
      orders.forEach((jobOrder: JobOrder) => {
        fetchJobOrderItems(jobOrder.id, token)
      })
    } catch (err) {
      console.error('[v0] Error fetching job orders:', err)
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
    if (!selectedQuotation) return

    try {
      setSavingId(selectedQuotation.id)
      const token = localStorage.getItem("admin_token")

      const response = await fetch(`${apiUrl}/admin/quotations/${selectedQuotation.id}/convert-to-order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          remaining_balance: remainingBalance,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create order")
      }

      setSentQuotations(sentQuotations.filter(q => q.id !== selectedQuotation.id))
      setSelectedQuotation(null)
      setPaymentModalOpen(false)
      setError("")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create order"
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
    let filtered: any[] = []

    if (filterStatus === "pending") {
      filtered = sentQuotations
    } else if (filterStatus === "partial") {
      filtered = allOrders
        .filter(o => o.payment_status === "partial")
        .map(order => ({
          id: order.id,
          quotation_number: order.order_number,
          total: order.total,
          remaining_balance: order.remaining_balance,
          customer: { name: order.customer?.name || `Customer ${order.customer_id}`, email: "", phone: "" },
          created_at: order.order_date,
          payment_status: order.payment_status,
          order_status: order.order_status,
          subtotal: order.subtotal,
          discount: order.discount,
          payment_method: order.payment_method,
          quotation: order.quotation,
          isOrder: true
        }))
    } else if (filterStatus === "paid") {
      filtered = allOrders
        .filter(o => o.payment_status === "paid" && !o.released_date)
        .map(order => ({
          id: order.id,
          quotation_number: order.order_number,
          total: order.total,
          remaining_balance: order.remaining_balance,
          customer: { name: order.customer?.name || `Customer ${order.customer_id}`, email: "", phone: "" },
          created_at: order.order_date,
          payment_status: order.payment_status,
          order_status: order.order_status,
          subtotal: order.subtotal,
          discount: order.discount,
          payment_method: order.payment_method,
          quotation: order.quotation,
          isOrder: true,
          completed_date: order.completed_date,
          released_date: order.released_date
        }))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.quotation_number.toLowerCase().includes(query) ||
        (item.customer?.name && item.customer.name.toLowerCase().includes(query))
      )
    }

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

          {/* Filter Buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setFilterStatus("pending")
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filterStatus === "pending"
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              Pending
            </button>

            <button
              onClick={() => {
                setFilterStatus("partial")
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filterStatus === "partial"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              Partial Payment
            </button>

            <button
              onClick={() => {
                setFilterStatus("paid")
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filterStatus === "paid"
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              Fully Paid
            </button>

            <button
              onClick={() => {
                setFilterStatus("completed")
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filterStatus === "completed"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              Completed
            </button>

            <button
              onClick={() => {
                setFilterStatus("released")
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filterStatus === "released"
                  ? "bg-purple-500 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              Released
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="animate-spin mr-2" />
              <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
            </div>
          ) : (filterStatus === "completed" || filterStatus === "released") ? (
            jobOrders.filter((jo: JobOrder) => {
              if (filterStatus === "completed") {
                return jo.status?.toLowerCase() === "completed" && !jo.released_date
              } else if (filterStatus === "released") {
                return !!jo.released_date
              }
              return false
            }).length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-300 font-medium">
                  No {filterStatus} job orders found
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:gap-6">
                {jobOrders.filter((jo: JobOrder) => {
                  if (filterStatus === "completed") {
                    return jo.status?.toLowerCase() === "completed" && !jo.released_date
                  } else if (filterStatus === "released") {
                    return !!jo.released_date
                  }
                  return false
                }).map((jobOrder: JobOrder) => (
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
          ) : displayData.length === 0 ? (
            <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-300 font-medium">
                {searchQuery ? "No results found" : "No data available"}
              </p>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {paginatedData.map((item: any) => (
                  <Card key={`${item.isOrder ? "order" : "quot"}-${item.id}`} className="overflow-hidden hover:shadow-lg transition-all bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white mb-2">
                            {item.quotation_number}
                          </h3>
                          <span className={`${getStatusColor(item.payment_status)}`}>
                            {item.isOrder && item.payment_status 
                              ? item.payment_status.charAt(0).toUpperCase() + item.payment_status.slice(1)
                              : "Pending"}
                          </span>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                            Customer: <span className="font-semibold text-neutral-900 dark:text-white">{item.customer?.name}</span>
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm mt-2">
                            <div className="flex items-center gap-1">
                              <Clock size={16} className="text-neutral-400" />
                              <span className="text-neutral-600 dark:text-neutral-400">{formatDate(item.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign size={16} className="text-neutral-400" />
                              <span className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(item.total)}</span>
                            </div>
                          </div>
                        </div>

                        {!item.isOrder && (
                          <Button
                            onClick={() => {
                              const quotation = sentQuotations.find(q => q.id === item.id)
                              if (quotation) {
                                setSelectedQuotation(quotation)
                                setViewItemsModalOpen(true)
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye size={18} className="mr-2" />
                            View Items
                          </Button>
                        )}

                        {item.isOrder && item.payment_status === "partial" && (
                          <Button
                            onClick={() => {
                              setSelectedOrder(item)
                              setUpdatePaymentModalOpen(true)
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Settings size={18} className="mr-2" />
                            Update
                          </Button>
                        )}

                        {!item.isOrder && (
                          <Button
                            onClick={() => {
                              setSelectedQuotation(item)
                              setPaymentModalOpen(true)
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle size={18} className="mr-2" />
                            Create Order
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
                  ? The customer will be notified to pick it up.
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
