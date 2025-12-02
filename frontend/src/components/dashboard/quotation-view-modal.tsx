"use client"

import { useState } from "react"
import { X, Download, Printer } from "lucide-react"

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
}

interface QuotationViewModalProps {
  quotation: Quotation | null
  isOpen: boolean
  onClose: () => void
}

export function QuotationViewModal({ quotation, isOpen, onClose }: QuotationViewModalProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  if (!isOpen || !quotation) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    setIsPrinting(true)
    try {
        const element = document.getElementById(`quotation-${quotation.id}`)
        if (!element) return

        // Dynamic import (browser only)
        const html2pdf = (await import("html2pdf.js")).default

        const opt = {
        margin: 10,
        filename: `${quotation.quotation_number}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        }

        html2pdf().set(opt).from(element).save()
    } catch (error) {
        console.error("Failed to generate PDF:", error)
    } finally {
        setIsPrinting(false)
    }
    }


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-6 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-bold">{quotation.quotation_number}</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-700 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div id={`quotation-${quotation.id}`} className="p-8 print:p-0 space-y-6">
          {/* Quotation Details */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-600">Quotation Number</p>
              <p className="font-bold text-lg">{quotation.quotation_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-bold text-lg">{new Date(quotation.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p
                className={`font-bold text-lg capitalize ${
                  quotation.status === "approved"
                    ? "text-green-600"
                    : quotation.status === "pending"
                      ? "text-yellow-600"
                      : quotation.status === "rejected"
                        ? "text-red-600"
                        : "text-gray-600"
                }`}
              >
                {quotation.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-bold text-lg text-red-600">₱{Number(quotation.total).toLocaleString()}</p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{quotation.customer?.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{quotation.customer?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{quotation.customer?.phone_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold">{quotation.customer?.address}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Quotation Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Item</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items?.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{item.product?.name || item.service?.name}</p>
                        {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-right">₱{Number(item.unit_price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ₱{Number(item.line_total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-80 space-y-2 bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">₱{Number(quotation.subtotal).toLocaleString()}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="flex justify-between text-orange-700">
                  <span>Discount:</span>
                  <span className="font-semibold">-₱{Number(quotation.discount).toLocaleString()}</span>
                </div>
              )}
              {quotation.tax > 0 && (
                <div className="flex justify-between text-blue-700">
                  <span>Tax:</span>
                  <span className="font-semibold">+₱{Number(quotation.tax).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-red-600">₱{Number(quotation.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-sm text-gray-600 font-semibold mb-2">Notes:</p>
              <p className="text-gray-700">{quotation.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
            <p>Thank you for your business!</p>
            <p className="mt-2">This quotation is valid for 30 days from the date of issue.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3 print:hidden sticky bottom-0">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Printer size={20} />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isPrinting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-semibold"
          >
            <Download size={20} />
            {isPrinting ? "Generating..." : "Download PDF"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
