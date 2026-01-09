"use client"

import { useState, useRef } from "react"
import { X, Download, Printer, Loader2 } from "lucide-react"

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
  const printRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !quotation) return null

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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col my-auto">
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
        <div
          id={`quotation-${quotation.id}`}
          ref={printRef}
          className="flex-1 overflow-y-auto p-6 sm:p-8 print:p-0 space-y-6"
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

          {/* Items Table */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Items</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 text-gray-700 font-semibold">Description</th>
                    <th className="text-right py-2 text-gray-700 font-semibold">Qty</th>
                    <th className="text-right py-2 text-gray-700 font-semibold">Unit Price</th>
                    <th className="text-right py-2 text-gray-700 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 text-gray-700">{item.name}</td>
                      <td className="text-right py-3 text-gray-700">{item.quantity}</td>
                      <td className="text-right py-3 text-gray-700">₱{Number(item.unit_price).toLocaleString()}</td>
                      <td className="text-right py-3 text-gray-700">₱{Number(item.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                        : "bg-gray-100 text-gray-700"
                }`}
              >
                {quotation.status === "pending"
                  ? "Pending"
                  : quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
