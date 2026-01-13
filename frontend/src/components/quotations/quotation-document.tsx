"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Plus, Trash2, Download, Save, Eye, Settings, Upload, X, Loader2, Printer, Mail } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation" // Import useRouter

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
  designCost?: number // Added for design cost
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
  logo?: File
  logoUrl?: string
  notes?: string // Added notes field
  validUntil: string // Added validUntil to interface
}

function QuotationDocumentSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Skeleton Toolbar */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-red-600 to-orange-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 bg-white/30 rounded-lg" />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 bg-white/30 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Skeleton */}
          <div className="p-8 border-b-4 border-red-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Skeleton className="w-32 h-32 rounded-lg mx-auto" />
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-10 w-32" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Bill To Skeleton */}
          <div className="p-8 border-b-2 border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Items Skeleton */}
          <div className="p-8">
            <div className="mb-6">
              <div className="grid grid-cols-12 gap-3 mb-3 pb-3 border-b-2 border-gray-300">
                <Skeleton className="col-span-4 h-4" />
                <Skeleton className="col-span-2 h-4" />
                <Skeleton className="col-span-3 h-4" />
                <Skeleton className="col-span-2 h-4" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="col-span-4 space-y-2">
                    <Skeleton className="h-10 w-10 rounded" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="col-span-2 h-8" />
                  <Skeleton className="col-span-3 h-8" />
                  <Skeleton className="col-span-2 h-8" />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-8">
              <Skeleton className="h-12 w-36 rounded-lg" />
              <Skeleton className="h-12 w-36 rounded-lg" />
            </div>
          </div>

          {/* Totals Skeleton */}
          <div className="px-8 pb-8 flex justify-end">
            <div className="w-full md:w-96">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-6 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-0.5 w-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface QuotationFormData {
  quoteNumber: string
  quoteDate: string
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
  validUntil: string // Added validUntil to interface
  logo?: File
  logoUrl?: string // Added for existing logo URL
  notes?: string // Added notes field
}

