"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Save, ArrowLeft, Loader2, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"

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

interface PricingLineItem {
  id: number
  quotation_id: number
  product_id?: number
  service_id?: number
  type: string
  name: string
  description: string
  quantity: number
  unit_price: number | string
  line_total: number | string
  image?: string
  notes?: string
  details?: any
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

export function AdminQuotationPricing() {
  const params = useParams()
  const quotationId = params.id as string
  const router = useRouter()
  const { toast } = useToast()
  
  const [quotation, setQuotation] = useState<QuotationForPricing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPrices, setEditingPrices] = useState<Record<number, string>>({})
  const [discountType, setDiscountType] = useState<"percent" | "peso">("percent")
  const [discountValue, setDiscountValue] = useState("0")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    fetchQuotation()
  }, [])

  const fetchQuotation = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Fetching quotation with ID:", quotationId)
      
      const token = localStorage.getItem("admin_token")
      const url = `${apiUrl}/admin/quotations/${quotationId}`
      console.log("[v0] Fetching from URL:", url)
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] Response status:", response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error("[v0] Error response:", errorData)
        throw new Error(`Failed to fetch quotation (Status: ${response.status})`)
      }

      const data = await response.json()
      const quot = data.data || data
      
      console.log("[v0] Quotation loaded:", quot)
      
      setQuotation(quot)
      
      // Initialize editing prices with current prices
      const priceMap: Record<number, string> = {}
      quot.items?.forEach((item: PricingLineItem) => {
        priceMap[item.id] = String(item.unit_price || 0)
      })
      setEditingPrices(priceMap)
      
    } catch (error: any) {
      console.error("[v0] Error fetching quotation:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to load quotation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriceChange = (itemId: number, price: string) => {
    setEditingPrices(prev => ({
      ...prev,
      [itemId]: price
    }))
  }

  const calculateLineTotal = (quantity: number, price: number): number => {
    return quantity * price
  }

  const calculateSubtotal = (): number => {
    if (!quotation) return 0
    return quotation.items.reduce((sum, item) => {
      const price = Number(editingPrices[item.id]) || 0
      return sum + calculateLineTotal(item.quantity, price)
    }, 0)
  }

  const calculateDiscount = (): number => {
    const subtotal = calculateSubtotal()
    if (discountType === "percent") {
      return (subtotal * Number(discountValue)) / 100
    }
    return Number(discountValue) || 0
  }

  const calculateTax = (): number => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return (subtotal - discount) * 0.12
  }

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const tax = calculateTax()
    return subtotal - discount + tax
  }

  const handleSendBack = async () => {
    try {
      setIsSaving(true)
      
      if (!quotation) return

      // Prepare items with updated pricing
      const updatedItems = quotation.items.map(item => ({
        id: item.id,
        unit_price: Number(editingPrices[item.id]) || 0,
        line_total: calculateLineTotal(item.quantity, Number(editingPrices[item.id]) || 0),
      }))

      const payload = {
        items: updatedItems,
        discount_type: discountType,
        discount_value: Number(discountValue),
      }

      console.log("[v0] Sending pricing update:", payload)

      const token = localStorage.getItem("admin_token")
      const response = await fetch(`${apiUrl}/admin/quotations/${quotationId}/pricing`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send quotation back to client")
      }

      const result = await response.json()
      console.log("[v0] Pricing updated successfully:", result)

      toast({
        title: "Success",
        description: "Quotation sent back to client with pricing",
      })

      // Redirect back to quotations list
      setTimeout(() => {
        router.push("/admin/quotations")
      }, 1000)
    } catch (error: any) {
      console.error("[v0] Error sending back quotation:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to send quotation back to client",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading quotation...</p>
        </div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Quotation not found</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
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
      <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <h2 className="text-xl font-bold text-white">Admin Pricing Review</h2>
            </div>
            <button
              onClick={handleSendBack}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
              Send Back to Client
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Logo */}
          <div className="p-8 border-b-4 border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {quotation.logo_url && (
                <div className="flex justify-center md:justify-start">
                  <img 
                    src={quotation.logo_url} 
                    alt="Logo" 
                    className="max-w-xs h-auto rounded-lg"
                    onError={(e) => {
                      console.log("[v0] Logo failed to load:", quotation.logo_url)
                      e.currentTarget.src = "/placeholder.png"
                    }}
                  />
                </div>
              )}
              <div className="md:col-span-2 space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Quotation</h1>
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

          {/* Bill To Section */}
          <div className="p-8 border-b-2 border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
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

              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">From</h3>
                <div className="space-y-2 text-gray-900">
                  <p className="font-semibold">{quotation.business_name}</p>
                  <p>{quotation.business_address}</p>
                  <p>
                    {quotation.business_city}, {quotation.business_state} {quotation.business_postal}
                  </p>
                  <p>{quotation.business_phone}</p>
                  <p>{quotation.business_email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Items</h3>
            <div className="space-y-6">
              {quotation.items.map((item, idx) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Item Image */}
                    {item.image && (
                      <div className="flex justify-center">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="max-w-xs h-auto rounded-lg"
                          onError={(e) => {
                            console.log("[v0] Item image failed:", item.image)
                          }}
                        />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="md:col-span-2">
                      <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-gray-600 text-sm mt-2">{item.description}</p>

                      {/* Display item specific details */}
                      {item.details && (
                        <div className="mt-4 space-y-2 text-sm">
                          {item.details.teamRoster && item.details.teamRoster.length > 0 && (
                            <div>
                              <p className="font-semibold text-gray-700">Team Roster:</p>
                              <ul className="list-disc list-inside text-gray-600">
                                {item.details.teamRoster.map((player: any, i: number) => (
                                  <li key={i}>{player.name} (#{player.number})</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item.details.sizeSpecifications && (
                            <div>
                              <p className="font-semibold text-gray-700">Size Specifications:</p>
                              <p className="text-gray-600">
                                {item.details.sizeSpecifications.width}x{item.details.sizeSpecifications.height} 
                                {item.details.sizeSpecifications.totalSqft && ` (${item.details.sizeSpecifications.totalSqft} sqft)`}
                              </p>
                            </div>
                          )}

                          {item.details.designConsultation && item.details.designConsultation.needed && (
                            <div>
                              <p className="font-semibold text-gray-700">Design Consultation:</p>
                              <p className="text-gray-600">{item.details.designConsultation.notes}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes per item */}
                      {item.notes && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm font-semibold text-blue-900">Notes:</p>
                          <p className="text-sm text-blue-800">{item.notes}</p>
                        </div>
                      )}

                      {/* Pricing Section */}
                      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <label className="text-gray-600 font-medium">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="text-gray-600 font-medium">Unit Price (₱)</label>
                          <input
                            type="number"
                            value={editingPrices[item.id] || ""}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            placeholder="Enter price"
                            className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:border-blue-500 bg-blue-50"
                          />
                        </div>
                        <div>
                          <label className="text-gray-600 font-medium">Amount (₱)</label>
                          <input
                            type="text"
                            value={calculateLineTotal(item.quantity, Number(editingPrices[item.id]) || 0).toFixed(2)}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quotation Notes */}
          {quotation.notes && (
            <div className="px-8 py-6 border-t-2 border-gray-300 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Notes</h3>
              <p className="text-gray-900">{quotation.notes}</p>
            </div>
          )}

          {/* Totals Section */}
          <div className="p-8 border-t-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="max-w-sm ml-auto space-y-4">
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-gray-700">Subtotal:</span>
                <span className="text-gray-900">₱{subtotal.toFixed(2)}</span>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="text-gray-700 font-medium flex-1">Discount:</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as "percent" | "peso")}
                      className="px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="percent">%</option>
                      <option value="peso">₱</option>
                    </select>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="0"
                      className="w-32 px-3 py-2 border border-blue-300 rounded focus:outline-none focus:border-blue-500 bg-blue-50"
                    />
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Discount:</span>
                    <span>- ₱{discount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Tax (12% VAT):</span>
                  <span>₱{tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 pt-4 bg-white rounded-lg p-4">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span className="text-blue-600">₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
