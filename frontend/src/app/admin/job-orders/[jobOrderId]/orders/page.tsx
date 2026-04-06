"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  CheckCircle,
  Clock,
} from "lucide-react"

interface OrderItem {
  id: number
  description: string
  quantity: number
  unit_price: string | number
  line_total: string | number
  status?: string
}

interface JobOrder {
  id: number
  job_order_number: string
  order_id: number
  status: string
  assigned_to: number
}

interface Order {
  id: number
  order_number: string
  order_date: string
  total: number
  items?: OrderItem[]
}

export default function JobOrdersManagementPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [jobOrder, setJobOrder] = useState<JobOrder | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)

  const router = useRouter()
  const params = useParams()

  const jobOrderId = Array.isArray(params.jobOrderId)
    ? params.jobOrderId[0]
    : params.jobOrderId

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  const handleSidebarToggle = (open: boolean) => {
    setIsSidebarOpen(open)
  }

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    const userData = localStorage.getItem("admin_user")
    if (userData) setUser(JSON.parse(userData))

    if (jobOrderId) {
      fetchJobOrderAndOrder(token)
    }
  }, [jobOrderId])

  const fetchJobOrderAndOrder = async (token: string) => {
    try {
      setIsLoading(true)
      setError("")

      const jobOrderResponse = await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!jobOrderResponse.ok) {
        throw new Error("Job order not found")
      }

      const jobOrderData = await jobOrderResponse.json()
      const jobOrder = jobOrderData.data || jobOrderData

      const userStr = localStorage.getItem("admin_user")
      const currentUser = userStr ? JSON.parse(userStr) : null
      const currentUserId = currentUser?.id

      if (jobOrder.assigned_to !== currentUserId && currentUser?.role !== "admin") {
        setError("You don't have permission to view this job order")
        setIsLoading(false)
        return
      }

      setJobOrder(jobOrder)

      if (jobOrder.order_id) {
        const orderResponse = await fetch(`${apiUrl}/admin/orders/${jobOrder.order_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (orderResponse.ok) {
          const orderData = await orderResponse.json()
          const order = orderData.data || orderData
          setOrder(order)
        }
      }
    } catch (err) {
      console.error("Error fetching job order:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateItemStatus = async (
    itemId: number,
    newStatus: "pending" | "ongoing" | "completed"
  ) => {
    const token = localStorage.getItem("admin_token")
    if (!token) return

    try {
      setUpdatingItemId(itemId)

      const response = await fetch(`${apiUrl}/admin/order-items/${itemId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update item status")
      }

      // ✅ Update UI instantly
      setOrder((prevOrder) => {
        if (!prevOrder || !prevOrder.items) return prevOrder

        return {
          ...prevOrder,
          items: prevOrder.items.map((item) =>
            item.id === itemId
              ? { ...item, status: newStatus }
              : item
          ),
        }
      })
    } catch (err) {
      console.error("Error updating item status:", err)
      alert("Failed to update item status")
    } finally {
      setUpdatingItemId(null)
    }
  }

  const formatCurrency = (value: number | string | null | undefined) => {
    const num = typeof value === "string" ? parseFloat(value) : value
    if (!num || isNaN(Number(num))) return "₱0.00"

    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(num))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-4">
          <ArrowLeft size={20} /> Back
        </button>

        <Card className="p-6 bg-red-100">
          <AlertCircle className="text-red-500 mb-2" />
          <p>{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />

        <main className="flex-1 p-4 md:p-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 mb-6">
            <ArrowLeft size={20} /> Back
          </button>

          <h1 className="text-2xl font-bold mb-4">{jobOrder?.job_order_number}</h1>

          {order?.items?.map((item) => (
            <Card key={item.id} className="p-4 mb-4">
              <p className="font-semibold">{item.description}</p>
              <p>
                Qty: {item.quantity} × {formatCurrency(item.unit_price)}
              </p>

              <div className="flex gap-2 mt-3">
                <Button onClick={() => handleUpdateItemStatus(item.id, "pending")} size="sm">
                  <Clock size={16} className="mr-1" /> Pending
                </Button>

                <Button onClick={() => handleUpdateItemStatus(item.id, "ongoing")} size="sm">
                  <Loader2 size={16} className="mr-1" /> Ongoing
                </Button>

                <Button onClick={() => handleUpdateItemStatus(item.id, "completed")} size="sm">
                  <CheckCircle size={16} className="mr-1" /> Completed
                </Button>
              </div>
            </Card>
          ))}
        </main>
      </div>
    </div>
  )
}