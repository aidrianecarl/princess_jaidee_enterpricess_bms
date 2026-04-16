"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getApiImageUrl } from "@/lib/api-urls"
import { Save, ArrowLeft, Loader2, AlertTriangle, Check, ChevronDown, ChevronUp, X, ZoomIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

interface QuotationForPricing {
  id: number
  quotation_number: string
  created_at: string
  customer?: any
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
  has_price: number
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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [priceErrors, setPriceErrors] = useState<Record<number, string>>({})
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectMessage, setRejectMessage] = useState("")
  
  // Sublimation pricing states
  const [sublimationPrices, setSublimationPrices] = useState<Record<number, { setPrice: string; topPrice: string; bottomPrice: string }>>({})

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"

  useEffect(() => {
    fetchQuotation()
  }, [])

  const fetchQuotation = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("admin_token")
      const url = `${apiUrl}/admin/quotations/${quotationId}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch quotation (Status: ${response.status})`)
      }

      const data = await response.json()
      const quot = data.data || data

      // Decode JSON fields from backend
      const processedItems = quot.items?.map((item: any) => {
        let teamRoster = item.team_roster
        if (typeof item.team_roster === 'string' && item.team_roster) {
          try {
            teamRoster = JSON.parse(item.team_roster)
          } catch (e) {
            teamRoster = null
          }
        }
        
        let sizeSpecs = item.size_specifications
        if (typeof item.size_specifications === 'string' && item.size_specifications) {
          try {
            sizeSpecs = JSON.parse(item.size_specifications)
          } catch (e) {
            sizeSpecs = null
          }
        }
        
        let notesData = item.notes
        if (typeof item.notes === 'string' && item.notes) {
          try {
            notesData = JSON.parse(item.notes)
          } catch (e) {
            notesData = null
          }
        }
        
        return {
          ...item,
          team_roster: teamRoster,
          size_specifications: sizeSpecs,
          notes: notesData,
        }
      }) || []

      setQuotation({ ...quot, items: processedItems })

      // Initialize pricing
      const priceMap: Record<number, string> = {}
      const sublimationMap: Record<number, { setPrice: string; topPrice: string; bottomPrice: string }> = {}
      
      processedItems.forEach((item: PricingLineItem) => {
        if (item.service?.name?.includes('Tarpaulin') && item.size_specifications?.totalPrice) {
          priceMap[item.id] = (item.size_specifications.totalPrice * item.quantity).toString()
        } else if (item.service?.name?.includes('Sublimation')) {
          const basePrice = item.unit_price || 0
          sublimationMap[item.id] = {
            setPrice: (Number(basePrice) * 2).toString(),
            topPrice: basePrice.toString(),
            bottomPrice: basePrice.toString(),
          }
          priceMap[item.id] = "0"
        } else {
          priceMap[item.id] = "0"
        }
      })
      
      setEditingPrices(priceMap)
      setSublimationPrices(sublimationMap)

    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load quotation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePlayerAmount = (item: any, player: any, setPrice: number, topPrice: number, bottomPrice: number): number => {
    const hasTop = player.sizeTop && player.sizeTop !== "None"
    const hasBottom = player.sizeBottom && player.sizeBottom !== "None"

    if (hasTop && hasBottom) {
      return setPrice
    } else if (hasTop) {
      return topPrice
    } else if (hasBottom) {
      return bottomPrice
    }
    return 0
  }

  const calculateSublimationSubtotal = (itemId: number): number => {
    const item = quotation?.items.find(i => i.id === itemId)
    if (!item || !item.team_roster) return 0

    const prices = sublimationPrices[itemId]
    if (!prices) return 0

    const setPrice = Number(prices.setPrice) || 0
    const topPrice = Number(prices.topPrice) || 0
    const bottomPrice = Number(prices.bottomPrice) || 0

    return item.team_roster.reduce((sum: number, player: any) => {
      return sum + calculatePlayerAmount(item, player, setPrice, topPrice, bottomPrice)
    }, 0)
  }

  const calculateTarpaulinSubtotal = (itemId: number): number => {
    const item = quotation?.items.find(i => i.id === itemId)
    if (!item) return 0

    if (item.service?.name?.includes('Tarpaulin') && item.size_specifications?.totalPrice) {
      return item.size_specifications.totalPrice * item.quantity
    }
    return 0
  }

  const calculateSubtotal = (): number => {
    if (!quotation) return 0
    return quotation.items.reduce((sum, item) => {
      if (item.service?.name?.includes('Sublimation')) {
        return sum + calculateSublimationSubtotal(item.id)
      } else if (item.service?.name?.includes('Tarpaulin')) {
        return sum + calculateTarpaulinSubtotal(item.id)
      } else {
        const price = Number(editingPrices[item.id]) || 0
        return sum + (price * item.quantity)
      }
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
    // Tax is not automatically applied, only if admin sets it
    return 0
  }

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return subtotal - discount
  }

  const handleSendPrices = async () => {
    setShowConfirmModal(true)
  }

  const handleConfirmSend = async () => {
    try {
      setIsSaving(true)
      setShowConfirmModal(false)

      if (!quotation) return

      // Prepare items with updated pricing
      // For Sublimation items: send sublimation_prices but NOT unit_price/line_total
      // For Tarpaulin items: don't modify pricing (readonly)
      // For other items: send unit_price and line_total
      const updatedItems = quotation.items.map(item => {
        if (item.service?.name?.includes('Sublimation')) {
          // Sublimation items - only send sublimation pricing, keep original unit_price
          return {
            id: item.id,
            unit_price: item.unit_price,  // Keep original
            line_total: item.line_total,  // Keep original
            sublimation_prices: sublimationPrices[item.id]
          }
        } else if (item.service?.name?.includes('Tarpaulin')) {
          // Tarpaulin items - don't modify (size-based pricing is calculated from size_specifications)
          return {
            id: item.id,
            unit_price: item.unit_price,  // Keep original
            line_total: item.line_total,  // Keep original
          }
        } else {
          // Regular items - update with new pricing from input fields
          const unitPrice = Number(editingPrices[item.id]) || 0
          return {
            id: item.id,
            unit_price: unitPrice,
            line_total: unitPrice * item.quantity,
          }
        }
      })

      const payload = {
        items: updatedItems,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        total: calculateTotal(),
        discount_type: discountType,
        discount_value: Number(discountValue),
      }

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

      toast({
        title: "Success",
        description: "Pricing has been sent to the client",
      })

      setTimeout(() => {
        router.push("/admin/quotations")
      }, 1000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to send quotation back to client",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRejectQuotation = async () => {
    try {
      setIsSaving(true)
      setShowRejectModal(false)

      if (!quotation) return

      const token = localStorage.getItem("admin_token")
      const response = await fetch(`${apiUrl}/admin/quotations/${quotationId}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          rejection_message: rejectMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to reject quotation")
      }

      toast({
        title: "Success",
        description: "Quotation has been rejected",
      })

      setTimeout(() => {
        router.push("/admin/quotations")
      }, 1000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to reject quotation",
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
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Toolbar */}
        <div className="sticky top-0 z-30 bg-gradient-to-r from-red-600 to-orange-500 shadow-lg">
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
                <h2 className="text-xl font-bold text-white">Set Pricing</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={handleSendPrices}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-orange-400 hover:bg-orange-500 text-white font-medium transition disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header with Logo */}
            <div className="p-8 border-b-4 border-orange-100">
              <div className="space-y-8">
                <div className="flex gap-8">
                  {quotation.logo_url && (
                    <div className="flex justify-start">
                      <img
                        src={getApiImageUrl(quotation.logo_url)}
                        alt="Logo"
                        className="max-w-32 h-auto rounded-lg bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                  <div className="space-y-4 flex-1">
                    <h1 className="text-4xl font-bold text-red-600">Quote</h1>
                    <div className="grid grid-cols-2 gap-8 text-sm">
                      <div>
                        <p className="text-gray-600">QUOTE NO.</p>
                        <p className="font-semibold text-gray-900">{quotation.quotation_number}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">DATE</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(quotation.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">From</h3>
                  <div className="space-y-1 text-sm text-gray-900">
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

            {/* Bill To Section */}
            <div className="p-8 border-b-2 border-gray-200 bg-orange-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Bill To</h3>
                  <div className="space-y-1 text-gray-900 text-sm">
                    <p className="font-semibold">{quotation.customer?.bill_to_name || "-"}</p>
                    <p>{quotation.customer?.bill_to_street || "-"}</p>
                    <p>
                      {quotation.customer?.bill_to_city || ""} {quotation.customer?.bill_to_state || ""} {quotation.customer?.bill_to_postal || ""}
                    </p>
                    <p>{quotation.customer?.bill_to_phone || "-"}</p>
                    <p>{quotation.customer?.bill_to_email || "-"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">DUE DATE</h3>
                  <div className="space-y-4">
                    <p className="text-gray-900 font-semibold">
                      {quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Summary */}
            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-b-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Services Summary
              </h2>
              <div className="space-y-4">
                {quotation.items.map((item) => {
                  if (item.service?.name?.includes('Sublimation')) {
                    const teamRoster = item.team_roster || []
                    const prices = sublimationPrices[item.id]
                    if (!prices) return null

                    const setPrice = Number(prices.setPrice) || 0
                    const topPrice = Number(prices.topPrice) || 0
                    const bottomPrice = Number(prices.bottomPrice) || 0

                    let setsCount = 0, topOnlyCount = 0, bottomOnlyCount = 0, setsAmount = 0, topAmount = 0, bottomAmount = 0

                    teamRoster.forEach((player: any) => {
                      const hasTop = player.sizeTop && player.sizeTop !== "None"
                      const hasBottom = player.sizeBottom && player.sizeBottom !== "None"

                      if (hasTop && hasBottom) {
                        setsCount++
                        setsAmount += setPrice
                      } else if (hasTop) {
                        topOnlyCount++
                        topAmount += topPrice
                      } else if (hasBottom) {
                        bottomOnlyCount++
                        bottomAmount += bottomPrice
                      }
                    })

                    return (
                      <div key={item.id} className="p-4 bg-white rounded-lg border border-blue-200">
                        <h3 className="font-bold text-blue-900 mb-3">{item.service?.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">{teamRoster.length} Players</span>
                          </div>
                          {setsCount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-700">{setsCount} Sets</span>
                              <span className="font-bold text-green-600">₱{setsAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {topOnlyCount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-700">{topOnlyCount} Top Only</span>
                              <span className="font-bold text-amber-600">₱{topAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {bottomOnlyCount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-700">{bottomOnlyCount} Bottom Only</span>
                              <span className="font-bold text-purple-600">₱{bottomAmount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between col-span-1 md:col-span-2 p-2 bg-blue-100 rounded font-bold">
                            <span>Subtotal</span>
                            <span className="text-blue-700">₱{calculateSublimationSubtotal(item.id).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  } else if (item.service?.name?.includes('Tarpaulin')) {
                    const specs = item.size_specifications
                    if (!specs) return null

                    return (
                      <div key={item.id} className="p-4 bg-white rounded-lg border border-blue-200">
                        <h3 className="font-bold text-blue-900 mb-3">{item.service?.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">{specs.width}ft × {specs.height}ft</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">{specs.totalSqft} sq ft × {item.quantity} qty</span>
                          </div>
                          <div className="flex justify-between col-span-1 md:col-span-2 p-2 bg-blue-100 rounded font-bold">
                            <span>Subtotal</span>
                            <span className="text-blue-700">₱{calculateTarpaulinSubtotal(item.id).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-3 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                Pricing Details
                <span className="text-sm font-normal text-gray-500">
                  ({quotation.items.length} {quotation.items.length === 1 ? "item" : "items"})
                </span>
              </h2>

              <div className="mb-6">
                {quotation.items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">No items added </p>
                  </div>
                ) : (
                  quotation.items.map((item: any) => (
                    <div key={item.id} className="mb-4 pb-4 border-b border-gray-200">
                      {/* Main Row - Collapsible */}
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 p-3 bg-gray-50 rounded-lg">
                        {(Array.isArray(item.team_roster) && item.team_roster.length > 0) ||
                          (item.size_specifications && typeof item.size_specifications === "object" && Object.keys(item.size_specifications).length > 0) ||
                          item.design_file_url ||
                          item.notes ? (
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
                            className="p-1 hover:bg-gray-200 rounded transition self-start md:self-center"
                          >
                            <ChevronDown
                              size={18}
                              className={`transition-transform ${expandedItems.has(item.id) ? "rotate-180" : ""}`}
                            />
                          </button>
                        ) : null}

                        {/* Image & Name Column */}
                        <div className="flex-1 flex gap-2 min-w-0">
                          {item.design_file_url ? (
                            <img
                              src={getApiImageUrl(item.design_file_url)}
                              alt={item.service?.name || "Design"}
                              className="w-12 h-12 md:w-14 md:h-14 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          ) : item.service?.image_url ? (
                            <img
                              src={getApiImageUrl(item.service.image_url)}
                              alt={item.service.name}
                              className="w-12 h-12 md:w-14 md:h-14 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          ) : null}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{item.service?.name || "Custom Item"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Collapsible Details */}
                      {expandedItems.has(item.id) && (
                        <div className="mt-3 ml-0 md:ml-8 pt-3 border-t border-gray-200 space-y-3">
                          
                          {/* Sublimation Pricing */}
                          {item.team_roster && Array.isArray(item.team_roster) && item.team_roster.length > 0 && item.service?.name?.includes('Sublimation') && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="font-semibold text-blue-900 mb-4">Sublimation Printing Service</h4>

                              {/* Team Roster Table */}
                              <h4 className="font-semibold text-blue-900 mb-3">TEAM ROSTER DETAILS</h4>
                              <div className="space-y-2">
                                {item.team_roster.map((player: any, idx: number) => {
                                  const prices = sublimationPrices[item.id]
                                  const setPrice = Number(prices?.setPrice) || 0
                                  const topPrice = Number(prices?.topPrice) || 0
                                  const bottomPrice = Number(prices?.bottomPrice) || 0
                                  const amount = calculatePlayerAmount(item, player, setPrice, topPrice, bottomPrice)

                                  return (
                                    <div key={idx} className="grid grid-cols-7 gap-2 text-sm bg-white p-2 rounded border border-gray-200">
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Name</p>
                                        <p className="text-gray-900">{player.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Jersey #</p>
                                        <p className="text-gray-900">{player.number}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Top Size</p>
                                        <p className="text-gray-900">{player.sizeTop || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Top Length (in)</p>
                                        <p className="text-gray-900">{player.lengthTopInches || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Bottom Size</p>
                                        <p className="text-gray-900">{player.sizeBottom || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Bottom Length (in)</p>
                                        <p className="text-gray-900">{player.lengthBottomInches || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Amount</p>
                                        <p className="text-gray-900 font-semibold">₱{amount.toLocaleString()}</p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {item.notes && typeof item.notes === "object" && item.notes.teamNotes && (
                                <div className="mt-4 pt-4 border-t border-blue-300">
                                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Jersey Customization Notes</p>
                                  <p className="text-sm text-blue-900">{item.notes.teamNotes}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Tarpaulin Size Specification */}
                          {item.size_specifications && item.size_specifications !== null && typeof item.size_specifications === "object" && item.service?.name?.includes('Tarpaulin') && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <h4 className="font-semibold text-purple-900 mb-3">SIZE SPECIFICATION</h4>
                              <div className="grid grid-cols-5 gap-3 mb-4 text-sm bg-white p-3 rounded">
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold">Width</p>
                                  <p className="text-gray-900">{item.size_specifications.width} ft</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold">Height</p>
                                  <p className="text-gray-900">{item.size_specifications.height} ft</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold">Total Sq Ft</p>
                                  <p className="text-gray-900 font-semibold">{item.size_specifications.totalSqft} sq ft</p>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                  <span className="text-sm font-bold text-purple-700">₱20/Ft</span>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold">Detail Price</p>
                                  <p className="text-gray-900 font-bold">₱{item.size_specifications.totalPrice}</p>
                                </div>
                              </div>

                              {/* Quantity Input */}
                              <div className="grid grid-cols-5 gap-3 p-3 bg-white rounded border border-purple-300">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div>
                                  <label className="block text-xs font-semibold text-purple-700 mb-1">Quantity</label>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    disabled
                                    className="w-full px-2 py-2 border border-gray-300 rounded text-center bg-gray-100 cursor-not-allowed"
                                  />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold">Total Price</p>
                                  <p className="text-gray-900 font-bold">₱{(item.size_specifications.totalPrice * item.quantity).toLocaleString()}</p>
                                </div>
                              </div>

                              {item.notes && typeof item.notes === "object" && item.notes.sizeNotes && (
                                <div className="mt-4 pt-4 border-t border-purple-300">
                                  <p className="text-xs font-semibold text-purple-700 uppercase mb-2">Size Notes</p>
                                  <p className="text-sm text-purple-900">{item.notes.sizeNotes}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Design File */}
                          {item.design_file_url && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <h4 className="font-semibold text-green-900 mb-3">DESIGN FILE</h4>
                              <div className="flex gap-3">
                                <img
                                  src={getApiImageUrl(item.design_file_url)}
                                  alt="Design"
                                  className="w-24 h-24 rounded-lg border border-green-300 object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                  }}
                                />
                                <button
                                  onClick={() => setExpandedImage(getApiImageUrl(item.design_file_url))}
                                  className="self-center flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                                >
                                  <ZoomIn size={16} />
                                  View
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-8 border-t-2 border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div></div>
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-700">Subtotal:</span>
                    <span className="font-bold text-gray-900">₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="font-semibold text-gray-700">Discount:</label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as "percent" | "peso")}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="percent">%</option>
                        <option value="peso">₱</option>
                      </select>
                    </div>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-32 px-3 py-1 border border-gray-300 rounded text-right"
                    />
                  </div>

                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-700">Total Discount:</span>
                    <span className="font-bold text-red-600">- ₱{discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="border-t-2 border-gray-300 pt-3"></div>

                  <div className="flex justify-between text-xl">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="font-bold text-red-600">₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Sending Pricing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send this quotation with pricing to the client? This will notify them and they can review the quote.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSend}>
              Yes, Send to Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Quotation</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this quotation. The client will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectQuotation}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reject"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Design Preview</DialogTitle>
          </DialogHeader>
          {expandedImage && (
            <img src={expandedImage} alt="Design" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
