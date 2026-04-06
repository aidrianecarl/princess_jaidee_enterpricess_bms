"use client"

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
  quotation_id?: number
  customer_id: number
  assigned_to: number | AssignedUser
  start_date: string
  due_date: string
  completed_date?: string
  status: "pending" | "ongoing" | "completed"
  priority: "low" | "medium" | "high"
  notes?: string
  items?: JobOrderItem[]
  customer?: {
    id: number
    bill_to_name: string
    bill_to_email: string
    bill_to_phone?: string
  }
  assignedTo?: AssignedUser
}

export default function JobOrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [filterType, setFilterType] = useState<"all" | "my">("all")
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const handleSidebarToggle = (open: boolean) => {
    setIsSidebarOpen(open)
  }

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
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error("API Error")

      const data = await response.json()
      const jobOrders = Array.isArray(data) ? data : data.data || data

      setJobOrders(jobOrders)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(`Failed to load job orders: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ SAFE HELPERS (structure fix only)
  const getAssignedUserId = (assigned: any) => {
    return typeof assigned === "object" ? assigned?.id : assigned
  }

  const getAssignedUserName = (jobOrder: JobOrder) => {
    if (typeof jobOrder.assigned_to === "object") {
      return `${jobOrder.assigned_to.first_name} ${jobOrder.assigned_to.last_name}`
    }

    if (jobOrder.assignedTo) {
      return `${jobOrder.assignedTo.first_name} ${jobOrder.assignedTo.last_name}`
    }

    return "N/A"
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
      case "ongoing":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      default:
        return "bg-neutral-100 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
      case "medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"
      case "high":
        return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
      default:
        return "bg-neutral-50 dark:bg-neutral-900/20 text-neutral-700 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800"
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Job Orders</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage and track all job orders and their progress
              </p>
            </div>

            <div className="mb-8 flex flex-wrap gap-3">
              <Button onClick={() => setFilterType("all")}>
                All Jobs
              </Button>
              <Button onClick={() => setFilterType("my")}>
                My Jobs
              </Button>
            </div>

            {error && (
              <Card className="p-4 mb-6 bg-red-50">
                <AlertCircle />
                <p>{error}</p>
              </Card>
            )}

            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (() => {

              const filteredOrders = filterType === "my"
                ? jobOrders.filter(jo => getAssignedUserId(jo.assigned_to) === user?.id)
                : jobOrders

              return filteredOrders.length === 0 ? (
                <Card className="p-12 text-center">
                  <Package />
                  <p>No job orders found</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredOrders.map((jobOrder) => (
                    <Card key={jobOrder.id} className="p-4">

                      <h3>{jobOrder.job_order_number}</h3>

                      <span className={getStatusColor(jobOrder.status)}>
                        {jobOrder.status}
                      </span>

                      <p>Customer: {jobOrder.customer?.bill_to_name}</p>

                      <p>Assigned To: {getAssignedUserName(jobOrder)}</p>

                      <p>Start: {formatDate(jobOrder.start_date)}</p>
                      <p>Due: {formatDate(jobOrder.due_date)}</p>

                      <Button
                        onClick={() => {
                          const isAssigned = getAssignedUserId(jobOrder.assigned_to) === user?.id
                          const isAdmin = user?.role === "admin"

                          if (isAssigned || isAdmin) {
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
                  ))}
                </div>
              )
            })()}
          </div>
        </main>
      </div>
    </div>
  )
}