export function QuotationDocument({ existingQuotation }: { existingQuotation?: any }) {
  const router = useRouter()

  const [formData, setFormData] = useState<QuotationFormData>({
    quoteNumber: "",
    quoteDate: new Date().toISOString().split("T")[0],
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
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Added default validUntil
    notes: "", // Initialize notes
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [logoPreview, setLogoPreview] = useState<string>("")

  const [showProductModal, setShowProductModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const isEditMode = !!existingQuotation // Determine edit mode based on existingQuotation
  const printRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false) // Added state for sending
  const [showSendApprovalModal, setShowSendApprovalModal] = useState(false) // Added state for approval modal
  const [isNavigating, setIsNavigating] = useState(false) // Added state for navigation

  const getInitialFormData = (): QuotationFormData => ({
    quoteNumber: "",
    quoteDate: new Date().toISOString().split("T")[0],
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
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
  })

  useEffect(() => {
    // Clear sessionStorage and form on page load to ensure fresh start
    sessionStorage.removeItem("quotationDraft")
    if (!existingQuotation) {
      setFormData(getInitialFormData())
      setLineItems([])
      setLogoPreview("")
    }
  }, [existingQuotation])

  useEffect(() => {
    if (existingQuotation) {
      const parseDate = (dateStr: string | null | undefined, fallback: Date = new Date()) => {
        if (!dateStr) return fallback.toISOString().split("T")[0]
        const date = new Date(dateStr)
        return isNaN(date.getTime()) ? fallback.toISOString().split("T")[0] : date.toISOString().split("T")[0]
      }

      setFormData({
        quoteNumber: existingQuotation.quotation_number || "",
        quoteDate: parseDate(existingQuotation.quote_date),
        clientName: existingQuotation.customer_name || "",
        clientAddress: existingQuotation.customer_address || "",
        clientCity: existingQuotation.customer_city || "",
        clientState: existingQuotation.customer_province || "",
        clientPostal: existingQuotation.customer_zip_code || "",
        clientPhone: existingQuotation.customer_phone || "",
        clientEmail: existingQuotation.customer_email || "",
        businessName: existingQuotation.business_name || "Princess Jaidee",
        businessAddress: existingQuotation.business_address || "",
        businessCity: existingQuotation.business_city || "",
        businessState: existingQuotation.business_state || "",
        businessPostal: existingQuotation.business_postal || "",
        businessPhone: existingQuotation.business_phone || "",
        businessEmail: existingQuotation.business_email || "",
        validUntil: parseDate(existingQuotation.valid_until, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        logoUrl: existingQuotation.logo_url || "",
        notes: existingQuotation.notes || "", // Load notes
      })

      // Load existing line items if they exist
      if (existingQuotation.items && Array.isArray(existingQuotation.items)) {
        const loadedItems = existingQuotation.items.map((item: any) => ({
          id: item.id?.toString() || Date.now().toString(),
          type: item.product_id ? "product" : "service",
          productId: item.product_id,
          serviceId: item.service_id,
          name: item.product?.name || item.service?.name || "Custom Item",
          description: item.customization || item.product?.description || item.service?.description || "",
          quantity: item.quantity,
          unitPrice: item.unit_price,
          amount: item.quantity * item.unitPrice,
          image: item.product?.image_url,
          designCost: item.design_cost || 0, // Load design cost
        }))
        setLineItems(loadedItems)
      }
      if (existingQuotation?.logo_url) {
        setLogoPreview(existingQuotation.logo_url)
      }
    } else {
      const savedData = sessionStorage.getItem("quotationPreviewData")
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          setFormData(parsedData.formData)
          setLineItems(parsedData.lineItems)
          setLogoPreview(parsedData.logoPreview || "")
        } catch (error) {
          console.error("[v0] Error restoring quotation data:", error)
        }
      }
    }

    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [existingQuotation])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Don't prevent default - let navigation happen naturally
      // Only prevent actual page reload
      if (!isNavigating && (lineItems.length > 0 || formData.clientName)) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [lineItems, formData, isNavigating])

  useEffect(() => {
    const fetchNextQuotationNumber = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.log("[v0] Token not available yet, using fallback quotation number")
          setFormData((prev) => ({
            ...prev,
            quoteNumber: `QT-${new Date().toISOString().split("T")[0]}-001`, // Changed fallback format
            quoteDate: new Date().toISOString().split("T")[0],
          }))
          return
        }

        const response = await fetch(`${apiUrl}/quotations/next-number`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setFormData((prev) => ({
            ...prev,
            quoteNumber: data.quotation_number,
            quoteDate: data.date,
          }))
        } else {
          const errorText = await response.text()
          console.error("[v0] Failed to fetch next quotation number:", response.status, errorText)
          setFormData((prev) => ({
            ...prev,
            quoteNumber: `QT-${new Date().toISOString().split("T")[0]}-001`, // Changed fallback format
            quoteDate: new Date().toISOString().split("T")[0],
          }))
          toast({
            title: "Error",
            description: "Could not fetch quotation number. Using default.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching next quotation number:", error)
        setFormData((prev) => ({
          ...prev,
          quoteNumber: `QT-${new Date().toISOString().split("T")[0]}-001`, // Changed fallback format
          quoteDate: new Date().toISOString().split("T")[0],
        }))
        toast({
          title: "Error",
          description: "A network error occurred while fetching quotation number. Using default.",
          variant: "destructive",
        })
      }
    }

    if (!isEditMode) {
      // Only fetch if not in edit mode
      fetchNextQuotationNumber()
    }
  }, [isEditMode, toast])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, logo: file, logoUrl: "" }) // Clear logoUrl if a new file is uploaded
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
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        designCost: item.designCost, // Include designCost for validation
      })),
    }

    const result = quotationFormSchema.safeParse(formDataWithItems)
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".")
        newErrors[path] = issue.message
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
    setIsNavigating(true) // Set navigation flag
    const previewData = {
      formData,
      lineItems,
      subtotal,
      totalDue,
      logoPreview, // Include logoPreview in preview data
    }
    sessionStorage.setItem("quotationPreviewData", JSON.stringify(previewData))
    router.push(`/dashboard/quotations/preview`)
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
    setShowSendApprovalModal(true)
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
        setIsSaving(false)
        return
      }

      if (!lineItems || lineItems.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one item to the quotation",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      const formDataToSend = new FormData()

      // Add customer fields
      formDataToSend.append("customer_name", formData.clientName || "")
      formDataToSend.append("customer_email", formData.clientEmail || "")
      formDataToSend.append("customer_phone", formData.clientPhone || "")
      formDataToSend.append("customer_address", formData.clientAddress || "")
      formDataToSend.append("customer_city", formData.clientCity || "")
      formDataToSend.append("customer_province", formData.clientState || "")
      formDataToSend.append("customer_zip_code", formData.clientPostal || "")

      // Add business fields
      formDataToSend.append("business_name", formData.businessName || "")
      formDataToSend.append("business_address", formData.businessAddress || "")
      formDataToSend.append("business_city", formData.businessCity || "")
      formDataToSend.append("business_state", formData.businessState || "")
      formDataToSend.append("business_postal", formData.businessPostal || "")
      formDataToSend.append("business_phone", formData.businessPhone || "")
      formDataToSend.append("business_email", formData.businessEmail || "")

      if (formData.logo && formData.logo instanceof File) {
        console.log("[v0] Appending logo file to FormData")
        formDataToSend.append("logo", formData.logo)
      } else if (formData.logoUrl) {
        console.log("[v0] Logo URL already exists, skipping re-upload:", formData.logoUrl)
      }

      formDataToSend.append("notes", formData.notes || "")
      formDataToSend.append("valid_until", formData.validUntil || "")

      formDataToSend.append(
        "items",
        JSON.stringify(
          lineItems.map((item, index) => ({
            product_id: item.type === "product" ? item.productId || null : null,
            service_id: item.type === "service" ? item.serviceId || null : null,
            customization: item.description || "",
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.unitPrice) || 0,
            design_cost: Number(item.designCost) || 0,
            sort_order: index,
          })),
        ),
      )

      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/quotations/${existingQuotation.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/quotations`

      if (isEditMode) {
        formDataToSend.append("_method", "PUT")
      }

      console.log("[v0] Saving quotation:", { isEditMode, url, itemsCount: lineItems.length })

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        console.log("[v0] Backend validation errors:", data.errors || data.message || data)
        const errorMessages = data.errors
          ? Object.entries(data.errors)
              .map(([key, value]: [string, any]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
              .join("\n")
          : data.message || "Failed to save quotation"

        toast({
          title: "Validation Error",
          description: errorMessages,
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      toast({
        title: "Success",
        description: isEditMode ? "Quotation updated successfully" : "Quotation saved as draft successfully",
      })

      sessionStorage.removeItem("quotationDraft")
      sessionStorage.removeItem("quotationPreviewData")
      setFormData(getInitialFormData())
      setLineItems([])
      setLogoPreview("")
      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push("/dashboard")
    } catch (error: any) {
      console.log("[v0] Save error:", error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to save quotation",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setShowConfirmDialog(false)
    }
  }

  const confirmSendForApproval = async () => {
    setIsSending(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to send quotations",
          variant: "destructive",
        })
        return
      }

      // First save the quotation as draft if it's new
      const formDataToSend = new FormData()

      // Add customer fields
      formDataToSend.append("customer_name", formData.clientName || "")
      formDataToSend.append("customer_email", formData.clientEmail || "")
      formDataToSend.append("customer_phone", formData.clientPhone || "")
      formDataToSend.append("customer_address", formData.clientAddress || "")
      formDataToSend.append("customer_city", formData.clientCity || "")
      formDataToSend.append("customer_province", formData.clientState || "")
      formDataToSend.append("customer_zip_code", formData.clientPostal || "")

      // Add business fields
      formDataToSend.append("business_name", formData.businessName || "")
      formDataToSend.append("business_address", formData.businessAddress || "")
      formDataToSend.append("business_city", formData.businessCity || "")
      formDataToSend.append("business_state", formData.businessState || "")
      formDataToSend.append("business_postal", formData.businessPostal || "")
      formDataToSend.append("business_phone", formData.businessPhone || "")
      formDataToSend.append("business_email", formData.businessEmail || "")

      if (formData.logo && formData.logo instanceof File) {
        console.log("[v0] Appending logo file to FormData for send")
        formDataToSend.append("logo", formData.logo)
      } else if (formData.logoUrl) {
        console.log("[v0] Logo URL already exists, skipping re-upload:", formData.logoUrl)
      }

      formDataToSend.append("notes", formData.notes || "")
      formDataToSend.append("valid_until", formData.validUntil || "")
      formDataToSend.append("status", "pending_approval")

      // Add items as JSON string
      formDataToSend.append(
        "items",
        JSON.stringify(
          lineItems.map((item, index) => ({
            product_id: item.productId || null,
            service_id: item.serviceId || null,
            customization: item.description || "",
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.unitPrice) || 0,
            design_cost: Number(item.designCost) || 0,
            sort_order: index,
          })),
        ),
      )

      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/quotations/${existingQuotation.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/quotations`

      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: (() => {
          if (method === "PUT") {
            formDataToSend.append("_method", "PUT")
          }
          return formDataToSend
        })(),
      })

      const data = await response.json()

      if (!response.ok) {
        console.log("[v0] Backend validation errors:", data.errors || data.message || data)
        const errorMessages = data.errors
          ? Object.entries(data.errors)
              .map(([key, value]: [string, any]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
              .join("\n")
          : data.message || "Failed to send quotation"

        toast({
          title: "Validation Error",
          description: errorMessages,
          variant: "destructive",
        })
        setIsSending(false)
        return
      }

      toast({
        title: "Success",
        description: "Quotation sent to admin for approval successfully",
      })

      sessionStorage.removeItem("quotationDraft")
      sessionStorage.removeItem("quotationPreviewData")
      setFormData(getInitialFormData())
      setLineItems([])
      setLogoPreview("")
      await new Promise((resolve) => setTimeout(resolve, 500))
      setShowSendModal(false)

      router.push("/dashboard")
    } catch (error: any) {
      console.log("[v0] Send error:", error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to send quotation",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const addLineItem = (item: Omit<LineItem, "id" | "amount">) => {
    const amount = (item.quantity || 1) * (item.unitPrice || 0)
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
              amount: quantity * (item.unitPrice || 0),
            }
          : item,
      ),
    )
  }

  const updateLineItemDesignCost = (id: string, designCost: number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id
          ? {
              ...item,
              designCost,
              amount: (item.quantity || 1) * (item.unitPrice || 0) + designCost,
            }
          : item,
      ),
    )
  }

  if (isPageLoading) {
    return <QuotationDocumentSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="sticky top-16 z-40 bg-gradient-to-r from-red-600 to-orange-500 shadow-lg print:hidden pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Left side buttons */}
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

            {/* Right side buttons */}
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
        {/* Document Viewer */}
        <div
          ref={printRef}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print-content"
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
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        if (img.src !== "/placeholder.svg") {
                          console.log("[v0] Logo failed to load from URL:", logoPreview)
                          img.src = "/placeholder.svg"
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        setLogoPreview("")
                        setFormData({ ...formData, logo: undefined, logoUrl: "" }) // Clear both logo file and URL
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
                    value={formData.validUntil} // Changed from formData.dueDate to formData.validUntil
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} // Changed from dueDate to validUntil
                    className={`text-lg font-semibold text-gray-900 bg-transparent border-b-2 ${errors.validUntil ? "border-red-500" : "border-gray-300"} focus:border-red-600 outline-none transition w-full`} // Changed from dueDate to validUntil
                  />
                  {errors.validUntil && <p className="text-xs text-red-500 mt-1">{errors.validUntil}</p>}{" "}
                  {/* Changed from dueDate to validUntil */}
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
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            if (img.src !== "/placeholder.svg") {
                              img.src = "/placeholder.svg"
                            }
                          }}
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

                    {/* Unit Price Column - Disabled (fixed price) */}
                    <div className="col-span-2 flex items-center justify-end">
                      <input
                        type="text"
                        value={`₱${(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        disabled
                        className="w-full px-3 py-2 text-right bg-gray-100 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 cursor-not-allowed print:bg-transparent print:border-0 print:text-gray-900"
                        title="Unit price is fixed from product/service"
                      />
                    </div>

                    {/* Amount Column */}
                    <div className="col-span-2 flex items-center justify-end">
                      <p className="font-bold text-gray-900">
                        ₱
                        {(item.amount || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
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

            {/* Notes Section */}
            <div className="mt-8 print:hidden">
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Notes/Comments
              </label>
              <textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes or comments..."
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Totals Section - Simplified for Client */}
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
            designCost: product.design_cost, // Pass design_cost
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
            designCost: service.design_cost, // Pass design_cost
          })
        }}
      />

      {/* Preview Modal - Full Screen with Zoom */}
      {/* Preview modal code removed - now uses /dashboard/quotations/preview page */}

      {/* Settings Modal - Enhanced */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Quotation Settings</DialogTitle>
            <DialogDescription>Configure default settings for your quotations</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Currency Settings */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Default Currency</label>
              <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none">
                <option value="PHP">₱ - Philippine Peso</option>
                <option value="USD">$ - US Dollar</option>
                <option value="EUR">€ - Euro</option>
              </select>
            </div>

            {/* Payment Terms */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Default Quotation Validity (Days)
              </label>
              <input
                type="number"
                defaultValue={30}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none"
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">Default validity period for quotations</p>
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Default Terms & Conditions</label>
              <textarea
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none resize-none"
                rows={4}
                placeholder="Enter default terms and conditions for quotations..."
                defaultValue="1. This quotation is valid for 30 days from the date of issue.&#10;2. Prices are subject to change without prior notice.&#10;3. Payment is due within 30 days of acceptance.&#10;4. Late payments may incur additional charges."
              />
            </div>

            {/* Footer Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Default Footer Notes</label>
              <textarea
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none resize-none"
                rows={2}
                placeholder="Optional footer text to appear on all quotations..."
                defaultValue="Thank you for your business!"
              />
            </div>

            {/* Tax Settings */}
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

            {/* Action Buttons */}
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

      {/* Send Modal - Enhanced */}
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

      <Dialog open={showSendApprovalModal} onOpenChange={setShowSendApprovalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Send for Approval</DialogTitle>
            <DialogDescription>
              Do you want to send quotation <span className="font-bold text-gray-900">{formData.quoteNumber}</span> to
              admin for approval?
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
            <button
              onClick={() => setShowSendApprovalModal(false)}
              disabled={isSending}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              No, Cancel
            </button>
            <button
              onClick={confirmSendForApproval}
              disabled={isSending}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Yes, Send for Approval"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Quotation as Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save this quotation as a draft?
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
                  Saving...
                </>
              ) : (
                "Yes, Save Draft"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
