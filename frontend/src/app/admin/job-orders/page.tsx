"use client"

import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react"

interface JobOrderItem {
  id: number
  job_order_id: number
  description: string
  quantity: number
  unit_price: string | number
  line_total: string | number
  completed: boolean
  completed_at?: string
}

interface AssignedUser {
  id: number
  first_name: string
  last_name: string
  email: string
}

interface JobOrder {
  id: number
  job_order_number: string
  customer_id: number
  assigned_to: number | AssignedUser
  start_date: string
  due_date: string
  status: "pending" | "ongoing" | "completed"
  priority: "low" | "medium" | "high"
  items?: JobOrderItem[]
  customer?: {
    bill_to_name: string
    bill_to_email: string
    bill_to_phone?: string
  }
}

export default function JobOrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [filterType, setFilterType] = useState<"all" | "my">("all")
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [savingItemId, setSavingItemId] = useState<number | null>(null)

  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    const userData = localStorage.getItem("admin_user")
    if (userData) setUser(JSON.parse(userData))

    fetchJobOrders(token)
  }, [])

  const fetchJobOrders = async (token: string) => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`${apiUrl}/admin/job-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      const jobOrders = Array.isArray(data) ? data : data.data || data

      setJobOrders(jobOrders)
    } catch (err) {
      setError("Failed to load job orders")
    } finally {
      setIsLoading(false)
    }
  }

  const getAssignedUserId = (assigned: any) => {
    if (!assigned) return null
    return typeof assigned === "object" ? assigned.id : assigned
  }

  const getAssignedUserName = (assigned: any) => {
    if (!assigned) return "N/A"
    return typeof assigned === "object"
      ? `${assigned.first_name} ${assigned.last_name}`
      : "User #" + assigned
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    if (status === "pending") return "bg-yellow-200"
    if (status === "ongoing") return "bg-blue-200"
    if (status === "completed") return "bg-green-200"
    return "bg-gray-200"
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />

        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">Job Orders</h1>

          {/* Filter */}
          <div className="mb-4">
            <Button onClick={() => setFilterType("all")}>All</Button>
            <Button onClick={() => setFilterType("my")} className="ml-2">
              My Jobs
            </Button>
          </div>

          {error && (
            <Card className="p-4 bg-red-100">
              <AlertCircle />
              <p>{error}</p>
            </Card>
          )}

          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            jobOrders
              .filter((jo) =>
                filterType === "my"
                  ? getAssignedUserId(jo.assigned_to) === user?.id
                  : true
              )
              .map((jobOrder) => (
                <Card key={jobOrder.id} className="p-4 mb-4">
                  <h2 className="font-bold">{jobOrder.job_order_number}</h2>

                  <p>Status:</p>
                  <span className={`px-2 py-1 ${getStatusColor(jobOrder.status)}`}>
                    {jobOrder.status}
                  </span>

                  <p>Customer: {jobOrder.customer?.bill_to_name}</p>
                  <p>Assigned: {getAssignedUserName(jobOrder.assigned_to)}</p>

                  <p>Start: {formatDate(jobOrder.start_date)}</p>
                  <p>Due: {formatDate(jobOrder.due_date)}</p>

                  <Button
                    onClick={() => {
                      const isAllowed =
                        getAssignedUserId(jobOrder.assigned_to) === user?.id ||
                        user?.role === "admin"

                      if (isAllowed) {
                        router.push(`/admin/job-orders/${jobOrder.id}/orders`)
                      }
                    }}
                    disabled={
                      getAssignedUserId(jobOrder.assigned_to) !== user?.id &&
                      user?.role !== "admin"
                    }
                  >
                    View Orders
                  </Button>
                </Card>
              ))
          )}
        </main>
      </div>
    </div>
  )
}