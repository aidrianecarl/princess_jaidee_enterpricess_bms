"use client"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, MapPin, DollarSign, Users, Loader2, CheckCircle, Clock } from "lucide-react"

interface SentQuotation {
  id: number
  quotation_number: string
  total: number
  status: string
  created_at: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items?: any[]
}

interface Employee {
  id: number
  name: string
  email: string
}

export default function OrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [sentQuotations, setSentQuotations] = useState<SentQuotation[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<{ [key: number]: number }>({})
  const [paymentType, setPaymentType] = useState<{ [key: number]: "downpayment" | "fullpayment" }>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

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
    fetchEmployees(token)
  }

  const fetchSentQuotations = async (token: string) => {
    try {
      setIsLoading(true)
      setError("")
      
      console.log("[v0] Fetching orders from:", `${apiUrl}/admin/quotations?status=sent`)
      console.log("[v0] Token exists:", !!token)
      
      const response = await fetch(`${apiUrl}/admin/quotations?status=sent`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response statusText:", response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API Error Response Body:", errorText)
        console.error("[v0] Error Details:", {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          body: errorText.substring(0, 500), // First 500 chars
        })
        throw new Error(`API Error ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      console.log("[v0] Content-Type:", contentType)
      
      const data = await response.json()
      console.log("[v0] Raw API Response:", data)
      
      const quotations = Array.isArray(data) ? data : (data.data || data)
      console.log("[v0] Quotations array:", quotations)
      console.log("[v0] Is array:", Array.isArray(quotations))
      console.log("[v0] Array length:", Array.isArray(quotations) ? quotations.length : 'N/A')
      
      // Filter only sent status quotations
      const sent = Array.isArray(quotations) 
        ? quotations.filter((q: any) => {
            console.log("[v0] Checking quotation:", { id: q?.id, status: q?.status })
            return q && q.status === "sent"
          })
        : []
      
      console.log("[v0] Final filtered sent quotations:", sent)
      console.log("[v0] Sent count:", sent.length)
      setSentQuotations(sent)
    } catch (err) {
      console.error("[v0] Error fetching quotations:", err)
      if (err instanceof Error) {
        console.error("[v0] Error message:", err.message)
        console.error("[v0] Error stack:", err.stack)
      }
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`Failed to load orders: ${errorMessage}`)
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

  const handleSaveOrder = async (quotationId: number) => {
    if (!selectedEmployees[quotationId]) {
      alert("Please select an employee to assign this order")
      return
    }

    try {
      setSavingId(quotationId)
      const token = localStorage.getItem("admin_token")

      const response = await fetch(`${apiUrl}/admin/job-orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotation_id: quotationId,
          assigned_to: selectedEmployees[quotationId],
          customer_id: 1, // This should be from quotation data
          payment_type: paymentType[quotationId] || "downpayment",
          start_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
        }),
      })

      if (!response.ok) throw new Error("Failed to save order")

      alert("Order scheduled successfully!")
      setExpandedOrder(null)
      
      // Remove from pending list
      setSentQuotations(sentQuotations.filter(q => q.id !== quotationId))
    } catch (err) {
      console.error("[v0] Error saving order:", err)
      alert("Failed to schedule order. Please try again.")
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

  return (
    <div className="flex h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-neutral-900">Sales & Orders</h1>
            <p className="text-neutral-600">Manage sent quotations, payments, and employee assignments</p>
          </div>

          {error && (
            <Card className="mb-6 p-4 bg-red-50 border-red-200">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="animate-spin mr-2" />
              <p>Loading orders...</p>
            </div>
          ) : sentQuotations.length === 0 ? (
            <Card className="p-12 text-center bg-white">
              <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 font-medium">No pending orders</p>
              <p className="text-sm text-neutral-500 mt-2">Sent quotations will appear here</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sentQuotations.map((quotation) => (
                <Card key={quotation.id} className="overflow-hidden hover:shadow-lg transition">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-neutral-900">
                            {quotation.quotation_number}
                          </h3>
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-3">
                          Customer: <span className="font-semibold">{quotation.customer?.name}</span>
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock size={16} className="text-neutral-400" />
                            <span>{formatDate(quotation.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText size={16} className="text-neutral-400" />
                            <span>{quotation.items?.length || 0} items</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} className="text-neutral-400" />
                            <span className="font-semibold">{formatCurrency(quotation.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {expandedOrder === quotation.id && (
                      <div className="border-t pt-6 animate-slideIn">
                        <div className="space-y-4 mb-6">
                          {/* Payment Type Selection */}
                          <div>
                            <label className="block text-sm font-semibold text-neutral-900 mb-3">
                              Payment Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => setPaymentType({ ...paymentType, [quotation.id]: "downpayment" })}
                                className={`p-3 rounded-lg border-2 transition text-sm font-semibold ${
                                  paymentType[quotation.id] === "downpayment"
                                    ? "border-red-500 bg-red-50 text-red-700"
                                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                                }`}
                              >
                                Down Payment
                              </button>
                              <button
                                onClick={() => setPaymentType({ ...paymentType, [quotation.id]: "fullpayment" })}
                                className={`p-3 rounded-lg border-2 transition text-sm font-semibold ${
                                  paymentType[quotation.id] === "fullpayment"
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                                }`}
                              >
                                Full Payment
                              </button>
                            </div>
                          </div>

                          {/* Employee Selection */}
                          <div>
                            <label className="block text-sm font-semibold text-neutral-900 mb-3">
                              Assign to Employee
                            </label>
                            <select
                              value={selectedEmployees[quotation.id] || ""}
                              onChange={(e) =>
                                setSelectedEmployees({
                                  ...selectedEmployees,
                                  [quotation.id]: parseInt(e.target.value),
                                })
                              }
                              className="w-full p-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 text-neutral-900"
                            >
                              <option value="">-- Select Employee --</option>
                              {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.name} ({emp.email})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Customer Info */}
                          <div className="bg-neutral-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-neutral-900 mb-3">Customer Information</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-semibold">Email:</span> {quotation.customer?.email}</p>
                              <p><span className="font-semibold">Phone:</span> {quotation.customer?.phone || "N/A"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleSaveOrder(quotation.id)}
                            disabled={savingId === quotation.id}
                            className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 text-white hover:shadow-lg"
                          >
                            {savingId === quotation.id ? (
                              <>
                                <Loader2 size={16} className="animate-spin mr-2" />
                                Scheduling...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={16} className="mr-2" />
                                Schedule Order
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => setExpandedOrder(null)}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Toggle Button */}
                    {expandedOrder !== quotation.id && (
                      <Button
                        onClick={() => setExpandedOrder(quotation.id)}
                        variant="outline"
                        className="w-full"
                      >
                        Set Payment & Assign Employee
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
