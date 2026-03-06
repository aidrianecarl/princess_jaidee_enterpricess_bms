"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowLeft, Download, Printer, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

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
  validUntil: string
  logoUrl?: string
}

interface PreviewData {
  formData: FormData
  lineItems: LineItem[]
  subtotal: number
  totalDue: number
  logoPreview: string
}

export default function PreviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const data = sessionStorage.getItem("quotationPreviewData")
    if (data) {
      try {
        setPreviewData(JSON.parse(data))
      } catch (error) {
        console.error("Failed to load preview data:", error)
        toast({
          title: "Error",
          description: "Failed to load preview data",
          variant: "destructive",
        })
        router.back()
      }
    } else {
      router.back()
    }
  }, [router, toast])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show the warning if not preview navigation
      const isPreviewNav = sessionStorage.getItem("isPreviewNavigation")
      if (!isPreviewNav) {
        e.preventDefault()
        e.returnValue = ""
      }
      // Clear the preview navigation flag
      sessionStorage.removeItem("isPreviewNavigation")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

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
      pdf.save(`${previewData?.formData.quoteNumber}.pdf`)

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

  const handleGoBackToEdit = () => {
    router.back()
  }

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading preview...</p>
        </div>
      </div>
    )
  }

  const { formData, lineItems, subtotal, totalDue, logoPreview } = previewData

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Header with Exit Button */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900">Preview Quotation</h1>
            <button
              onClick={handleGoBackToEdit}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition"
            >
              <ArrowLeft size={18} />
              Back to Edit
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          ref={printRef}
          className="bg-white shadow-2xl rounded-xl p-8 print:shadow-none print:rounded-none print:p-0"
        >
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8 print:mb-6">
            <div>
              {logoPreview && (
                <img
                  src={logoPreview || "/placeholder.svg"}
                  alt="Company Logo"
                  className="w-24 h-24 object-contain mb-4"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    // Keep the original logo URL, don't replace with placeholder for print
                  }}
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
                <span className="font-semibold">Valid Until:</span> {new Date(formData.validUntil).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* From/To Section */}
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

          {/* Items Table */}
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

          {/* Totals Section */}
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

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center px-4 py-8 print:hidden">
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
          Print
        </button>
      </div>
    </div>
  )
}
