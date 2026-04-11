"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Plus, Trash2, Download, Save, Eye, Settings, Upload, X, Loader2, Printer, Mail, Edit2, ChevronDown, Check } from "lucide-react"
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

interface ItemNotes {
  designNotes?: string
  jerseyCustomizationNotes?: string
  teamRosterNotes?: string
  sizeNotes?: string
  additionalNotes?: string
  [key: string]: string | undefined
}

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
  designCost?: number
  notes?: ItemNotes | string
  serviceRequirements?: {
    designFile: File | null
    designPreview: string
    designImageUrl?: string
    teamRoster: Array<{ id: string; name: string; number: string | number; sizeTop?: string; lengthTopInches?: string; sizeBottom?: string; lengthBottomInches?: string }>
    sizeSpecifications: {
      top?: string
      bottom?: string
      width?: number
      height?: number
      totalSqft?: number
      totalPrice?: number
    }
    designConsultation?: {
      needed: boolean
      notes: string
      price: number
    }
  }
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

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"

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
    businessName: "",
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
  const [branches, setBranches] = useState<Array<{ id: number; name: string; location: string; is_main_branch: boolean }>>([])
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingRosterId, setEditingRosterId] = useState<string | null>(null)
  const [editingTarpaulinId, setEditingTarpaulinId] = useState<string | null>(null)
  const [editingDesignNotesId, setEditingDesignNotesId] = useState<string | null>(null)
  const [expandedImageItem, setExpandedImageItem] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

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
    businessName: "",
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
      // Load user data from localStorage and auto-populate Bill-To fields
      try {
        const userDataStr = localStorage.getItem("user")
        if (userDataStr) {
          const userData = JSON.parse(userDataStr)
          const initialData = getInitialFormData()

          // Auto-populate client/bill-to fields from user data
          // Construct full name from first_name and last_name
          if (userData.first_name || userData.last_name) {
            initialData.clientName = `${userData.first_name || ""} ${userData.last_name || ""}`.trim()
          } else if (userData.name) {
            // Fallback to name field if available
            initialData.clientName = userData.name
          }
          if (userData.email) {
            initialData.clientEmail = userData.email
          }
          if (userData.phone_number) {
            initialData.clientPhone = userData.phone_number
          }
          if (userData.address) {
            initialData.clientAddress = userData.address
          }
          if (userData.city) {
            initialData.clientCity = userData.city
          }
          if (userData.province) {
            initialData.clientState = userData.province
          }
          if (userData.zip_code) {
            initialData.clientPostal = userData.zip_code
          }

          setFormData(initialData)
        } else {
          setFormData(getInitialFormData())
        }
      } catch (error) {
        console.error("[v0] Error loading user data for auto-population:", error)
        setFormData(getInitialFormData())
      }
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
        businessName: existingQuotation.business_name || "",
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
        const loadedItems = existingQuotation.items.map((item: any) => {
          // Parse notes if it's a string (JSON) or keep as object
          let parsedNotes: any = {}
          if (typeof item.notes === 'string') {
            try {
              parsedNotes = JSON.parse(item.notes)
            } catch (e) {
              parsedNotes = { designNotes: item.notes }
            }
          } else if (typeof item.notes === 'object') {
            parsedNotes = item.notes
          }
          return {
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
            notes: {
              ...parsedNotes,
              // Map jerseyCustomizationNotes to teamNotes for display
              teamNotes: parsedNotes?.teamNotes || parsedNotes?.jerseyCustomizationNotes,
            },
            serviceRequirements: item.service_id ? {
              designFile: null,
              designPreview: item.design_file_url || item.customization || "",
              designImageUrl: item.design_file_url || "", // Use design_file_url from backend
              teamRoster: item.team_roster || [],
              sizeSpecifications: item.size_specifications || {},
            } : undefined,
          }
        })
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
          console.error("Error restoring quotation data:", error)
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
          console.log("Token not available yet, using fallback quotation number")
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
          console.error("Failed to fetch next quotation number:", response.status, errorText)
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
        console.error("Error fetching next quotation number:", error)
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

  const fetchBranches = async () => {
    setIsLoadingBranches(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch(`${apiUrl}/quotations/active-branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches || [])
        // Auto-select main branch if available
        const mainBranch = data.branches?.find((b: any) => b.is_main_branch)
        if (mainBranch) {
          setSelectedBranchId(mainBranch.id)
        } else if (data.branches?.length > 0) {
          setSelectedBranchId(data.branches[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
    } finally {
      setIsLoadingBranches(false)
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
    fetchBranches()
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

      // Add bill_to fields (map from client fields for database customers table)
      formDataToSend.append("bill_to_name", formData.clientName || "")
      formDataToSend.append("bill_to_email", formData.clientEmail || "")
      formDataToSend.append("bill_to_phone", formData.clientPhone || "")
      formDataToSend.append("bill_to_street", formData.clientAddress || "")
      formDataToSend.append("bill_to_city", formData.clientCity || "")
      formDataToSend.append("bill_to_state", formData.clientState || "")
      formDataToSend.append("bill_to_postal", formData.clientPostal || "")

      // Add business fields
      formDataToSend.append("business_name", formData.businessName || "")
      formDataToSend.append("business_address", formData.businessAddress || "")
      formDataToSend.append("business_city", formData.businessCity || "")
      formDataToSend.append("business_state", formData.businessState || "")
      formDataToSend.append("business_postal", formData.businessPostal || "")
      formDataToSend.append("business_phone", formData.businessPhone || "")
      formDataToSend.append("business_email", formData.businessEmail || "")

      if (formData.logo && formData.logo instanceof File) {
        console.log("Appending logo file to FormData")
        formDataToSend.append("logo", formData.logo)
      } else if (formData.logoUrl) {
        console.log("Logo URL already exists, skipping re-upload:", formData.logoUrl)
      }

      formDataToSend.append("notes", formData.notes || "")
      formDataToSend.append("valid_until", formData.validUntil || "")
      formDataToSend.append("status", "draft")

      // Upload design files and get URLs
      const itemsPayload = await Promise.all(
        lineItems.map(async (item, index) => {
          let designFileUrl = null

          // If there's a design file, upload it
          if (item.serviceRequirements?.designFile instanceof File) {
            try {
              const designFormData = new FormData()
              designFormData.append("design_file", item.serviceRequirements.designFile)

              const uploadResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/quotations/upload-design`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: designFormData,
                }
              )

              if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json()
                designFileUrl = uploadData.design_file_url
                console.log("[v0] Design file uploaded:", designFileUrl)
              } else {
                console.error("[v0] Design file upload failed")
              }
            } catch (error) {
              console.error("[v0] Error uploading design file:", error)
            }
          }

          return {
            product_id: item.type === "product" ? item.productId || null : null,
            service_id: item.type === "service" ? item.serviceId || null : null,
            customization: item.description || "",
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.unitPrice) || 0,
            design_cost: Number(item.designCost) || 0,
            sort_order: index,
            design_file_url: designFileUrl || null,
            team_roster: item.serviceRequirements?.teamRoster || null,
            size_specifications: item.serviceRequirements?.sizeSpecifications || null,
            notes: typeof item.notes === 'object' ? JSON.stringify(item.notes) : (item.notes || null),
          }
        })
      )

      formDataToSend.append("items", JSON.stringify(itemsPayload))

      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/quotations/${existingQuotation.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/quotations`

      if (isEditMode) {
        formDataToSend.append("_method", "PUT")
      }

      console.log("Saving quotation:", { isEditMode, url, itemsCount: lineItems.length })

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
        console.log("Backend validation errors:", data.errors || data.message || data)
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
      console.log("Save error:", error.message)
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
    if (!selectedBranchId) {
      toast({
        title: "Branch Required",
        description: "Please select a branch to send the quotation to",
        variant: "destructive",
      })
      return
    }

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

      // Add bill_to fields (map from client fields for database customers table)
      formDataToSend.append("bill_to_name", formData.clientName || "")
      formDataToSend.append("bill_to_email", formData.clientEmail || "")
      formDataToSend.append("bill_to_phone", formData.clientPhone || "")
      formDataToSend.append("bill_to_street", formData.clientAddress || "")
      formDataToSend.append("bill_to_city", formData.clientCity || "")
      formDataToSend.append("bill_to_state", formData.clientState || "")
      formDataToSend.append("bill_to_postal", formData.clientPostal || "")

      // Add business fields
      formDataToSend.append("business_name", formData.businessName || "")
      formDataToSend.append("business_address", formData.businessAddress || "")
      formDataToSend.append("business_city", formData.businessCity || "")
      formDataToSend.append("business_state", formData.businessState || "")
      formDataToSend.append("business_postal", formData.businessPostal || "")
      formDataToSend.append("business_phone", formData.businessPhone || "")
      formDataToSend.append("business_email", formData.businessEmail || "")

      if (formData.logo && formData.logo instanceof File) {
        console.log("Appending logo file to FormData for send")
        formDataToSend.append("logo", formData.logo)
      } else if (formData.logoUrl) {
        console.log("Logo URL already exists, skipping re-upload:", formData.logoUrl)
      }

      formDataToSend.append("notes", formData.notes || "")
      formDataToSend.append("valid_until", formData.validUntil || "")
      formDataToSend.append("status", "pending")
      formDataToSend.append("branch_id", selectedBranchId?.toString() || "")

      // Upload design files and get URLs
      const itemsPayload = await Promise.all(
        lineItems.map(async (item, index) => {
          let designFileUrl = null

          // If there's a design file, upload it
          if (item.serviceRequirements?.designFile instanceof File) {
            try {
              const designFormData = new FormData()
              designFormData.append("design_file", item.serviceRequirements.designFile)

              const uploadResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/quotations/upload-design`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: designFormData,
                }
              )

              if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json()
                designFileUrl = uploadData.design_file_url
                console.log("[v0] Design file uploaded:", designFileUrl)
              } else {
                console.error("[v0] Design file upload failed")
              }
            } catch (error) {
              console.error("[v0] Error uploading design file:", error)
            }
          }

          return {
            product_id: item.productId || null,
            service_id: item.serviceId || null,
            customization: item.description || "",
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.unitPrice) || 0,
            design_cost: Number(item.designCost) || 0,
            sort_order: index,
            design_file_url: designFileUrl || null,
            team_roster: item.serviceRequirements?.teamRoster ? JSON.stringify(item.serviceRequirements.teamRoster) : null,
            size_specifications: item.serviceRequirements?.sizeSpecifications || null,
            notes: typeof item.notes === 'object' ? JSON.stringify(item.notes) : (item.notes || null),
          }
        })
      )

      formDataToSend.append("items", JSON.stringify(itemsPayload))

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
        console.log("Backend validation errors:", data.errors || data.message || data)
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

      const selectedBranch = branches.find(b => b.id === selectedBranchId)
      toast({
        title: "Success",
        description: `Quotation sent to ${selectedBranch?.name || "admin"} for approval successfully`,
      })

      sessionStorage.removeItem("quotationDraft")
      sessionStorage.removeItem("quotationPreviewData")
      setFormData(getInitialFormData())
      setLineItems([])
      setLogoPreview("")
      setSelectedBranchId(null)
      setBranches([])
      await new Promise((resolve) => setTimeout(resolve, 500))
      setShowSendApprovalModal(false)

      router.push("/dashboard/quotations/thank-you")
    } catch (error: any) {
      console.log("Send error:", error.message)
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
    // Auto-calculate quantity for Sublimation Service based on team roster count
    let finalQuantity = item.quantity || 1
    if (item.name?.includes("Sublimation") && item.serviceRequirements?.teamRoster?.length > 0) {
      finalQuantity = item.serviceRequirements.teamRoster.length
    }

    const amount = (finalQuantity || 1) * (item.unitPrice || 0)
    setLineItems([
      ...lineItems,
      {
        ...item,
        quantity: finalQuantity,
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

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates }

          // Auto-update quantity for Sublimation if team roster changes
          if (item.name?.includes("Sublimation") && updated.serviceRequirements?.teamRoster) {
            updated.quantity = updated.serviceRequirements.teamRoster.length
            updated.amount = updated.quantity * (updated.unitPrice || 0)
          }

          return updated
        }
        return item
      }),
    )
  }

  if (isPageLoading) {
    return <QuotationDocumentSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <div className="w-full fixed top-14 sm:top-16 z-40 bg-gradient-to-r from-red-600 to-orange-500 shadow-lg print:hidden">
        <div className="w-full px-1 sm:px-3 lg:px-6">
          <div className="flex items-center justify-between gap-1 sm:gap-2 py-2 md:py-3 overflow-x-auto">
            {/* Left side - Cancel button */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => setShowCancelDialog(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-red-100/90 hover:bg-red-100 text-red-600 font-semibold text-xs sm:text-sm rounded-lg transition hover:shadow-md cursor-pointer whitespace-nowrap"
              >
                <X size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            </div>

            {/* Right side buttons - Save Draft and Send to Admin */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/90 hover:bg-white text-red-600 font-semibold text-xs sm:text-sm rounded-lg transition hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin sm:w-5 sm:h-5" /> : <Save size={16} className="sm:w-5 sm:h-5" />}
                <span className="hidden sm:inline">{isEditMode ? "Update" : "Save Draft"}</span>
                <span className="inline sm:hidden">Save</span>
              </button>
              <button
                onClick={handleSend}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/90 hover:bg-white text-red-600 font-semibold text-xs sm:text-sm rounded-lg transition hover:shadow-md cursor-pointer whitespace-nowrap"
              >
                <Mail size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Send to Admin</span>
                <span className="inline sm:hidden">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-1 sm:px-2 md:px-6 lg:px-8 pt-16 md:pt-20 pb-2 md:pb-6">
        {/* Document Viewer - Responsive Container */}
        <div
          ref={printRef}
          className="bg-white rounded-lg md:rounded-2xl shadow-lg md:shadow-2xl overflow-hidden print:shadow-none print:rounded-none print-content max-w-full"
        >
          {/* Document Header */}
          <div className="p-3 md:p-8 border-b-4 border-red-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {/* Logo Section */}
              <div className="flex flex-col items-center justify-center md:col-span-1">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Company Logo"
                      className="w-20 h-20 md:w-32 md:h-32 object-contain rounded-lg border-2 border-red-200"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        if (img.src !== "/placeholder.svg") {
                          console.log("Logo failed to load from URL:", logoPreview)
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
                  <label className="w-20 h-20 md:w-32 md:h-32 border-2 border-dashed border-red-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500 transition group bg-gradient-to-br from-red-50 to-orange-50">
                    <div className="text-center">
                      <Upload size={16} className="md:w-6 md:h-6 text-red-400 mx-auto mb-1 md:mb-2 group-hover:text-red-600 transition" />
                      <p className="text-xs text-gray-600 font-medium">Logo</p>
                    </div>
                    <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                  </label>
                )}
              </div>

              {/* Business Info & Quote Header */}
              <div className="md:col-span-2">
                <div className="mb-4 md:mb-6">
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1">
                    <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                      Quote
                    </span>
                  </h1>
                  <div className="h-1 w-16 md:w-24 bg-gradient-to-r from-red-600 to-orange-500 rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Quote No.</p>
                    <input
                      type="text"
                      value={formData.quoteNumber}
                      onChange={(e) => setFormData({ ...formData, quoteNumber: e.target.value })}
                      disabled
                      className="text-lg font-bold text-gray-900 bg-transparent border-b-2 border-red-200 focus:border-red-600 outline-none transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formData.quoteDate
                        ? new Date(formData.quoteDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                        : 'N/A'}
                    </p>
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
          <div className="p-3 md:p-8 border-b-2 border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
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
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">Due Date</p>
                    <div className="group relative">
                      <p className="cursor-help text-gray-400 hover:text-gray-600 flex items-center justify-center w-5 h-5 border border-gray-300 rounded-full text-xs font-bold">?</p>
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-3 w-48 whitespace-normal z-50">
                        <p>Your quotation will automatically delete in 30 days unless you send it to admin.</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.validUntil
                      ? new Date(formData.validUntil).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-3 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              Items
              <span className="text-sm font-normal text-gray-500">
                ({lineItems.length} {lineItems.length === 1 ? "item" : "items"})
              </span>
            </h2>

            <div className="mb-6">
              {/* Table Header */}
              <div className="hidden md:flex items-center gap-3 mb-3 pb-3 border-b-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-lg font-semibold text-gray-700 print:hidden">
                <div className="flex-1 text-base">Name</div>
                <div className="w-12 text-center text-base">Actions</div>
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
                  <div key={item.id} className="mb-4 pb-4 border-b border-gray-200 print:break-inside-avoid">
                    {/* Main Row - Collapsible */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 p-3 bg-gray-50 rounded-lg">
                      {/* Expand Button - Show if there's any expandable content */}
                      {item.type === "service" && (item.serviceRequirements?.teamRoster?.length > 0 ||
                        (item.serviceRequirements?.sizeSpecifications?.width && item.serviceRequirements?.sizeSpecifications?.height) ||
                        item.serviceRequirements?.designPreview ||
                        item.serviceRequirements?.designImageUrl ||
                        (item.notes && typeof item.notes === 'object' && (item.notes.sizeNotes || item.notes.teamNotes || item.notes.designNotes || item.notes.additionalNotes))) && (
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedItems)
                              if (newExpanded.has(item.id)) {
                                newExpanded.delete(item.id)
                              } else {
                                newExpanded.add(item.id)
                              }
                              setExpandedItems(newExpanded)
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition print:hidden self-start md:self-center"
                          >
                            <ChevronDown
                              size={18}
                              className={`transition-transform ${expandedItems.has(item.id) ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}

                      {/* Image & Name & Category Column */}
                      <div className="flex-1 flex gap-2 min-w-0">
                        {/* Service Image */}
                        {item.image && (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement
                              img.style.display = "none"
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === "service"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                              }`}>
                              {item.type === "service" ? "Service" : "Product"}
                            </span>
                          </div>
                        </div>
                      </div>



                      {/* Actions Column */}
                      <div className="flex items-center justify-center print:hidden w-12">
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded transition"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Roster Details */}
                    {expandedItems.has(item.id) && item.serviceRequirements?.teamRoster?.length > 0 && (
                      <div className="mt-3 ml-0 md:ml-8 pt-3 border-t border-gray-200">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-gray-700 uppercase">Team Roster Details</p>
                            <div className="flex items-center gap-2">
                              {editingRosterId === item.id ? (
                                <button
                                  onClick={() => setEditingRosterId(null)}
                                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-300 p-1.5 rounded transition flex items-center gap-1"
                                  title="Save roster changes"
                                >
                                  <Check size={16} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingRosterId(item.id)}
                                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-300 p-1.5 rounded transition"
                                  title="Edit roster"
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  const newPlayer = { id: Date.now().toString(), name: "", number: "", sizeTop: "", lengthTopInches: "", sizeBottom: "", lengthBottomInches: "" }
                                  const updated = [...(item.serviceRequirements?.teamRoster || []), newPlayer]
                                  updateLineItem(item.id, { ...item, serviceRequirements: { ...item.serviceRequirements, teamRoster: updated } })
                                  setEditingRosterId(item.id)
                                }}
                                className="text-gray-600 hover:text-gray-800 hover:bg-gray-300 p-1.5 rounded transition flex items-center gap-1"
                                title="Add new player"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 mb-4">
                            {/* Header Row - Hidden on mobile */}
                            <div className="hidden md:grid grid-cols-8 gap-2 px-2 py-2 bg-gray-200 rounded-md text-center">
                              <p className="text-xs font-semibold text-gray-700 text-left">Name</p>
                              <p className="text-xs font-semibold text-gray-700">Jersey #</p>
                              <p className="text-xs font-semibold text-gray-700">Top Size</p>
                              <p className="text-xs font-semibold text-gray-700">Top Length (in)</p>
                              <p className="text-xs font-semibold text-gray-700">Bottom Size</p>
                              <p className="text-xs font-semibold text-gray-700">Bottom Length (in)</p>
                              <p className="text-xs font-semibold text-gray-700">Price</p>
                              <p className="text-xs font-semibold text-gray-700">Action</p>
                            </div>

                            {/* Roster Items */}
                            {item.serviceRequirements.teamRoster.map((member) => (
                              <div key={member.id} className={`flex flex-col md:grid ${editingRosterId === item.id ? 'md:grid-cols-9' : 'md:grid-cols-8'} gap-2 md:gap-2 px-2 py-2 bg-white rounded-md border border-gray-200`}>
                                <div className="flex flex-col flex-1">
                                  <span className="text-xs font-semibold text-gray-500 md:hidden">Name</span>
                                  <input
                                    type="text"
                                    value={member.name}
                                    disabled={editingRosterId !== item.id}
                                    onChange={(e) => {
                                      const updated = item.serviceRequirements?.teamRoster?.map((m) =>
                                        m.id === member.id ? { ...m, name: e.target.value } : m
                                      ) || []
                                      updateLineItem(item.id, { ...item, serviceRequirements: { ...item.serviceRequirements, teamRoster: updated } })
                                    }}
                                    className={`font-medium text-sm px-2 py-1 border rounded outline-none transition ${editingRosterId === item.id
                                      ? 'text-gray-900 border-gray-300 focus:border-blue-500'
                                      : 'text-gray-900 border-gray-300 bg-gray-50 cursor-not-allowed'
                                      }`}
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-gray-500 md:hidden">Jersey #</span>
                                  <input
                                    type="text"
                                    value={member.number}
                                    disabled={editingRosterId !== item.id}
                                    onChange={(e) => {
                                      const updated = item.serviceRequirements?.teamRoster?.map((m) =>
                                        m.id === member.id ? { ...m, number: e.target.value } : m
                                      ) || []
                                      updateLineItem(item.id, { ...item, serviceRequirements: { ...item.serviceRequirements, teamRoster: updated } })
                                    }}
                                    className={`font-medium text-sm px-2 py-1 border rounded outline-none transition ${editingRosterId === item.id
                                      ? 'text-gray-900 border-gray-300 focus:border-blue-500'
                                      : 'text-gray-900 border-gray-300 bg-gray-50 cursor-not-allowed'
                                      }`}
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-gray-500 md:hidden">Top Size</span>
                                  <select
                                    value={member.sizeTop || ""}
                                    disabled={editingRosterId !== item.id}
                                    onChange={(e) => {
                                      const updated = item.serviceRequirements?.teamRoster?.map((m) =>
                                        m.id === member.id ? { ...m, sizeTop: e.target.value } : m
                                      ) || []
                                      updateLineItem(item.id, { ...item, serviceRequirements: { ...item.serviceRequirements, teamRoster: updated } })
                                    }}
                                    className={`text-sm px-2 py-1 border rounded outline-none transition ${editingRosterId === item.id
                                      ? 'text-gray-700 border-gray-300 focus:border-blue-500 bg-white'
                                      : 'text-gray-700 border-gray-300 bg-gray-50 cursor-not-allowed'
                                      }`}
                                  >
                                    <option value="">Select</option>
                                    <option value="None">None</option>
                                    <option value="5TS">5TS</option>
                                    <option value="4TS">4TS</option>
                                    <option value="3TS">3TS</option>
                                    <option value="2TS">2TS</option>
                                    <option value="TS">TS</option>
                                    <option value="XS">XS</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="2XL">2XL</option>
                                    <option value="3XL">3XL</option>
                                    <option value="4XL">4XL</option>
                                    <option value="5XL">5XL</option>
                                    <option value="6XL">6XL</option>
                                    <option value="7XL">7XL</option>
                                  </select>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-gray-500 md:hidden">Top Length (in)</span>
                                  <select
                                    value={member.lengthTopInches || ""}
                                    disabled={editingRosterId !== item.id}
                                    onChange={(e) => {
                                      const updated = item.serviceRequirements?.teamRoster?.map((m) =>
                                        m.id === member.id ? { ...m, lengthTopInches: e.target.value } : m
                                      ) || []
                                      updateLineItem(item.id, { ...item, serviceRequirements: { ...item.serviceRequirements, teamRoster: updated } })
                                    }}
                                    className={`text-sm px-2 py-1 border rounded outline-none transition ${editingRosterId === item.id
                                      ? 'text-gray-700 border-gray-300 focus:border-blue-500 bg-white'
                                      : 'text-gray-700 border-gray-300 bg-gray-50 cursor-not-allowed'
                                      }`}
                                  >
                                    <option value="">Select</option>
                                    <option value="Standard">Standard</option>
                                    {Array.from({ length: 21 }, (_, i) => 16 + i).map((len) => (
                                      <option key={len} value={len}>{len}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-gray-500 md:hidden">Bottom Size</span>
                                  <select
                                    value={member.sizeBottom || ""}
                                    disabled={editingRosterId !== item.id}
                                    onChange={(e) => {
                                      const updated = item.serviceRequirements?.teamRoster?.map((m) =>
                                        m.id === member.id ? { ...m, sizeBottom: e.target.value } : m
                                      ) || []
                                      updateLineItem(item.id, { ...item, serviceRequirements: { ...item.serviceRequirements, teamRoster: updated } })
                                    }}
                                    className={`text-sm px-2 py-1 border rounded outline-none transition ${editingRosterId === item.id
                                      ? 'text-gray-700 border-gray-300 focus:border-blue-500 bg-white'
                                      : 'text-gray-700 border-gray-300 bg-gray-50 cursor-not-allowed'
                                      }`}
                                  >
                                    <option value="">Select</option>
                                    <option value="None">None</option>
                                    <option value="5TS">5TS</option>
                                    <option value="4TS">4TS</option>
                                    <option value="3TS">3TS</option>
                                    <option value="2TS">2TS</option>
                                    <option value="TS">TS</option>
                                    <option value="XS">XS</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="2XL">2XL</option>
                                    <option value="3XL">3XL</option>
                                    <option value="4XL">4XL</option>
                                    <option value="5XL">5XL</option>
                                    <option value="6XL">6XL</option>
                                    <option value="7XL">7XL</option>
                                  </select>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-gray-500 md:hidden">Bottom Length (in)</span>
                                  <select
                                    value={member.lengthBottomInches || ""}
                                    disabled={editingRosterId !== item.id}
                                    onChange={(e) => {
                                      const updated = item.serviceRequirements?.teamRoster?.map((m) =>
                                        m.id === member.id ? { ...m, lengthBottomInches: e.target.value } : m
                                      ) || []
                                      updateLineItem(item.id, { ...item, serviceRequirements: { ...item.serviceRequirements, teamRoster: updated } })
                                    }}
                                    className={`text-sm px-2 py-1 border rounded outline-none transition ${editingRosterId === item.id
                                      ? 'text-gray-700 border-gray-300 focus:border-blue-500 bg-white'
                                      : 'text-gray-700 border-gray-300 bg-gray-50 cursor-not-allowed'
                                      }`}
                                  >
                                    <option value="">Select</option>
                                    {Array.from({ length: 12 }, (_, i) => 12 + i).map((len) => (
                                      <option key={len} value={len}>{len}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-gray-500 md:hidden">Price</span>
                                  <input
                                    type="text"
                                    placeholder="-"
                                    disabled
                                    className="text-gray-700 text-sm px-2 py-1 border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-center"
                                  />
                                </div>
                                {editingRosterId === item.id && item.serviceRequirements.teamRoster.length > 1 && (
                                  <div className="flex items-center justify-center">
                                    <button
                                      onClick={() => {
                                        const updated = (item.serviceRequirements?.teamRoster || []).filter(m => m.id !== member.id)
                                        updateLineItem(item.id, { ...item, serviceRequirements: { ...item.serviceRequirements, teamRoster: updated } })
                                      }}
                                      className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded transition"
                                      title="Delete player"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}

                            {/* Jersey Customization Notes */}
                            {item.notes && typeof item.notes === 'object' && item.notes.teamNotes && (
                              <div className="mt-4 pt-4 border-t border-gray-300 space-y-3">
                                <div>
                                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Jersey Customization Notes</p>
                                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-800 whitespace-pre-wrap">
                                    {item.notes.teamNotes}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tarpaulin Details Collapsible */}
                    {expandedItems.has(item.id) &&
                      item.serviceRequirements?.sizeSpecifications?.width &&
                      item.serviceRequirements?.sizeSpecifications?.height && (
                        <div className="mt-3 ml-0 md:ml-8 pt-3 border-t border-gray-200">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-xs font-bold text-blue-700 uppercase">Tarpaulin Printing Details</p>
                              {editingTarpaulinId === item.id ? (
                                <button
                                  onClick={() => setEditingTarpaulinId(null)}
                                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-300 p-1.5 rounded transition flex items-center gap-1"
                                  title="Save tarpaulin changes"
                                >
                                  <Check size={16} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingTarpaulinId(item.id)}
                                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-300 p-1.5 rounded transition"
                                  title="Edit tarpaulin"
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-blue-600">Width</span>
                                <select
                                  value={item.serviceRequirements.sizeSpecifications.width || ""}
                                  disabled={editingTarpaulinId !== item.id}
                                  onChange={(e) => {
                                    const w = Number(e.target.value)
                                    const h = Number(item.serviceRequirements.sizeSpecifications.height) || 0
                                    const sqft = w * h
                                    const detailPrice = sqft * 20
                                    const updated = { ...item, serviceRequirements: { ...item.serviceRequirements, sizeSpecifications: { ...item.serviceRequirements.sizeSpecifications, width: w, totalSqft: sqft, totalPrice: detailPrice } } }
                                    updateLineItem(item.id, updated)
                                  }}
                                  className={`text-sm font-medium px-2 py-1 border rounded outline-none transition ${editingTarpaulinId === item.id
                                    ? 'text-gray-900 border-blue-300 focus:border-blue-500'
                                    : 'text-gray-900 border-gray-300 bg-gray-50 cursor-not-allowed'
                                    }`}
                                >
                                  <option value="">Select Width</option>
                                  {Array.from({ length: 8 }, (_, i) => 3 + i).map((w) => (
                                    <option key={w} value={w}>{w} ft</option>
                                  ))}
                                </select>
                                <span className="text-xs text-gray-500 mt-1">ft</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-blue-600">Height</span>
                                <select
                                  value={item.serviceRequirements.sizeSpecifications.height || ""}
                                  disabled={editingTarpaulinId !== item.id}
                                  onChange={(e) => {
                                    const h = Number(e.target.value)
                                    const w = Number(item.serviceRequirements.sizeSpecifications.width) || 0
                                    const sqft = w * h
                                    const detailPrice = sqft * 20
                                    const updated = { ...item, serviceRequirements: { ...item.serviceRequirements, sizeSpecifications: { ...item.serviceRequirements.sizeSpecifications, height: h, totalSqft: sqft, totalPrice: detailPrice } } }
                                    updateLineItem(item.id, updated)
                                  }}
                                  className={`text-sm font-medium px-2 py-1 border rounded outline-none transition ${editingTarpaulinId === item.id
                                    ? 'text-gray-900 border-blue-300 focus:border-blue-500'
                                    : 'text-gray-900 border-gray-300 bg-gray-50 cursor-not-allowed'
                                    }`}
                                >
                                  <option value="">Select Height</option>
                                  {Array.from({ length: 9 }, (_, i) => 2 + i).map((h) => (
                                    <option key={h} value={h}>{h} ft</option>
                                  ))}
                                </select>
                                <span className="text-xs text-gray-500 mt-1">ft</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-blue-600">Total Sq Ft</span>
                                <input
                                  type="text"
                                  value={item.serviceRequirements.sizeSpecifications.totalSqft || "0"}
                                  disabled
                                  className="text-sm font-medium text-gray-900 px-2 py-1 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                                />
                                <span className="text-xs text-gray-500 mt-1">sq ft</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-blue-600">Detail Price</span>
                                <input
                                  type="text"
                                  value={item.serviceRequirements.sizeSpecifications.totalPrice ? `₱${item.serviceRequirements.sizeSpecifications.totalPrice.toLocaleString()}` : '₱0'}
                                  disabled
                                  className="text-sm font-medium text-gray-900 px-2 py-1 border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-right"
                                />
                              </div>
                            </div>

                            {/* Design Image for Tarpaulin (Simple Display, No Collapsible) */}
                            {item.serviceRequirements?.designPreview && (
                              <div className="pt-4 border-t border-blue-300">
                                <div className="space-y-3">

                                  {/* Comments section for Tarpaulin (from notes) */}
                                  {item.notes && typeof item.notes === 'object' && (item.notes.designNotes || item.notes.sizeNotes || item.notes.additionalNotes) && (
                                    <div className="mb-4">
                                      {item.notes.sizeNotes && (
                                        <div>
                                          <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Size Comments</p>
                                          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-800">
                                            {item.notes.sizeNotes}
                                          </div>
                                        </div>
                                      )}
                                      {item.notes.additionalNotes && (
                                        <div>
                                          <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Additional Comments</p>
                                          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-800">
                                            {item.notes.additionalNotes}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}


                    {/* Design File Details (Collapsible) */}
                    {expandedItems.has(item.id) && item.serviceRequirements && (item.serviceRequirements?.designPreview || item.serviceRequirements?.designImageUrl) && (
                      <div className="mt-3 ml-0 md:ml-8 pt-3 border-t border-gray-200">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border border-blue-200">
                          <p className="text-xs font-bold text-blue-700 uppercase mb-4">Design Details</p>

                          {/* Design Image Preview */}
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-blue-700 mb-2 uppercase">Design Preview</p>
                            {item.serviceRequirements?.designImageUrl ? (
                              <div className="border-2 border-blue-300 rounded-md overflow-hidden bg-white p-3">
                                <img
                                  src={item.serviceRequirements.designImageUrl}
                                  alt="Design preview"
                                  onClick={() => setSelectedImage(item.serviceRequirements?.designImageUrl || null)}
                                  className="max-h-64 max-w-full mx-auto object-contain rounded cursor-pointer hover:shadow-lg transition"
                                  onLoad={() => console.log("Image loaded successfully:", item.serviceRequirements?.designImageUrl)}
                                  onError={() => console.error("Image failed to load:", item.serviceRequirements?.designImageUrl)}
                                />
                              </div>
                            ) : (
                              <div className="border-2 border-blue-300 rounded-md bg-blue-50 p-4 text-center">
                                <p className="text-sm text-gray-600">No image preview available</p>
                              </div>
                            )}
                            <p className="text-xs text-center text-gray-600 mt-2 font-medium">{item.serviceRequirements.designPreview}</p>
                          </div>

                          {/* Design Comments Section */}
                          <div className="pt-3 border-t border-blue-300">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold text-blue-700 uppercase">Design Comments</label>
                              {editingDesignNotesId === item.id ? (
                                <button
                                  onClick={() => setEditingDesignNotesId(null)}
                                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-300 p-1.5 rounded transition flex items-center gap-1"
                                  title="Save comments"
                                >
                                  <Check size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingDesignNotesId(item.id)}
                                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-300 p-1.5 rounded transition"
                                  title="Edit comments"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}
                            </div>
                            <textarea
                              value={typeof item.notes === 'string' ? item.notes : (item.notes?.designNotes || '')}
                              disabled={editingDesignNotesId !== item.id}
                              onChange={(e) => {
                                const notes = typeof item.notes === 'string' ? {} : (item.notes || {})
                                updateLineItem(item.id, {
                                  ...item,
                                  notes: { ...notes as ItemNotes, designNotes: e.target.value }
                                })
                              }}
                              placeholder="Add optional comments about the design..."
                              className={`w-full px-3 py-2 text-sm rounded-md border outline-none transition resize-none ${editingDesignNotesId === item.id
                                ? 'border-gray-400 bg-white focus:border-gray-600 text-gray-900'
                                : 'border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed'
                                }`}
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}


                    {/* Size Specifications Display (Generic) */}
                    {expandedItems.has(item.id) && item.serviceRequirements?.sizeSpecifications &&
                      ((item.serviceRequirements.sizeSpecifications.top || item.serviceRequirements.sizeSpecifications.bottom) ||
                        (item.notes && typeof item.notes === 'object' && item.notes.sizeNotes)) &&
                      !item.serviceRequirements.sizeSpecifications.width && (
                        <div className="mt-3 ml-0 md:ml-8 pt-3 border-t border-gray-200">
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                            <p className="text-xs font-bold text-purple-700 uppercase mb-3">Size Specifications</p>
                            {(item.serviceRequirements.sizeSpecifications.top || item.serviceRequirements.sizeSpecifications.bottom) && (
                              <div className="bg-white rounded border border-purple-300 p-3 space-y-2 mb-4">
                                {item.serviceRequirements.sizeSpecifications.top && (
                                  <p className="text-sm text-gray-800"><span className="font-semibold">Top/Shirt Size:</span> {item.serviceRequirements.sizeSpecifications.top}</p>
                                )}
                                {item.serviceRequirements.sizeSpecifications.bottom && (
                                  <p className="text-sm text-gray-800"><span className="font-semibold">Bottom/Short Size:</span> {item.serviceRequirements.sizeSpecifications.bottom}</p>
                                )}
                              </div>
                            )}

                            {/* Size Notes under Size Specifications */}
                            {item.notes && typeof item.notes === 'object' && item.notes.sizeNotes && (
                              <div className={item.serviceRequirements.sizeSpecifications.top || item.serviceRequirements.sizeSpecifications.bottom ? "mt-4 pt-4 border-t border-purple-300" : ""}>
                                <p className="text-xs font-semibold text-purple-700 uppercase mb-2">Size Notes (Optional)</p>
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded text-sm text-gray-800">
                                  {item.notes.sizeNotes}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Additional Notes Display (if additionalNotes exists) */}
                    {expandedItems.has(item.id) && item.notes && typeof item.notes === 'object' && item.notes.additionalNotes && (
                      <div className="mt-3 ml-0 md:ml-8 pt-3 border-t border-gray-200">
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                          <p className="text-xs font-bold text-amber-700 uppercase mb-3">Comments/Additional Notes (Optional)</p>
                          <div className="bg-white rounded border border-amber-300 p-3">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{item.notes.additionalNotes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Items Buttons */}
            <div className="flex gap-3 mb-8 print:hidden justify-center md:justify-start">
              <button
                onClick={() => {
                  setShowServiceModal(true)
                }}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition shadow-lg text-sm md:text-base"
              >
                <Plus size={18} className="md:w-5 md:h-5" />
                Add Service
              </button>
            </div>

            {/* Items Summary Section */}
            {lineItems.length > 0 && (
              <div className="mb-8 print:hidden">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Services Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lineItems.map((item) => {
                    const isSublimation = item.name?.includes("Sublimation")
                    const isTarpaulin = item.name?.includes("Tarpaulin")
                    const teamRoster = item.serviceRequirements?.teamRoster || []

                    // Calculate team roster stats
                    let setsCount = 0
                    let topOnlyCount = 0
                    let bottomOnlyCount = 0

                    if (isSublimation && Array.isArray(teamRoster)) {
                      teamRoster.forEach((player: any) => {
                        const hasTop = player.sizeTop && player.sizeTop !== "None"
                        const hasBottom = player.sizeBottom && player.sizeBottom !== "None"

                        if (hasTop && hasBottom) {
                          setsCount++
                        } else if (hasTop) {
                          topOnlyCount++
                        } else if (hasBottom) {
                          bottomOnlyCount++
                        }
                      })
                    }

                    return (
                      <div
                        key={item.id}
                        className="p-4 md:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-start gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover border border-blue-300 flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-2 break-words">
                              {item.name}
                            </h4>

                            {isSublimation && Array.isArray(teamRoster) && teamRoster.length > 0 ? (
                              <div className="space-y-1 text-xs md:text-sm text-gray-700">
                                <div className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200">
                                  <span className="font-semibold text-blue-700">{teamRoster.length}</span>
                                  <span className="text-gray-600">Players</span>
                                </div>

                                {setsCount > 0 && (
                                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-green-200">
                                    <span className="font-semibold text-green-700">{setsCount}</span>
                                    <span className="text-gray-600">Sets</span>
                                  </div>
                                )}

                                {topOnlyCount > 0 && (
                                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-amber-200">
                                    <span className="font-semibold text-amber-700">{topOnlyCount}</span>
                                    <span className="text-gray-600">Top Only</span>
                                  </div>
                                )}

                                {bottomOnlyCount > 0 && (
                                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-purple-200">
                                    <span className="font-semibold text-purple-700">{bottomOnlyCount}</span>
                                    <span className="text-gray-600">Bottom Only</span>
                                  </div>
                                )}
                              </div>
                            ) : isTarpaulin && item.serviceRequirements?.sizeSpecifications?.width && item.serviceRequirements?.sizeSpecifications?.height ? (
                              <div className="p-2 bg-white rounded border border-blue-200 text-xs md:text-sm">
                                <p className="font-semibold text-blue-700 mb-1">
                                  {item.serviceRequirements.sizeSpecifications.width}ft × {item.serviceRequirements.sizeSpecifications.height}ft
                                </p>
                                <p className="text-gray-600">
                                  {item.serviceRequirements.sizeSpecifications.totalSqft} sq ft
                                </p>
                              </div>
                            ) : (
                              <div className="p-2 bg-white rounded border border-blue-200 text-xs md:text-sm text-gray-600">
                                Qty: <span className="font-semibold">{item.quantity}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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
          <div className="px-3 md:px-8 pb-4 md:pb-8 flex justify-end">
            <div className="w-full md:w-96">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-4 md:p-6">
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

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl max-h-[80vh] bg-white rounded-lg overflow-hidden"
          >
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Expanded view"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-700 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Service Selector Modal */}
      <ServiceSelectorModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSelect={(service, serviceData) => {
          // Build description with service data
          let description = service.description || ""

          // Add requirement details to description
          if (service.requires_design && serviceData.designPreview) {
            description += "\n✓ Design provided"
          }
          if (serviceData.designConsultation?.needed) {
            description += "\n✓ Design Consultation (₱500)"
            if (serviceData.designConsultation.notes) {
              description += `\n  Design Notes: ${serviceData.designConsultation.notes}`
            }
          }
          if (service.requires_team && serviceData.teamRoster.length > 0) {
            description += `\n✓ Team roster: ${serviceData.teamRoster.length} players`
            // Add team member details
            const rosterText = serviceData.teamRoster
              .map((m) => {
                let sizeInfo = ""
                if (m.sizeTop || m.sizeBottom) {
                  sizeInfo = ` (${m.sizeTop || "-"}/${m.sizeBottom || "-"})`
                }
                return `  • ${m.name} #${m.number}${sizeInfo}`
              })
              .join("\n")
            description += "\n" + rosterText
          }

          // Check if this is a tarpaulin service
          const specs = typeof service.specifications === "string"
            ? JSON.parse(service.specifications)
            : service.specifications
          const isTarpaulin = specs?.size_type === "tarpaulin"

          if (service.requires_size) {
            if (isTarpaulin && serviceData.sizeSpecifications.width && serviceData.sizeSpecifications.height) {
              description += `\n✓ Tarpaulin Size: ${serviceData.sizeSpecifications.width}ft × ${serviceData.sizeSpecifications.height}ft`
              description += `\n  Total: ${serviceData.sizeSpecifications.totalSqft} sq ft = ₱${serviceData.sizeSpecifications.totalPrice?.toLocaleString()}`
            } else if (serviceData.sizeSpecifications.top || serviceData.sizeSpecifications.bottom) {
              description += `\n✓ Sizes: Top ${serviceData.sizeSpecifications.top || "N/A"} / Bottom ${serviceData.sizeSpecifications.bottom || "N/A"}`
            }
          }

          // Calculate unit price (may be adjusted for tarpaulin)
          let unitPrice = service.base_price
          if (isTarpaulin && serviceData.sizeSpecifications.totalPrice) {
            unitPrice = serviceData.sizeSpecifications.totalPrice
          }

          // Add design consultation price
          if (serviceData.designConsultation?.needed) {
            unitPrice += serviceData.designConsultation.price
          }

          const lineItemData = {
            type: "service",
            serviceId: service.id,
            name: service.name,
            description,
            quantity: 1,
            unitPrice,
            image: service.image_url,
            designCost: service.design_cost,
            // Store service requirement data for later
            serviceRequirements: {
              designFile: serviceData.designFile,
              designImageUrl: serviceData.designImageUrl, // Include designImageUrl from modal
              designPreview: serviceData.designPreview,
              teamRoster: serviceData.teamRoster,
              sizeSpecifications: serviceData.sizeSpecifications,
              designConsultation: serviceData.designConsultation,
            },
            // Store notes as well
            notes: {
              designNotes: serviceData.designNotes,
              teamNotes: serviceData.teamNotes,
              sizeNotes: serviceData.sizeNotes,
            },
          }
          addLineItem(lineItemData)
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
            <DialogTitle className="text-2xl font-bold">Send Quotation to Admin</DialogTitle>
            <DialogDescription>
              Send quotation <span className="font-bold text-gray-900">{formData.quoteNumber}</span> to a branch for admin approval and pricing.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Branch <span className="text-red-500">*</span>
              </label>
              {isLoadingBranches ? (
                <div className="flex items-center gap-2 py-3 text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading branches...</span>
                </div>
              ) : branches.length === 0 ? (
                <div className="py-3 text-gray-500 text-sm">
                  No branches available. Please contact administrator.
                </div>
              ) : (
                <select
                  value={selectedBranchId || ""}
                  onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 outline-none transition"
                >
                  <option value="" disabled>Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} {branch.is_main_branch ? "(Main Branch)" : ""} - {branch.location}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Your quotation will be sent to this branch for pricing review.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
            <button
              onClick={() => {
                setShowSendApprovalModal(false)
                setSelectedBranchId(null)
              }}
              disabled={isSending}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmSendForApproval}
              disabled={isSending || !selectedBranchId || isLoadingBranches}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Send to Admin"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Transaction Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600">Cancel Transaction</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 mt-2">
              Are you sure you want to cancel this transaction? All your data will be lost and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              No, Keep It
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCancelDialog(false)
                router.push("/dashboard")
              }}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Yes, Cancel
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

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
