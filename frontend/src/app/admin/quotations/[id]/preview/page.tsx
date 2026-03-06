"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowLeft, Download, Printer, Loader2, Calendar, CheckCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { AdminLayout } from "@/components/admin/admin-layout"

interface QuotationData {
  id: number
  quotation_number: string
  customer_id: number
  customer?: {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    address: string
  }
  logo_url?: string
  business_name?: string
  business_address?: string
  business_phone?: string
  business_email?: string
  items: any[]
  total: number
  subtotal: number
  created_at: string
  status: string
  notes?: string
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
}

export default function AdminQuotationPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const quotationId = params.id as string
  const [quotation, setQuotation] = useState<QuotationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [scheduleData, setScheduleData] = useState({
    assigned_to: "",
    start_date: "",
    due_date: "",
  })
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchQuotation()
    fetchEmployees()
  }, [quotationId])

  const fetchQuotation = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.admin().get(`/admin/quotations/${quotationId}`)
      setQuotation(response.data)
    } catch (error) {
      console.error("Error fetching quotation:", error)
      toast({
        title: "Error",
        description: "Failed to load quotation",
        variant: "destructive",
      })
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.admin().get("/users?user_type=employee")
      const data = Array.isArray(response.data) ? response.data : response.data.data || []
      setEmployees(data.filter((user: any) => user.user_type === "employee"))
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 500)
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      const element = printRef.current
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`${quotation?.quotation_number}.pdf`)

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleScheduleJobOrder = async () => {
    if (!scheduleData.assigned_to || !scheduleData.start_date || !scheduleData.due_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsScheduling(true)
      await apiClient.admin().post("/admin/job-orders", {
        quotation_id: quotationId,
        assigned_to: scheduleData.assigned_to,
        start_date: scheduleData.start_date,
        due_date: scheduleData.due_date,
        customer_id: quotation?.customer_id,
      })

      // Update quotation status to approved
      await apiClient.admin().put(`/admin/quotations/${quotationId}/status`, {
        status: "approved",
      })

      toast({
        title: "Success",
        description: "Job order created and quotation approved",
      })

      setShowScheduleModal(false)
      fetchQuotation()
    } catch (error) {
      console.error("Error scheduling job order:", error)
      toast({
        title: "Error",
        description: "Failed to schedule job order",
        variant: "destructive",
      })
    } finally {
      setIsScheduling(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading quotation...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!quotation) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Quotation not found</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 print:bg-white">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Preview Quotation</h1>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-lg transition hover:scale-105 active:scale-95"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            ref={printRef}
            className="bg-white dark:bg-neutral-900 shadow-2xl rounded-xl p-8 print:shadow-none print:rounded-none print:p-0 animate-scale-in"
          >
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-neutral-200 dark:border-neutral-800">
              <div className="flex gap-4 items-start flex-1">
                {quotation.logo_url && (
                  <img
                    src={quotation.logo_url || "/placeholder.svg"}
                    alt="Business Logo"
                    className="h-16 w-16 object-contain rounded-lg"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {quotation.business_name || "Princess Jaidee Enterprises"}
                  </h2>
                  {quotation.business_address && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{quotation.business_address}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {quotation.business_phone && <p>{quotation.business_phone}</p>}
                    {quotation.business_email && <p>{quotation.business_email}</p>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white">Quotation</h3>
                <p className="text-xl text-neutral-600 dark:text-neutral-400">{quotation.quotation_number}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  {new Date(quotation.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* From/To Section */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b-2 border-neutral-200 dark:border-neutral-800">
              <div>
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-3 uppercase text-sm">From:</h4>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {quotation.business_name || "Princess Jaidee Enterprises"}
                </p>
                {quotation.business_address && (
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-2">{quotation.business_address}</p>
                )}
              </div>
              <div>
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-3 uppercase text-sm">Bill To:</h4>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {quotation.customer?.first_name} {quotation.customer?.last_name}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-2">{quotation.customer?.email}</p>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">{quotation.customer?.phone_number}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-4 text-lg">Items</h4>
              <div className="border-2 border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-700 dark:to-orange-600 text-white">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Item</th>
                      <th className="text-center px-4 py-3 font-semibold">Qty</th>
                      <th className="text-right px-4 py-3 font-semibold">Unit Price</th>
                      <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items?.map((item, index) => (
                      <tr
                        key={item.id}
                        className={
                          index % 2 === 0 ? "bg-neutral-50 dark:bg-neutral-800" : "bg-white dark:bg-neutral-900"
                        }
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">
                              {item.product?.name || item.service?.name}
                            </p>
                            {item.description && (
                              <p className="text-xs text-neutral-600 dark:text-neutral-400">{item.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-neutral-700 dark:text-neutral-300">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-700 dark:text-neutral-300">
                          ₱{Number.parseFloat(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-neutral-900 dark:text-white">
                          ₱{(item.quantity * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-80">
                <div className="bg-gradient-to-br from-red-50 dark:from-red-900/20 to-orange-50 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-6">
                  <div className="flex justify-between mb-3 text-neutral-700 dark:text-neutral-300">
                    <span className="font-semibold">Subtotal:</span>
                    <span className="font-semibold">
                      ₱{Number.parseFloat(quotation.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t-2 border-red-300 dark:border-red-600 pt-3 flex justify-between">
                    <span className="text-xl font-bold text-neutral-900 dark:text-white">Total:</span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ₱{Number.parseFloat(quotation.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center px-4 py-8 print:hidden flex-wrap">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-700 text-white font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
            Print
          </button>
          {quotation.status === "pending_approval" && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-700 transition hover:scale-105 active:scale-95"
            >
              <Calendar size={18} />
              Schedule as Job Order
            </button>
          )}
        </div>

        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-md w-full animate-scale-in">
              <div className="border-b border-neutral-200 dark:border-neutral-800 p-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Schedule Job Order</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Convert this quotation to a job order
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Assign To Employee
                  </label>
                  <select
                    value={scheduleData.assigned_to}
                    onChange={(e) => setScheduleData({ ...scheduleData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select an employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name} ({employee.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={scheduleData.start_date}
                    onChange={(e) => setScheduleData({ ...scheduleData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={scheduleData.due_date}
                    onChange={(e) => setScheduleData({ ...scheduleData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 p-6 flex gap-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleJobOrder}
                  disabled={isScheduling}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isScheduling ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  {isScheduling ? "Scheduling..." : "Schedule"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
