"use client"

import { useState, useRef } from "react"
import { X, Download, Printer, Loader2, ChevronDown, ChevronUp, ZoomIn } from "lucide-react"

interface PricingLineItem {
  id: number
  quotation_id: number
  service_id?: number
  description: string
  quantity: number
  unit_price: number | string
  line_total: number | string
  design_file_url?: string
  notes?: any
  team_roster?: any
  size_specifications?: any
  service?: {
    id: number
    name: string
    image_url?: string
    description?: string
  }
}

interface Quotation {
  id: number
  quotation_number: string
  customer: any
  items: any[]
  subtotal: number
  discount: number
  tax: number
  total: number
  status: string
  created_at: string
  notes: string
  logo?: string
}

interface QuotationViewModalProps {
  quotation: Quotation | null
  isOpen: boolean
  onClose: () => void
}

export function QuotationViewModal({ quotation, isOpen, onClose }: QuotationViewModalProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !quotation) return null

  const toggleItemExpanded = (itemId: number) => {
    const newSet = new Set(expandedItems)
    if (newSet.has(itemId)) {
      newSet.delete(itemId)
    } else {
      newSet.add(itemId)
    }
    setExpandedItems(newSet)
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
      pdf.save(`${quotation.quotation_number}.pdf`)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const renderJsonValue = (value: any): string => {
    if (typeof value === "string") return value
    if (typeof value === "number") return value.toString()
    if (typeof value === "boolean") return value ? "Yes" : "No"
    if (Array.isArray(value)) return `Array with ${value.length} items`
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col my-auto">
        {/* Header - Sticky */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-6 flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
          <h2 className="text-2xl font-bold">{quotation.quotation_number}</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-700 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Action Buttons - Sticky below header */}
        <div className="bg-white border-b border-gray-200 p-4 flex gap-2 sticky top-[70px] z-10 flex-shrink-0 print:hidden flex-wrap sm:flex-nowrap">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isDownloading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={18} />
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isPrinting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Printing...
              </>
            ) : (
              <>
                <Printer size={18} />
                Print
              </>
            )}
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div
            id={`quotation-${quotation.id}`}
            ref={printRef}
            className="p-6 sm:p-8 print:p-0 space-y-6"
          >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8 print:mb-6">
              <div>
                {quotation.logo && (
                  <img
                    src={quotation.logo || "/placeholder.svg"}
                    alt="Company Logo"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-4"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.style.display = "none"
                    }}
                  />
                )}
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Quotation</h3>
                <p className="text-lg sm:text-xl text-gray-600">{quotation.quotation_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(quotation.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Customer/Company Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 pb-8 border-b-2 border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Bill To</h4>
                <p className="text-gray-700 font-medium">{quotation.customer?.name}</p>
                {quotation.customer?.address && <p className="text-gray-600 text-sm">{quotation.customer.address}</p>}
                {quotation.customer?.email && <p className="text-gray-600 text-sm">{quotation.customer.email}</p>}
                {quotation.customer?.phone && <p className="text-gray-600 text-sm">{quotation.customer.phone}</p>}
              </div>
            </div>

            {/* Items with Expandable Details */}
            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-4">Items</h4>
              <div className="space-y-4">
                {quotation.items.map((item: PricingLineItem, index: number) => {
                  const isExpanded = expandedItems.has(item.id)
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleItemExpanded(item.id)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">{item.description}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × ₱{Number(item.unit_price).toLocaleString()} = ₱
                            {Number(item.line_total).toLocaleString()}
                          </p>
                        </div>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>

                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                          {/* Service Image */}
                          {item.service?.image_url && (
                            <div>
                              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Service Image</p>
                              <div className="relative max-w-sm">
                                <img
                                  src={item.service.image_url}
                                  alt={item.service.name}
                                  className="w-full h-auto rounded-lg border border-gray-200 object-cover max-h-48 cursor-pointer hover:opacity-90"
                                  onClick={() =>
                                    setExpandedImage(expandedImage === item.service?.image_url ? null : item.service?.image_url || null)
                                  }
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement
                                    img.style.display = "none"
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    setExpandedImage(expandedImage === item.service?.image_url ? null : item.service?.image_url || null)
                                  }
                                  className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow hover:shadow-lg transition"
                                >
                                  <ZoomIn size={18} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Design File */}
                          {item.design_file_url && (
                            <div>
                              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Design File</p>
                              <img
                                src={item.design_file_url}
                                alt="Design"
                                className="w-full h-auto rounded-lg border border-gray-200 object-cover max-h-48"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement
                                  img.style.display = "none"
                                }}
                              />
                            </div>
                          )}

                          {/* Notes */}
                          {item.notes && (
                            <div>
                              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Notes</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {typeof item.notes === "string" ? item.notes : JSON.stringify(item.notes, null, 2)}
                              </p>
                            </div>
                          )}

                          {/* Team Roster */}
                          {item.team_roster && (
                            <div>
                              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Team Roster</p>
                              {Array.isArray(item.team_roster) ? (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  {item.team_roster.map((player: any, idx: number) => (
                                    <div key={idx} className="py-2 border-b border-gray-200 last:border-b-0">
                                      <p className="text-sm font-semibold text-gray-900">{player.name || `Player ${idx + 1}`}</p>
                                      {player.number && <p className="text-sm text-gray-600">Number: {player.number}</p>}
                                      {player.position && <p className="text-sm text-gray-600">Position: {player.position}</p>}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                                  {JSON.stringify(item.team_roster, null, 2)}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Size Specifications */}
                          {item.size_specifications && (
                            <div>
                              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Size Specifications</p>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 whitespace-pre-wrap font-mono text-xs">
                                {JSON.stringify(item.size_specifications, null, 2)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-full sm:w-80 space-y-2 border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-semibold">₱{Number(quotation.subtotal).toLocaleString()}</span>
                </div>
                {quotation.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-gray-900 font-semibold">-₱{Number(quotation.discount).toLocaleString()}</span>
                  </div>
                )}
                {quotation.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900 font-semibold">₱{Number(quotation.tax).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-2">
                  <span className="text-gray-900">Total Due</span>
                  <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                    ₱{Number(quotation.total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quotation.notes && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-600 text-sm whitespace-pre-line">{quotation.notes}</p>
              </div>
            )}

            {/* Status Badge */}
            <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mt-1 ${
                    quotation.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : quotation.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : quotation.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : quotation.status === "draft"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/75 z-[60] flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:bg-black/50 rounded-lg transition"
            >
              <X size={24} />
            </button>
            <img src={expandedImage} alt="Expanded view" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}
    </div>
  )
}
