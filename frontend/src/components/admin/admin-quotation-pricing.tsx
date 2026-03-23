"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Save, Mail, Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"

interface PricingLineItem {
  id: number
  name: string
  description: string
  quantity: number
  unit_price: number | string
  line_total: number
  notes?: any
}

interface CustomerData {
  id: number
  bill_to_name: string
  bill_to_email: string
  bill_to_phone: string
  bill_to_street: string
  bill_to_city: string
  bill_to_state: string
  bill_to_postal: string
}

interface QuotationForPricing {
  id: number
  quotation_number: string
  created_at: string
  customer?: CustomerData
  business_name: string
  business_address: string
  business_city: string
  business_state: string
  business_postal: string
  business_phone: string
  business_email: string
  logo_url: string
  items: PricingLineItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  notes: string
  valid_until: string
  status: string
}

interface FormData {
  discountType: "percent" | "peso"
  discountValue: number
}

export function AdminQuotationPricing({ quotationId }: { quotationId: number }) {
  const router = useRouter()
  const { toast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)

  const [quotation, setQuotation] = useState<QuotationForPricing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    discountType: "percent",
    discountValue: 0,
  })

  const [lineItems, setLineItems] = useState<PricingLineItem[]>([])
  const [editingPrices, setEditingPrices] = useState<Record<number, string>>({})

  useEffect(() => {
    fetchQuotation()
  }, [quotationId])

  const fetchQuotation = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Fetching quotation with ID:", quotationId)
      
      const token = localStorage.getItem("admin_token")
      console.log("[v0] Token exists:", !!token)
      
      const url = `${apiUrl}/admin/quotations/${quotationId}`
      console.log("[v0] Fetching from URL:", url)
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error("[v0] Error response:", errorData)
        throw new Error(`Failed to fetch quotation (Status: ${response.status})`)
      }

      const data = await response.json()
      console.log("[v0] Fetched data:", data)
      
      const quot = data.data || data
      console.log("[v0] Quotation object:", quot)
      console.log("[v0] Customer data:", quot.customer)
      
      setQuotation(quot)
      setLineItems(quot.items || [])
      
      // Initialize editing prices with current prices
      const priceMap: Record<number, string> = {}
      quot.items?.forEach((item: PricingLineItem) => {
        priceMap[item.id] = String(item.unit_price || 0)
      })
      setEditingPrices(priceMap)
      
      console.log("[v0] Quotation loaded successfully")
    } catch (error: any) {
      console.error("[v0] Error fetching quotation:", error)
      console.error("[v0] Error message:", error?.message)
      console.error("[v0] Error stack:", error?.stack)
      
      toast({
        title: "Error",
        description: error?.message || "Failed to load quotation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      const price = parseFloat(editingPrices[item.id] || String(item.unit_price) || "0")
      return sum + price * item.quantity
    }, 0)
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    if (formData.discountType === "percent") {
      return (subtotal * formData.discountValue) / 100
    } else {
      return formData.discountValue
    }
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return (subtotal - discount) * 0.12 // 12% VAT
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const tax = calculateTax()
    return subtotal - discount + tax
  }

  const handlePriceChange = (itemId: number, value: string) => {
    setEditingPrices((prev) => ({
      ...prev,
      [itemId]: value,
    }))
  }

  const handleSendBack = async () => {
    try {
      setIsSaving(true)
      const token = localStorage.getItem("admin_token")

      // Prepare updated items
      const updatedItems = lineItems.map((item) => ({
        id: item.id,
        unit_price: parseFloat(editingPrices[item.id] || String(item.unit_price) || "0"),
        line_total: parseFloat(editingPrices[item.id] || String(item.unit_price) || "0") * item.quantity,
      }))

      const payload = {
        items: updatedItems,
        discount_type: formData.discountType,
        discount_value: formData.discountValue,
        status: "approved",
      }

      const response = await fetch(`${apiUrl}/admin/quotations/${quotationId}/pricing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update quotation pricing")
      }

      toast({
        title: "Success",
        description: "Quotation pricing updated and sent back to client",
      })

      // Redirect back to quotations list
      setTimeout(() => {
        router.push("/admin/quotations")
      }, 2000)
    } catch (error) {
      console.error("Error saving pricing:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save pricing",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setShowSendModal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin">
          <Loader2 className="w-12 h-12 text-red-600" />
        </div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Quotation not found</p>
      </div>
    )
  }

  const subtotal = calculateSubtotal()
  const discount = calculateDiscount()
  const tax = calculateTax()
  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-red-600 to-orange-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <h2 className="text-xl font-bold text-white">Quotation {quotation.quotation_number}</h2>
            </div>
            <button
              onClick={() => setShowSendModal(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 font-semibold transition disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail size={20} />}
              Send Back to Client
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={printRef}>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b-4 border-red-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                {quotation.logo_url && (
                  <img src={quotation.logo_url} alt="Logo" className="w-32 h-32 object-contain rounded-lg" />
                )}
              </div>
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{quotation.business_name}</h1>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Quotation #</p>
                    <p className="font-semibold text-gray-900">{quotation.quotation_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(quotation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="p-8 border-b-2 border-gray-300">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Bill To</h3>
            <div className="space-y-2 text-gray-900">
              <p className="font-semibold">{quotation.customer?.bill_to_name || "-"}</p>
              <p>{quotation.customer?.bill_to_street || "-"}</p>
              <p>
                {quotation.customer?.bill_to_city || ""}, {quotation.customer?.bill_to_state || ""} {quotation.customer?.bill_to_postal || ""}
              </p>
              <p>{quotation.customer?.bill_to_phone || "-"}</p>
              <p>{quotation.customer?.bill_to_email || "-"}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Line Items & Pricing</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Item</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Quantity</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Unit Price (PHP)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => {
                    const price = parseFloat(editingPrices[item.id] || String(item.unit_price) || "0")
                    const amount = price * item.quantity

                    return (
                      <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-gray-900">{item.quantity}</td>
                        <td className="py-4 px-4">
                          <Input
                            type="number"
                            value={editingPrices[item.id] || "0"}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            className="w-full text-right font-semibold"
                            placeholder="0.00"
                            step="0.01"
                          />
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900">
                          ₱{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discount and Totals */}
          <div className="px-8 pb-8">
            <div className="flex justify-end">
              <div className="w-full md:w-96">
                <div className="space-y-4">
                  {/* Discount Input */}
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Discount</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm text-gray-600">Type</label>
                        <select
                          value={formData.discountType}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              discountType: e.target.value as "percent" | "peso",
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="percent">Percentage (%)</option>
                          <option value="peso">Peso (₱)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Value</label>
                        <Input
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              discountValue: parseFloat(e.target.value) || 0,
                            }))
                          }
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-6 space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-semibold">
                        ₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Discount:</span>
                        <span className="font-semibold text-red-600">
                          -₱{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (12%):</span>
                      <span className="font-semibold">
                        ₱{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="border-t-2 border-red-300 pt-3 flex justify-between">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-red-600">
                        ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quotation to Client</DialogTitle>
            <DialogDescription>
              This will update the quotation with your pricing and send it back to the client for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Amount:</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBack}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail size={18} />}
                Send Back
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
