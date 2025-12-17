"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Save, Eye, Settings, Loader2, Printer, Mail, X, Upload, Plus, Trash2, Download } from "lucide-react"
import { ProductSelectorModal } from "./product-selector-modal"
import { ServiceSelectorModal } from "./service-selector-modal"
import { quotationFormSchema } from "@/lib/validations/quotation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LineItem {
  id: string
  type: "product" | "service"
  productId?: number
  serviceId?: number
  name: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  image?: string
}

interface FormData {
  clientName: string
  clientAddress: string
  clientCity: string
  clientState: string
  clientPostal: string
  clientPhone: string
  clientEmail: string
  businessName: string
  businessAddress: string
  businessCity: string
  businessState: string
  businessPostal: string
  businessPhone: string
  businessEmail: string
  quoteNumber: string
  quoteDate: string
  dueDate: string
  logo?: File
}

interface QuotationDocumentProps {
  existingQuotation?: any
}

export function QuotationDocumentV2({ existingQuotation }: QuotationDocumentProps) {
  const [formData, setFormData] = useState<FormData>({
    clientName: "",
    clientAddress: "",
    clientCity: "",
    clientState: "",
    clientPostal: "",
    clientPhone: "",
    clientEmail: "",
    businessName: "Princess Jaidee",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessPostal: "",
    businessPhone: "",
    businessEmail: "",
    quoteNumber: `QT-${new Date().getTime()}`,
    quoteDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [showProductModal, setShowProductModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const isEditMode = !!existingQuotation

  useEffect(() => {
    if (existingQuotation) {
      // Populate form with existing quotation data
      const customer = existingQuotation.customer || {}
      setFormData({
        clientName: customer.company_name || "",
        clientAddress: customer.address || "",
        clientCity: customer.city || "",
        clientState: customer.province || "",
        clientPostal: customer.zip_code || "",
        clientPhone: customer.phone_number || "",
        clientEmail: customer.email || "",
        businessName: existingQuotation.business_name || "Princess Jaidee",
        businessAddress: existingQuotation.business_address || "",
        businessCity: existingQuotation.business_city || "",
        businessState: existingQuotation.business_state || "",
        businessPostal: existingQuotation.business_postal || "",
        businessPhone: existingQuotation.business_phone || "",
        businessEmail: existingQuotation.business_email || "",
        quoteNumber: existingQuotation.quotation_number,
        quoteDate: existingQuotation.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        dueDate:
          existingQuotation.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      })

      // Populate line items
      const items = (existingQuotation.items || []).map((item: any) => ({
        id: item.id.toString(),
        type: item.product_id ? "product" : "service",
        productId: item.product_id,
        serviceId: item.service_id,
        name: item.product?.name || item.service?.name || "",
        description: item.description || item.product?.description || item.service?.description || "",
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        amount: Number(item.line_total),
        image: item.product?.image_url || item.service?.image_url,
      }))
      setLineItems(items)

      if (existingQuotation.logo_url) {
        setLogoPreview(existingQuotation.logo_url)
      }
    }

    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [existingQuotation])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, logo: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const subtotal = calculateSubtotal()
  const totalDue = subtotal

  const validateForm = () => {
    const formDataWithItems = {
      ...formData,
      lineItems: lineItems.map((item) => ({
        type: item.type,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    }

    const result = quotationFormSchema.safeParse(formDataWithItems)
    if (!result.success && result.error?.errors) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach((error) => {
        newErrors[error.path.join(".")] = error.message
      })
      setErrors(newErrors)
      return false
    }
    setErrors({})
    return true
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields before saving",
        variant: "destructive",
      })
      return
    }
    setShowConfirmDialog(true)
  }

  const handlePreview = () => {
    if (lineItems.length === 0) {
      toast({
        title: "No Items",
        description: "Add at least one product or service to preview",
        variant: "destructive",
      })
      return
    }
    setShowPreviewModal(true)
  }

  const handlePrint = () => {
    if (lineItems.length === 0) {
      toast({
        title: "No Items",
        description: "Add at least one product or service to print",
        variant: "destructive",
      })
      return
    }
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 500)
  }

  const handleDownloadPDF = async () => {
    if (lineItems.length === 0) {
      toast({
        title: "No Items",
        description: "Add at least one product or service to download",
        variant: "destructive",
      })
      return
    }

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
      pdf.save(`${formData.quoteNumber}.pdf`)

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      })
    } catch (error) {
      console.error("[v0] PDF generation error:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSend = () => {
    if (lineItems.length === 0) {
      toast({
        title: "No Items",
        description: "Add at least one product or service to send",
        variant: "destructive",
      })
      return
    }
    setShowSendModal(true)
  }

  const confirmSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to save quotations",
          variant: "destructive",
        })
        return
      }

      const formDataToSend = new FormData()

      // Add customer fields
      formDataToSend.append("customer_name", formData.clientName)
      formDataToSend.append("customer_email", formData.clientEmail || "")
      formDataToSend.append("customer_phone", formData.clientPhone || "")
      formDataToSend.append("customer_address", formData.clientAddress || "")
      formDataToSend.append("customer_city", formData.clientCity || "")
      formDataToSend.append("customer_province", formData.clientState || "")
      formDataToSend.append("customer_zip_code", formData.clientPostal || "")

      // Add business fields
      formDataToSend.append("business_name", formData.businessName)
      formDataToSend.append("business_address", formData.businessAddress || "")
      formDataToSend.append("business_city", formData.businessCity || "")
      formDataToSend.append("business_state", formData.businessState || "")
      formDataToSend.append("business_postal", formData.businessPostal || "")
      formDataToSend.append("business_phone", formData.businessPhone || "")
      formDataToSend.append("business_email", formData.businessEmail || "")

      // Add logo if exists
      if (formData.logo) {
        formDataToSend.append("logo", formData.logo)
      }

      // Add other fields
      formDataToSend.append("notes", "")
      formDataToSend.append("valid_until", formData.dueDate || "")

      // Add items as JSON string
      const itemsPayload = lineItems.map((item) => ({
        product_id: item.type === "product" ? item.productId : null,
        service_id: item.type === "service" ? item.serviceId : null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        customization: item.description,
      }))
      formDataToSend.append("items", JSON.stringify(itemsPayload))

      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/quotations/${existingQuotation.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/quotations`

      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: `Quotation ${data.quotation?.quotation_number || formData.quoteNumber} ${isEditMode ? "updated" : "saved"} as draft`,
        })
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1500)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || `Failed to ${isEditMode ? "update" : "save"} quotation`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Save error:", error)
      toast({
        title: "Error",
        description: "An error occurred while saving",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setShowConfirmDialog(false)
    }
  }

  const addLineItem = (item: Omit<LineItem, "id" | "amount">) => {
    const amount = item.quantity * item.unitPrice
    setLineItems([
      ...lineItems,
      {
        ...item,
        id: Date.now().toString(),
        amount,
      },
    ])
    setShowProductModal(false)
    setShowServiceModal(false)
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id))
  }

  const updateLineItemQuantity = (id: string, quantity: number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
              amount: quantity * item.unitPrice,
            }
          : item,
      ),
    )
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading quotation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="sticky top-16 z-40 bg-gradient-to-r from-red-600 to-orange-500 shadow-lg print:hidden pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-red-600 font-semibold rounded-lg transition transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span className="hidden sm:inline">{isEditMode ? "Update" : "Save Draft"}</span>
              </button>
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-red-600 font-semibold rounded-lg transition transform hover:scale-105 shadow-md cursor-pointer"
              >
                <Eye size={18} />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-red-600 font-semibold rounded-lg transition transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSend}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-red-600 font-semibold rounded-lg transition transform hover:scale-105 shadow-md cursor-pointer"
              >
                <Mail size={18} />
                <span className="hidden sm:inline">Send</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-red-600 font-semibold rounded-lg transition transform hover:scale-105 shadow-md cursor-pointer"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          ref={printRef}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
        >
          {/* Document Header */}
          <div className="p-8 border-b-4 border-red-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo Section */}
              <div className="flex flex-col items-center justify-center md:col-span-1">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Company Logo"
                      className="w-32 h-32 object-contain rounded-lg border-2 border-red-200"
                    />
                    <button
                      onClick={() => {
                        setLogoPreview("")
                        setFormData({ ...formData, logo: undefined })
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-32 border-2 border-dashed border-red-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500 transition group bg-gradient-to-br from-red-50 to-orange-50">
                    <div className="text-center">
                      <Upload size={24} className="text-red-400 mx-auto mb-2 group-hover:text-red-600 transition" />
                      <p className="text-xs text-gray-600 font-medium">Your Logo</p>
                    </div>
                    <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                  </label>
                )}
              </div>

              {/* Business Info & Quote Header */}
              <div className="md:col-span-2">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-gray-900 mb-1">
                    <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                      Quote
                    </span>
                  </h1>
                  <div className="h-1 w-24 bg-gradient-to-r from-red-600 to-orange-500 rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Quote No.</p>
                    <input
                      type="text"
                      value={formData.quoteNumber}
                      onChange={(e) => setFormData({ ...formData, quoteNumber: e.target.value })}
                      className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-red-200 focus:border-red-600 outline-none transition w-full"
                      disabled={isEditMode}
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Date</p>
                    <input
                      type="date"
                      value={formData.quoteDate}
                      onChange={(e) => setFormData({ ...formData, quoteDate: e.target.value })}
                      className="text-lg font-semibold text-gray-900 bg-transparent border-b-2 border-red-200 focus:border-red-600 outline-none transition w-full text-right"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Business Name"
                    className={`font-bold text-gray-900 w-full bg-transparent border-b ${errors.businessName ? "border-red-500" : "border-red-300"} focus:border-red-600 outline-none transition mb-2`}
                  />
                  {errors.businessName && <p className="text-xs text-red-500 mb-2">{errors.businessName}</p>}
                  <input
                    type="text"
                    value={formData.businessAddress}
                    onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                    placeholder="Address Line 1"
                    className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.businessAddress ? "border-red-500" : "border-red-200"} focus:border-red-600 outline-none transition mb-2`}
                  />
                  {errors.businessAddress && <p className="text-xs text-red-500 mb-2">{errors.businessAddress}</p>}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <input
                        type="text"
                        value={formData.businessCity}
                        onChange={(e) => setFormData({ ...formData, businessCity: e.target.value })}
                        placeholder="City"
                        className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.businessCity ? "border-red-500" : "border-red-200"} focus:border-red-600 outline-none transition`}
                      />
                      {errors.businessCity && <p className="text-xs text-red-500">{errors.businessCity}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.businessState}
                        onChange={(e) => setFormData({ ...formData, businessState: e.target.value })}
                        placeholder="State"
                        className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.businessState ? "border-red-500" : "border-red-200"} focus:border-red-600 outline-none transition`}
                      />
                      {errors.businessState && <p className="text-xs text-red-500">{errors.businessState}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.businessPostal}
                        onChange={(e) => setFormData({ ...formData, businessPostal: e.target.value })}
                        placeholder="Postal"
                        className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.businessPostal ? "border-red-500" : "border-red-200"} focus:border-red-600 outline-none transition`}
                      />
                      {errors.businessPostal && <p className="text-xs text-red-500">{errors.businessPostal}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <input
                        type="tel"
                        value={formData.businessPhone}
                        onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                        placeholder="Phone"
                        className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.businessPhone ? "border-red-500" : "border-red-200"} focus:border-red-600 outline-none transition`}
                      />
                      {errors.businessPhone && <p className="text-xs text-red-500">{errors.businessPhone}</p>}
                    </div>
                    <div>
                      <input
                        type="email"
                        value={formData.businessEmail}
                        onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                        placeholder="Email"
                        className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.businessEmail ? "border-red-500" : "border-red-200"} focus:border-red-600 outline-none transition`}
                      />
                      {errors.businessEmail && <p className="text-xs text-red-500">{errors.businessEmail}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="p-8 border-b-2 border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Bill To</p>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Client Name"
                  className={`font-semibold text-gray-900 w-full bg-transparent border-b ${errors.clientName ? "border-red-500" : "border-gray-300"} focus:border-red-600 outline-none transition mb-2`}
                />
                {errors.clientName && <p className="text-xs text-red-500 mb-2">{errors.clientName}</p>}
                <input
                  type="text"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  placeholder="Street Address"
                  className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.clientAddress ? "border-red-500" : "border-gray-200"} focus:border-red-600 outline-none transition mb-2`}
                />
                {errors.clientAddress && <p className="text-xs text-red-500 mb-2">{errors.clientAddress}</p>}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <input
                      type="text"
                      value={formData.clientCity}
                      onChange={(e) => setFormData({ ...formData, clientCity: e.target.value })}
                      placeholder="City"
                      className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.clientCity ? "border-red-500" : "border-gray-200"} focus:border-red-600 outline-none transition`}
                    />
                    {errors.clientCity && <p className="text-xs text-red-500">{errors.clientCity}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.clientState}
                      onChange={(e) => setFormData({ ...formData, clientState: e.target.value })}
                      placeholder="State"
                      className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.clientState ? "border-red-500" : "border-gray-200"} focus:border-red-600 outline-none transition`}
                    />
                    {errors.clientState && <p className="text-xs text-red-500">{errors.clientState}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.clientPostal}
                      onChange={(e) => setFormData({ ...formData, clientPostal: e.target.value })}
                      placeholder="Postal"
                      className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.clientPostal ? "border-red-500" : "border-gray-200"} focus:border-red-600 outline-none transition`}
                    />
                    {errors.clientPostal && <p className="text-xs text-red-500">{errors.clientPostal}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      placeholder="Phone"
                      className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.clientPhone ? "border-red-500" : "border-gray-200"} focus:border-red-600 outline-none transition`}
                    />
                    {errors.clientPhone && <p className="text-xs text-red-500">{errors.clientPhone}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      placeholder="Email"
                      className={`text-sm text-gray-700 w-full bg-transparent border-b ${errors.clientEmail ? "border-red-500" : "border-gray-200"} focus:border-red-600 outline-none transition`}
                    />
                    {errors.clientEmail && <p className="text-xs text-red-500">{errors.clientEmail}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Due Date</p>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={`text-lg font-semibold text-gray-900 bg-transparent border-b-2 ${errors.dueDate ? "border-red-500" : "border-gray-300"} focus:border-red-600 outline-none transition w-full`}
                  />
                  {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              Items
              <span className="text-sm font-normal text-gray-500">
                ({lineItems.length} {lineItems.length === 1 ? "item" : "items"})
              </span>
            </h2>

            <div className="mb-6">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-3 mb-3 pb-3 border-b-2 border-gray-300 font-semibold text-gray-700 print:hidden">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Body */}
              {lineItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">No items added yet</p>
                  <p className="text-sm">Add products or services to get started</p>
                  {errors.lineItems && <p className="text-sm text-red-500 mt-2">{errors.lineItems}</p>}
                </div>
              ) : (
                lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 mb-4 pb-4 border-b border-gray-200">
                    {/* Description Column */}
                    <div className="col-span-5 flex gap-3">
                      {item.image && (
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded border border-gray-200"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>

                    {/* Quantity Column - Editable */}
                    <div className="col-span-2 flex items-center justify-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItemQuantity(item.id, Math.max(1, Number.parseInt(e.target.value) || 1))
                        }
                        className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center focus:border-red-600 outline-none transition print:border-0 print:bg-transparent print:text-gray-900"
                      />
                    </div>

                    {/* Unit Price Column - Fixed */}
                    <div className="col-span-2 flex items-center justify-end">
                      <input
                        type="text"
                        value={`₱${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        disabled
                        className="w-full px-3 py-2 text-right bg-gray-100 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 cursor-not-allowed print:bg-transparent print:border-0 print:text-gray-900"
                        title="Unit price is fixed from product/service"
                      />
                    </div>

                    {/* Amount Column */}
                    <div className="col-span-2 flex items-center justify-end">
                      <p className="font-bold text-gray-900">
                        ₱{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Actions Column */}
                    <div className="col-span-1 flex items-center justify-center print:hidden">
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Items Buttons */}
            <div className="flex gap-3 mb-8 print:hidden">
              <button
                onClick={() => setShowProductModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-600 transition shadow-lg"
              >
                <Plus size={20} />
                Add Product
              </button>
              <button
                onClick={() => setShowServiceModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition shadow-lg"
              >
                <Plus size={20} />
                Add Service
              </button>
            </div>
          </div>

          {/* Totals Section */}
          <div className="px-8 pb-8 flex justify-end">
            <div className="w-full md:w-96">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-6">
                <div className="flex justify-between items-center mb-3 pb-3 border-b-2 border-red-200">
                  <span className="text-gray-700 font-semibold">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                    ₱{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center italic">
                * Discounts and payment terms will be applied by admin after approval
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selector Modal */}
      <ProductSelectorModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelect={(product) => {
          addLineItem({
            type: "product",
            productId: product.id,
            name: product.name,
            description: product.description || "",
            quantity: 1,
            unitPrice: product.base_price,
            image: product.image_url,
          })
        }}
      />

      {/* Service Selector Modal */}
      <ServiceSelectorModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSelect={(service) => {
          addLineItem({
            type: "service",
            serviceId: service.id,
            name: service.name,
            description: service.description || "",
            quantity: 1,
            unitPrice: service.base_price,
            image: service.image_url,
          })
        }}
      />

      {/* Preview Modal - Full Screen with Zoom */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-red-600 to-orange-500">
              <DialogTitle className="text-2xl font-bold text-white">Preview Quotation</DialogTitle>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-red-600 font-semibold rounded-lg transition"
              >
                <X size={18} />
                Exit Preview
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    {logoPreview && (
                      <img
                        src={logoPreview || "/placeholder.svg"}
                        alt="Company Logo"
                        className="w-24 h-24 object-contain mb-4"
                      />
                    )}
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">Quotation</h3>
                    <p className="text-xl text-gray-600">{formData.quoteNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Date:</span> {new Date(formData.quoteDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Valid Until:</span>{" "}
                      {new Date(formData.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b-2 border-gray-200">
                  <div>
                    <h4 className="font-bold text-red-600 mb-3 uppercase text-sm">From:</h4>
                    <p className="text-lg font-semibold text-gray-900">{formData.businessName}</p>
                    <p className="text-gray-600 text-sm mt-2">{formData.businessAddress}</p>
                    <p className="text-gray-600 text-sm">
                      {formData.businessCity}, {formData.businessState} {formData.businessPostal}
                    </p>
                    <p className="text-gray-600 text-sm mt-2">{formData.businessPhone}</p>
                    <p className="text-gray-600 text-sm">{formData.businessEmail}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-600 mb-3 uppercase text-sm">Bill To:</h4>
                    <p className="text-lg font-semibold text-gray-900">{formData.clientName}</p>
                    <p className="text-gray-600 text-sm mt-2">{formData.clientAddress}</p>
                    <p className="text-gray-600 text-sm">
                      {formData.clientCity}, {formData.clientState} {formData.clientPostal}
                    </p>
                    <p className="text-gray-600 text-sm mt-2">{formData.clientPhone}</p>
                    <p className="text-gray-600 text-sm">{formData.clientEmail}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Items</h4>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold">Item</th>
                          <th className="text-center px-4 py-3 font-semibold">Qty</th>
                          <th className="text-right px-4 py-3 font-semibold">Unit Price</th>
                          <th className="text-right px-4 py-3 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-gray-900">{item.name}</p>
                                  {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              ₱
                              {item.unitPrice.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">
                              ₱
                              {item.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-80">
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6">
                      <div className="flex justify-between mb-3 text-gray-700">
                        <span className="font-semibold">Subtotal:</span>
                        <span className="font-semibold">
                          ₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="border-t-2 border-red-300 pt-3 flex justify-between">
                        <span className="text-xl font-bold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-red-600">
                          ₱{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end px-6 py-4 border-t bg-gray-50">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                Print
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Quotation Settings</DialogTitle>
            <DialogDescription>Configure default settings for your quotations</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Default Currency</label>
              <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none">
                <option value="PHP">PHP (₱) - Philippine Peso</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Default Payment Terms (Days)</label>
              <input
                type="number"
                defaultValue={30}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none"
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">Default validity period for quotations</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</label>
              <textarea
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none resize-none"
                rows={4}
                placeholder="Enter default terms and conditions for quotations..."
                defaultValue="1. This quotation is valid for 30 days from the date of issue.&#10;2. Prices are subject to change without prior notice.&#10;3. Payment is due within 30 days of acceptance.&#10;4. Late payments may incur additional charges."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Footer Notes</label>
              <textarea
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none resize-none"
                rows={2}
                placeholder="Optional footer text to appear on all quotations..."
                defaultValue="Thank you for your business!"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enable Tax Calculation</label>
                <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none">
                  <option value="no">No Tax</option>
                  <option value="vat">VAT (12%)</option>
                  <option value="custom">Custom Rate</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={12}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none"
                  placeholder="12"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast({
                    title: "Settings Saved",
                    description: "Your quotation settings have been updated successfully",
                  })
                  setShowSettingsModal(false)
                }}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Send Quotation</DialogTitle>
            <DialogDescription>Choose how to send your quotation to the client</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <button
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-300 rounded-lg hover:border-red-600 hover:bg-red-50 transition group"
              onClick={() => {
                toast({
                  title: "Save First",
                  description: "Please save the quotation as draft first, then send it from the dashboard",
                })
                setShowSendModal(false)
              }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-100 group-hover:bg-red-200 transition">
                <Mail size={24} className="text-red-600" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900">Send via Email</p>
                <p className="text-sm text-gray-600">Email quotation to client</p>
              </div>
            </button>

            <button
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition group"
              onClick={() => {
                handleDownloadPDF()
                setShowSendModal(false)
              }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition">
                <Download size={24} className="text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900">Download PDF</p>
                <p className="text-sm text-gray-600">Download and share manually</p>
              </div>
            </button>

            <button
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition group"
              onClick={() => {
                handlePrint()
                setShowSendModal(false)
              }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 group-hover:bg-green-200 transition">
                <Printer size={24} className="text-green-600" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900">Print Document</p>
                <p className="text-sm text-gray-600">Print physical copy</p>
              </div>
            </button>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              onClick={() => setShowSendModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditMode ? "Update" : "Save"} Quotation as Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {isEditMode ? "update" : "save"} quotation{" "}
              <span className="font-bold text-gray-900">{formData.quoteNumber}</span> as draft?
              <br />
              <br />
              You can send it for admin approval later from the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={isSaving} className="bg-red-600 hover:bg-red-700">
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : (
                `Yes, ${isEditMode ? "Update" : "Save"} Draft`
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
