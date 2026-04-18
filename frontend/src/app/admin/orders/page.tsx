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
import { FileText, MapPin, DollarSign, Users, Loader2, CheckCircle, Clock, Eye, Settings, Search, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  user_type: string
}

export default function OrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [sentQuotations, setSentQuotations] = useState<SentQuotation[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"pending" | "sales" | "partial" | "paid" | "completed" | "released">("pending")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  
  // Modal states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [updatePaymentModalOpen, setUpdatePaymentModalOpen] = useState(false)
  const [viewItemsModalOpen, setViewItemsModalOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<SentQuotation | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false)
  const [releaseOrderId, setReleaseOrderId] = useState<number | null>(null)
  const [isReleasing, setIsReleasing] = useState<number | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = () => {
    const token = localStorage.getItem("admin_token")
    const userData = localStorage.getItem("admin_user")

    if (!token || !userData) {
      router.push("/admin")
      return
    }
    const adminUser = JSON.parse(userData)
    setUser(adminUser)
    fetchSentQuotations(token)
    fetchAllOrders(token)
    fetchEmployees(token)
  }

  const fetchSentQuotations = async (token: string) => {
    try {
      const response = await fetch(`${apiUrl}/admin/quotations?status=sent`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const quotations = Array.isArray(data) ? data : (data.data || data)
      
      const sent = Array.isArray(quotations) 
        ? quotations.filter((q: any) => q && q.status === "sent")
        : []
      
      setSentQuotations(sent)
    } catch (err) {
      console.error("[v0] Error fetching quotations:", err)
    }
  }

  const fetchAllOrders = async (token: string) => {
    try {
      setIsLoading(true)
      setError("")
      
      console.log("[v0] Fetching orders from:", `${apiUrl}/admin/orders`)
      
      const response = await fetch(`${apiUrl}/admin/orders`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Orders response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Orders fetch failed - Response:", errorText)
        throw new Error(`Failed to fetch orders: HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Orders response data:", data)
      
      const orders = Array.isArray(data) ? data : (data.data || [])
      console.log("[v0] Parsed orders count:", orders.length)
      
      setAllOrders(orders)
    } catch (err) {
      console.error("[v0] Error fetching orders - Full error:", {
        message: err instanceof Error ? err.message : String(err),
        error: err,
        stack: err instanceof Error ? err.stack : undefined
      })
      setError("Failed to load sales data")
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleSaveOrder = async (paymentType: "downpayment" | "fullpayment", employeeId: number, formData: any) => {
    if (!selectedQuotation) return
    
    // Prevent double-click/duplicate submission
    if (savingId === selectedQuotation.id) return

    try {
      setSavingId(selectedQuotation.id)
      const token = localStorage.getItem("admin_token")

      // Calculate paid amount
      const paidAmount = paymentType === "fullpayment" 
        ? selectedQuotation.total 
        : parseFloat(formData.downPaymentInput || (selectedQuotation.total * 0.5).toString())

      // First, update the quotation with paid_amount and status using the new PATCH route
      const quotationUpdateResponse = await fetch(
        `${apiUrl}/quotations/${selectedQuotation.id}/payment`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paid_amount: paidAmount,
            status: "approved",
          }),
        }
      )

      if (!quotationUpdateResponse.ok) {
        try {
          const errorData = await quotationUpdateResponse.json()
          throw new Error(errorData.message || errorData.error || "Failed to update quotation payment")
        } catch (parseErr) {
          const errorText = await quotationUpdateResponse.text()
          throw new Error(`Failed to update quotation: ${quotationUpdateResponse.status} ${quotationUpdateResponse.statusText}`)
        }
      }

      // Step 2: Create an Order from the quotation

      // Calculate remaining balance based on payment type
      const remainingBalance = paymentType === "fullpayment" 
        ? 0 
        : selectedQuotation.total - paidAmount

      const orderResponse = await fetch(`${apiUrl}/admin/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotation_id: selectedQuotation.id,
          customer_id: selectedQuotation.created_by || selectedQuotation.creator?.id || 1,
          order_date: new Date().toISOString().split('T')[0],
          subtotal: selectedQuotation.total,
          discount: 0,
          total: selectedQuotation.total,
          payment_status: paymentType === "fullpayment" ? "paid" : "partial",
          order_status: "pending",
          payment_method: formData.paymentMethod || "cash",
          remaining_balance: remainingBalance,
          notes: formData.notes || "",
        }),
      })

      if (!orderResponse.ok) {
        let errorData: any = {}
        try {
          errorData = await orderResponse.json()
          console.error("[v0] Order creation failed - API error response:", errorData)
        } catch (e) {
          const errorText = await orderResponse.text()
          console.error("[v0] Order creation failed - non-JSON response:", errorText)
          throw new Error(`Failed to create order: HTTP ${orderResponse.status}`)
        }
        throw new Error(errorData.message || errorData.error || "Failed to create order")
      }

      const orderData = await orderResponse.json()
      console.log("[v0] Order created successfully:", orderData)
      const orderId = orderData.data?.id || orderData.id
      
      if (!orderId) {
        console.error("[v0] No order ID in response:", orderData)
        throw new Error("Failed to extract order ID from response")
      }

      // Step 3: Create Order Items from quotation items (only unique items)
      if (formData.items && formData.items.length > 0) {
        // Deduplicate items by service_id and quotation item id
        const createdItemIds = new Set<number>()
        
        for (const item of formData.items) {
          // Skip if we've already created this item
          if (createdItemIds.has(item.id)) {
            console.log("[v0] Skipping duplicate item ID:", item.id)
            continue
          }
          
          console.log("[v0] Creating order item from quotation item:", item)
          try {
            const orderItemPayload = {
              order_id: orderId,
              service_id: item.service_id,
              quotation_items_id: item.id, // Pass the quotation item ID
              quantity: item.quantity || 1,
              unit_price: item.unit_price || 0,
              line_total: (item.quantity || 1) * (item.unit_price || 0),
              design_file_url: item.design_file_url || null,
              team_roster: item.team_roster ? (typeof item.team_roster === 'string' ? item.team_roster : JSON.stringify(item.team_roster)) : null,
              size_specifications: item.size_specifications ? (typeof item.size_specifications === 'string' ? item.size_specifications : JSON.stringify(item.size_specifications)) : null,
              notes: item.notes ? (typeof item.notes === 'string' ? item.notes : JSON.stringify(item.notes)) : null,
              status: "pending",
            }
            console.log("[v0] Order item payload:", orderItemPayload)
            
            const orderItemResponse = await fetch(`${apiUrl}/order-items`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(orderItemPayload),
            })
            
            if (!orderItemResponse.ok) {
              const errorText = await orderItemResponse.text()
              console.error("[v0] Order item error response:", errorText)
              let errorData
              try {
                errorData = JSON.parse(errorText)
              } catch {
                throw new Error(`HTTP ${orderItemResponse.status}: ${errorText}`)
              }
              throw new Error(errorData.message || errorData.error || "Failed to create order item")
            }
            
            const itemResult = await orderItemResponse.json()
            console.log("[v0] Order item created successfully:", itemResult)
            createdItemIds.add(item.id) // Mark this item as created
          } catch (itemError) {
            console.error("[v0] Error creating order item:", itemError)
            throw new Error(`Failed to create order item: ${itemError instanceof Error ? itemError.message : String(itemError)}`)
          }
        }
      }

      // Step 4: Create Job Order with the new order_id
      console.log("[v0] Creating job order with order ID:", orderId)
      const jobOrderResponse = await fetch(`${apiUrl}/admin/job-orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotation_id: selectedQuotation.id,
          order_id: orderId,
          assigned_to: employeeId,
          customer_id: selectedQuotation.created_by || selectedQuotation.creator?.id || 1,
          start_date: formData.startDate,
          due_date: formData.dueDate,
          notes: formData.notes,
          is_priority: formData.isPriority || 0,
        }),
      })

      if (!jobOrderResponse.ok) {
        const errorText = await jobOrderResponse.text()
        console.error("[v0] Job order error response:", errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          throw new Error(`HTTP ${jobOrderResponse.status}: ${errorText}`)
        }
        throw new Error(errorData.message || errorData.error || "Failed to create job order")
      }

      const jobOrderResult = await jobOrderResponse.json()
      console.log("[v0] Job order created successfully:", jobOrderResult)

      // Remove from pending list
      setSentQuotations(sentQuotations.filter(q => q.id !== selectedQuotation.id))
      setSelectedQuotation(null)
      setPaymentModalOpen(false)
      
      // Show success message
      setError("")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save order"
      console.error("[v0] Save order error:", {
        message: errorMsg,
        error: err,
        stack: err instanceof Error ? err.stack : undefined
      })
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

      console.log("[v0] Updating payment status for order:", selectedOrder.id, {
        payment_status: paymentStatus,
        remaining_balance: remainingBalance,
      })

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
        throw new Error(errorData.message || errorData.error || "Failed to update payment status")
      }

      const result = await response.json()
      console.log("[v0] Payment status updated successfully:", result)

      // Update the local orders list
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
      console.error("[v0] Update payment status error:", errorMsg)
      setError(errorMsg)
    } finally {
      setSavingId(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Determine which data to display based on filter
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
        .filter(o => o.payment_status === "paid")
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
    } else if (filterStatus === "completed") {
      filtered = allOrders
        .filter(o => o.order_status === "completed" && o.payment_status === "paid")
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
    } else if (filterStatus === "released") {
      filtered = allOrders
        .filter(o => o.order_status === "released")
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
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.quotation_number.toLowerCase().includes(query) ||
        (item.customer?.name && item.customer.name.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [filterStatus, sentQuotations, allOrders, searchQuery])

  // Pagination
  const totalPages = Math.ceil(displayData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = displayData.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "partial":
        return "bg-blue-100 text-blue-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "sales":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      
      const response = await fetch(`${apiUrl}/admin/orders/${releaseOrderId}/release`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setReleaseConfirmOpen(false)
        fetchAllOrders(token)
      } else {
        const data = await response.json()
        console.error("[v0] Release error:", data)
      }
    } catch (err) {
      console.error("[v0] Error releasing order:", err)
    } finally {
      setIsReleasing(null)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-neutral-900 dark:text-white">Sales & Orders</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Manage sent quotations, payments, and employee assignments</p>
          </div>

          {error && (
            <Card className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </Card>
          )}

          {/* Search Bar */}
          <Card className="mb-6 p-4 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-sm">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by quotation number or customer name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-10 py-2.5 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setCurrentPage(1)
                  }}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </Card>

          {/* Filter Buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            {/* Pending Button */}
            <button
              onClick={() => {
                setFilterStatus("pending")
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                filterStatus === "pending"
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              Pending
            </button>

            {/* Partial Payment Button */}
            <button
              onClick={() => {
                setFilterStatus("partial")
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                filterStatus === "partial"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              Partial Payment
            </button>

            {/* Fully Paid Button */}
            <button
              onClick={() => {
                setFilterStatus("paid")
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                filterStatus === "paid"
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              Fully Paid
            </button>

            {/* Completed Button - Only for Cashier and Manager */}
            {user && (user.user_type === 'cashier' || user.user_type === 'manager') && (
              <button
                onClick={() => {
                  setFilterStatus("completed")
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  filterStatus === "completed"
                    ? "bg-orange-500 text-white shadow-lg"
                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                }`}
              >
                Completed
              </button>
            )}

            {/* Released Button - Only for Cashier and Manager */}
            {user && (user.user_type === 'cashier' || user.user_type === 'manager') && (
              <button
                onClick={() => {
                  setFilterStatus("released")
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  filterStatus === "released"
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                }`}
              >
                Released
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="animate-spin mr-2" />
              <p className="text-neutral-600 dark:text-neutral-400">Loading orders...</p>
            </div>
          ) : displayData.length === 0 ? (
            <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-300 font-medium">
                {searchQuery ? "No matching orders found" : "No orders in this category"}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : `${filterStatus === "pending" ? "Sent quotations" : "Orders"} will appear here`}
              </p>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 animate-fade-in">
                {paginatedData.map((item: any, idx: number) => (
                  <Card key={`${item.isOrder ? "order" : "quot"}-${item.id}`} className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-orange-300 dark:hover:border-orange-600">
                    <div className="p-4 md:p-6">
                      {/* Header with flex layout */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                              {item.quotation_number}
                            </h3>
                            {item.quotation?.branch && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                🗺️ {item.quotation.branch.name}
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.isOrder && item.payment_status ? getStatusColor(item.payment_status) : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"}`}>
                              {item.isOrder && item.payment_status 
                                ? item.payment_status.charAt(0).toUpperCase() + item.payment_status.slice(1)
                                : "Pending"}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                            Customer: <span className="font-semibold text-neutral-900 dark:text-white">{item.customer?.name}</span>
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock size={16} className="text-neutral-400 dark:text-neutral-500" />
                              <span className="text-neutral-600 dark:text-neutral-400">{formatDate(item.created_at)}</span>
                            </div>
                            {!item.isOrder && (
                              <div className="flex items-center gap-1">
                                <FileText size={16} className="text-neutral-400 dark:text-neutral-500" />
                                <span className="text-neutral-600 dark:text-neutral-400">{item.items?.length || 0} items</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <DollarSign size={16} className="text-neutral-400 dark:text-neutral-500" />
                              <span className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(item.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side Buttons */}
                        {!item.isOrder && (
                          <div className="flex flex-col sm:flex-row gap-2 min-w-max">
                            <Button
                              onClick={() => {
                                const quotation = sentQuotations.find(q => q.id === item.id)
                                if (quotation) {
                                  setSelectedQuotation(quotation)
                                  setViewItemsModalOpen(true)
                                }
                              }}
                              variant="outline"
                              className="flex items-center justify-center gap-2 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                              title="View Items"
                            >
                              <Eye size={18} />
                              <span className="hidden sm:inline">Items</span>
                            </Button>
                            <Button
                              onClick={() => {
                                console.log("[v0] Set Payment button clicked - item:", item)
                                const quotation = sentQuotations.find(q => q.id === item.id)
                                console.log("[v0] Found quotation:", quotation)
                                if (quotation) {
                                  console.log("[v0] Setting selected quotation and opening modal")
                                  setSelectedQuotation(quotation)
                                  setPaymentModalOpen(true)
                                } else {
                                  console.warn("[v0] Quotation not found for item id:", item.id)
                                }
                              }}
                              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg transition active:scale-95"
                              title="Set Payment & Assign Employee"
                            >
                              <Settings size={18} />
                              <span className="hidden sm:inline">Set Payment</span>
                            </Button>
                          </div>
                        )}
                        {item.isOrder && (
                          <div className="flex flex-col sm:flex-row gap-2 min-w-max items-center">
                            <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(item.payment_status)}`}>
                              {item.payment_method ? `Paid via ${item.payment_method}` : "No payment method"}
                            </span>
                            {item.payment_status === "partial" && (
                              <Button
                                onClick={() => {
                                  setSelectedOrder(item)
                                  setUpdatePaymentModalOpen(true)
                                }}
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white hover:shadow-lg hover:bg-blue-700 transition active:scale-95"
                                title="Update Payment Status"
                              >
                                <Settings size={18} />
                                <span className="hidden sm:inline">Update</span>
                              </Button>
                            )}
                            {/* Release Button - Only show for Cashier and Manager when payment is paid and order is completed */}
                            {user && (user.user_type === 'cashier' || user.user_type === 'manager') && 
                             item.payment_status === 'paid' && 
                             item.order_status === 'completed' && (
                              <Button
                                onClick={() => handleReleaseConfirm(item.id)}
                                disabled={isReleasing === item.id}
                                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition active:scale-95"
                                title="Release Order to Customer"
                              >
                                {isReleasing === item.id ? (
                                  <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span className="hidden sm:inline">Releasing...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={18} />
                                    <span className="hidden sm:inline">Release</span>
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Order Details for Sales/Partial/Paid */}
                      {item.isOrder && (
                        <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg mt-4">
                          <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 text-sm">Order Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-1">Subtotal</p>
                              <p className="font-medium text-neutral-900 dark:text-white">{formatCurrency(item.subtotal)}</p>
                            </div>
                            <div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-1">Discount</p>
                              <p className="font-medium text-neutral-900 dark:text-white">{formatCurrency(item.discount)}</p>
                            </div>
                            <div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-1">Total</p>
                              <p className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(item.total)}</p>
                            </div>
                            <div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-1">Status</p>
                              <p className="font-medium text-neutral-900 dark:text-white">{item.order_status}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Customer Details for Quotations */}
                      {!item.isOrder && item.customer && (
                        <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg mt-4">
                          <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 text-sm">Customer Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-1">Email</p>
                              <p className="font-medium text-neutral-900 dark:text-white break-all">{item.customer?.email || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-1">Phone</p>
                              <p className="font-medium text-neutral-900 dark:text-white">{item.customer?.phone || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-1">Total Amount</p>
                              <p className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(item.total)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg transition font-medium transform hover:scale-105 active:scale-95 ${
                          currentPage === page
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                            : "border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Results info */}
              <div className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, displayData.length)} of {displayData.length} {filterStatus === "pending" ? "pending orders" : "orders"}
              </div>
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
                  Release Order?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
                  Are you sure you want to release order{' '}
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    #{releaseOrderId && allOrders.find(o => o.id === releaseOrderId)?.order_number}
                  </span>
                  ? This action will mark it as released and the customer can pick it up.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3">
                <AlertDialogCancel className="hover:bg-neutral-100 dark:hover:bg-neutral-700">
                  No, Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleReleaseOrder()}
                  disabled={isReleasing === releaseOrderId}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isReleasing === releaseOrderId ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Releasing...
                    </>
                  ) : (
                    'Yes, Release'
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
