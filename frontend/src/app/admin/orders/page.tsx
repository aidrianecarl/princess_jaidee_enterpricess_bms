"use client"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { SetPaymentModal } from "@/components/admin/modals/set-payment-modal"
import { ViewItemsModal } from "@/components/admin/modals/view-items-modal"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, MapPin, DollarSign, Users, Loader2, CheckCircle, Clock, Eye, Settings } from "lucide-react"

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
  const [savingId, setSavingId] = useState<number | null>(null)
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  
  // Modal states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [viewItemsModalOpen, setViewItemsModalOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<SentQuotation | null>(null)

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

  const handleSaveOrder = async (paymentType: "downpayment" | "fullpayment", employeeId: number, formData: any) => {
    if (!selectedQuotation) return

    try {
      setSavingId(selectedQuotation.id)
      const token = localStorage.getItem("admin_token")

      // Calculate paid amount
      let paidAmount = 0
      if (paymentType === "fullpayment") {
        paidAmount = selectedQuotation.total
      } else if (formData.downPaymentInput) {
        paidAmount = parseFloat(formData.downPaymentInput)
      }

      console.log("[v0] Creating job order with data:", {
        quotation_id: selectedQuotation.id,
        assigned_to: employeeId,
        customer_id: selectedQuotation.customer?.id || 1,
        payment_type: paymentType,
        paid_amount: paidAmount,
        start_date: formData.startDate,
        due_date: formData.dueDate,
        priority: formData.priority,
        notes: formData.notes,
      })

      // First, update the quotation with paid_amount and status
      const quotationUpdateResponse = await fetch(
        `${apiUrl}/admin/quotations/${selectedQuotation.id}`,
        {
          method: "PUT",
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
        console.error("[v0] Failed to update quotation paid_amount")
      }

      // Then create the job order
      const jobOrderResponse = await fetch(`${apiUrl}/admin/job-orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotation_id: selectedQuotation.id,
          assigned_to: employeeId,
          customer_id: selectedQuotation.customer?.id || 1,
          payment_type: paymentType,
          paid_amount: paidAmount,
          start_date: formData.startDate,
          due_date: formData.dueDate,
          priority: formData.priority,
          notes: formData.notes,
        }),
      })

      if (!jobOrderResponse.ok) {
        const errorData = await jobOrderResponse.json()
        throw new Error(errorData.message || "Failed to create job order")
      }

      console.log("[v0] Job order created successfully")

      // Remove from pending list
      setSentQuotations(sentQuotations.filter(q => q.id !== selectedQuotation.id))
      setSelectedQuotation(null)
      setPaymentModalOpen(false)
    } catch (err) {
      console.error("[v0] Error saving order:", err)
      throw err
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
                <Card key={quotation.id} className="overflow-hidden hover:shadow-lg transition bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <div className="p-4 md:p-6">
                    {/* Header with flex layout */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                            {quotation.quotation_number}
                          </h3>
                          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-semibold">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                          Customer: <span className="font-semibold text-neutral-900 dark:text-white">{quotation.customer?.name}</span>
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock size={16} className="text-neutral-400 dark:text-neutral-500" />
                            <span className="text-neutral-600 dark:text-neutral-400">{formatDate(quotation.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText size={16} className="text-neutral-400 dark:text-neutral-500" />
                            <span className="text-neutral-600 dark:text-neutral-400">{quotation.items?.length || 0} items</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} className="text-neutral-400 dark:text-neutral-500" />
                            <span className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(quotation.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 min-w-max">
                        <Button
                          onClick={() => {
                            setSelectedQuotation(quotation)
                            setViewItemsModalOpen(true)
                          }}
                          variant="outline"
                          className="flex items-center justify-center gap-2 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          title="View Items"
                        >
                          <Eye size={18} />
                          <span className="hidden sm:inline">Items</span>
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedQuotation(quotation)
                            setPaymentModalOpen(true)
                          }}
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg"
                          title="Set Payment & Assign Employee"
                        >
                          <Settings size={18} />
                          <span className="hidden sm:inline">Set Payment</span>
                        </Button>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg mt-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 text-sm">Customer Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-1">Email</p>
                          <p className="font-medium text-neutral-900 dark:text-white break-all">{quotation.customer?.email}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-1">Phone</p>
                          <p className="font-medium text-neutral-900 dark:text-white">{quotation.customer?.phone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 dark:text-neutral-400 text-xs mb-1">Total Amount</p>
                          <p className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(quotation.total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
          <ViewItemsModal
            isOpen={viewItemsModalOpen}
            onOpenChange={setViewItemsModalOpen}
            quotation={selectedQuotation}
          />
        </main>
      </div>
    </div>
  )
}
