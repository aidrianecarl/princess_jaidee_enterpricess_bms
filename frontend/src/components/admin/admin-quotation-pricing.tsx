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
  const [playerPrices, setPlayerPrices] = useState<Record<string, string>>({})
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectMessage, setRejectMessage] = useState("")

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

      console.log("[v0] Fetched Quotation Data:", quot)
      console.log("[v0] Raw Items:", quot.items)

      // Decode JSON fields from backend
      const processedItems = quot.items?.map((item: any) => {
        console.log(`[v0] Processing Item ID: ${item.id}`)
        
        // Parse team_roster if it's a JSON string
        let teamRoster = item.team_roster
        if (typeof item.team_roster === 'string' && item.team_roster) {
          try {
            teamRoster = JSON.parse(item.team_roster)
            console.log(`[v0] Parsed team_roster:`, teamRoster)
          } catch (e) {
            console.log(`[v0] Failed to parse team_roster:`, e)
            teamRoster = null
          }
        }
        
        // Parse size_specifications if it's a JSON string
        let sizeSpecs = item.size_specifications
        if (typeof item.size_specifications === 'string' && item.size_specifications) {
          try {
            sizeSpecs = JSON.parse(item.size_specifications)
            console.log(`[v0] Parsed size_specifications:`, sizeSpecs)
          } catch (e) {
            console.log(`[v0] Failed to parse size_specifications:`, e)
            sizeSpecs = null
          }
        }
        
        // Parse notes if it's a JSON string
        let notesData = item.notes
        if (typeof item.notes === 'string' && item.notes) {
          try {
            notesData = JSON.parse(item.notes)
            console.log(`[v0] Parsed notes:`, notesData)
          } catch (e) {
            console.log(`[v0] Failed to parse notes:`, e)
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

      console.log("[v0] Processed Items:", processedItems)
      setQuotation({ ...quot, items: processedItems })

      // Initialize editing prices with 0
      const priceMap: Record<number, string> = {}
      processedItems.forEach((item: PricingLineItem) => {
        priceMap[item.id] = "0"
      })
      setEditingPrices(priceMap)

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

  const handlePriceChange = (itemId: number, price: string) => {
    setEditingPrices(prev => ({
      ...prev,
      [itemId]: price
    }))
    // Clear error for this item if it exists
    if (priceErrors[itemId]) {
      setPriceErrors(prev => {
        const updated = { ...prev }
        delete updated[itemId]
        return updated
      })
    }
  }

  const toggleItemExpanded = (itemId: number) => {
    const newSet = new Set(expandedItems)
    if (newSet.has(itemId)) {
      newSet.delete(itemId)
    } else {
      newSet.add(itemId)
    }
    setExpandedItems(newSet)
  }

  const validatePrices = (): boolean => {
    const priceSchema = z.number().min(0.01, "Price must be greater than 0")
    const errors: Record<number, string> = {}

    quotation?.items.forEach(item => {
      const price = Number(editingPrices[item.id] || 0)
      const result = priceSchema.safeParse(price)
      if (!result.success) {
        errors[item.id] = result.error.errors[0].message
      }
    })

    if (Object.keys(errors).length > 0) {
      setPriceErrors(errors)
      return false
    }
    return true
  }

  const calculateLineTotal = (quantity: number, price: number): number => {
    return quantity * price
  }

  const handlePlayerPriceChange = (itemId: number, playerIndex: number, price: string) => {
    const playerKey = `item-${itemId}-player-${playerIndex}`
    setPlayerPrices(prev => ({ ...prev, [playerKey]: price }))
    
    // Auto-update the main item price if this is a team roster item (sublimation printing)
    const item = quotation?.items.find(i => i.id === itemId)
    if (item && Array.isArray(item.team_roster) && item.team_roster.length > 0) {
      // Calculate total price by summing all player prices
      const totalPrice = item.team_roster.reduce((sum: number, _player: any, idx: number) => {
        const key = `item-${itemId}-player-${idx}`
        const playerPrice = parseFloat(playerPrices[key] || price || "0") || 0
        return sum + playerPrice
      }, 0)
      
      // Update the main item price
      if (totalPrice > 0) {
        setEditingPrices(prev => ({
          ...prev,
          [itemId]: totalPrice.toString()
        }))
      }
    }
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

  const handleSendPrices = async () => {
    if (!validatePrices()) {
      toast({
        title: "Validation Error",
        description: "Please fix the pricing errors before sending",
        variant: "destructive",
      })
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmSend = async () => {
    try {
      setIsSaving(true)
      setShowConfirmModal(false)

      if (!quotation) return

      // Prepare items with updated pricing and player prices
      const updatedItems = quotation.items.map(item => {
        const playerPricesForItem = item.team_roster?.map((player: any, idx: number) => {
          const playerKey = `item-${item.id}-player-${idx}`
          return Number(playerPrices[playerKey]) || 0
        }) || []
        
        return {
          id: item.id,
          unit_price: Number(editingPrices[item.id]) || 0,
          line_total: calculateLineTotal(item.quantity, Number(editingPrices[item.id]) || 0),
          player_prices: playerPricesForItem.length > 0 ? playerPricesForItem : undefined,
        }
      })

      const payload = {
        items: updatedItems,
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

      const result = await response.json()

      toast({
        title: "Success",
        description: "Pricing has been sent to the client",
      })

      // Redirect back to quotations list
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

      // Redirect back to quotations list
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
                {/* Top: Logo and Quote Title */}
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

                {/* RIGHT SIDE (FROM SECTION) */}
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

            {/* Line Items Table */}
            <div className="p-3 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                Items
                <span className="text-sm font-normal text-gray-500">
                  ({quotation.items.length} {quotation.items.length === 1 ? "item" : "items"})
                </span>
              </h2>

              <div className="mb-6">
                {/* Table Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-3 pb-3 border-b-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-lg font-semibold text-gray-700">
                  <div className="flex-1 text-sm md:text-base">Name</div>
                  <div className="w-16 md:w-20 text-center text-sm md:text-base">Qty</div>
                  <div className="w-24 text-right text-sm md:text-base">Amount</div>
                </div>

                {/* Table Body */}
                {quotation.items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">No items added </p>
                  </div>
                ) : (
                  quotation.items.map((item: any) => (
                    <div key={item.id} className="mb-4 pb-4 border-b border-gray-200">
                      {/* Main Row - Collapsible */}
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 p-3 bg-gray-50 rounded-lg">
                        {/* Expand Button - Show if there's any expandable content */}
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

                        {/* Quantity Column */}
                        <div className="w-16 md:w-20 flex items-center justify-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            disabled
                            className="w-full px-2 py-1 md:py-2 border border-gray-300 rounded text-center text-xs md:text-sm focus:border-red-600 outline-none bg-gray-100 cursor-not-allowed"
                          />
                        </div>

                        {/* Amount Column - Editable */}
                        <div className="w-24 flex items-center justify-end">
                          <input
                            type="number"
                            value={editingPrices[item.id] || ""}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className={`w-full px-2 py-1 md:py-2 border rounded text-right text-xs focus:outline-none ${priceErrors[item.id]
                                ? "border-red-500 bg-red-50 focus:border-red-500"
                                : "border-orange-400 bg-white focus:border-orange-500"
                              }`}
                          />
                        </div>
                      </div>

                      {/* Collapsible Details */}
                      {expandedItems.has(item.id) && (
                        <div className="mt-3 ml-0 md:ml-8 pt-3 border-t border-gray-200 space-y-3">
                          
                          {/* Team Roster Details */}
                          {item.team_roster && Array.isArray(item.team_roster) && item.team_roster.length > 0 && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="font-semibold text-blue-900 mb-3">TEAM ROSTER DETAILS</h4>
                              <div className="space-y-3">
                                {item.team_roster.map((player: any, idx: number) => {
                                  const playerKey = `item-${item.id}-player-${idx}`
                                  const pricePerPlayer = parseFloat(playerPrices[playerKey] || "0") || 0
                                  const playerTotal = pricePerPlayer * item.quantity
                                  return (
                                    <div key={idx} className="grid grid-cols-6 gap-3 text-sm bg-white p-3 rounded">
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
                                        <p className="text-xs text-gray-600 font-semibold">Bottom Size</p>
                                        <p className="text-gray-900">{player.sizeBottom || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Price per Player</p>
                                        <input
                                          type="number"
                                          value={playerPrices[playerKey] || ""}
                                          onChange={(e) => handlePlayerPriceChange(item.id, idx, e.target.value)}
                                          placeholder="0.00"
                                          step="0.01"
                                          className="w-full px-2 py-1 border border-orange-400 rounded text-right text-xs focus:outline-none bg-white focus:border-orange-500"
                                        />
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Amount</p>
                                        <p className="text-gray-900 font-semibold">₱{playerTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                              <div className="mt-4 pt-4 border-t border-blue-300">
                                <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Total for Team Roster</p>
                                <p className="text-lg text-blue-900 font-bold">
                                  ₱{(
                                    item.team_roster.reduce((sum: number, _player: any, idx: number) => {
                                      const playerKey = `item-${item.id}-player-${idx}`
                                      const pricePerPlayer = parseFloat(playerPrices[playerKey] || "0") || 0
                                      return sum + (pricePerPlayer * item.quantity)
                                    }, 0)
                                  ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                              {item.notes && typeof item.notes === "object" && item.notes.teamNotes && (
                                <div className="mt-4 pt-4 border-t border-blue-300">
                                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Jersey Customization Notes</p>
                                  <p className="text-sm text-blue-900">{item.notes.teamNotes}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Size Specifications */}
                          {item.size_specifications && item.size_specifications !== null && typeof item.size_specifications === "object" && (Object.keys(item.size_specifications).length > 0 || (item.notes && typeof item.notes === "object" && item.notes.sizeNotes)) && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <h4 className="font-semibold text-purple-900 mb-3">UNIFORM CUSTOMIZATION</h4>
                              <div className="grid grid-cols-3 gap-3 text-sm bg-white p-3 rounded">
                                {item.size_specifications.top && (
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold">Top/Shirt Size</p>
                                    <p className="text-gray-900">{item.size_specifications.top}</p>
                                  </div>
                                )}
                                {item.size_specifications.bottom && (
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold">Bottom/Short Size</p>
                                    <p className="text-gray-900">{item.size_specifications.bottom}</p>
                                  </div>
                                )}
                                {item.size_specifications.top || item.size_specifications.bottom ? null : (
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold">Size</p>
                                    <p className="text-gray-900">Not specified</p>
                                  </div>
                                )}
                              </div>
                              {item.notes && typeof item.notes === "object" && item.notes.sizeNotes && (
                                <div className="mt-4 pt-4 border-t border-purple-300">
                                  <p className="text-xs font-semibold text-purple-700 uppercase mb-2">Size Notes</p>
                                  <p className="text-sm text-purple-900">{item.notes.sizeNotes}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Design File Preview */}
                          {item.design_file_url && (
                            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                              <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                                DESIGN PREVIEW
                                <span className="text-xs text-indigo-700 font-normal">(Click to expand)</span>
                              </h4>
                              <div
                                className="relative inline-block cursor-pointer group"
                                onClick={() => {
                                  if (item.design_file_url) {
                                    setExpandedImage(getApiImageUrl(item.design_file_url))
                                  }
                                }}
                              >
                                <img
                                  src={getApiImageUrl(item.design_file_url)}
                                  alt="Design"
                                  className="max-w-md max-h-64 rounded bg-white hover:opacity-90 transition-opacity"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                                  <ZoomIn className="w-8 h-8 text-white" />
                                </div>
                              </div>
                              {item.notes && typeof item.notes === "object" && item.notes.designNotes && (
                                <div className="mt-4 pt-4 border-t border-indigo-300">
                                  <p className="text-xs font-semibold text-indigo-700 uppercase mb-2">Design Comments</p>
                                  <p className="text-sm text-indigo-900">{item.notes.designNotes}</p>
                                </div>
                              )}
                              {item.notes && typeof item.notes === "string" && item.notes.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-indigo-300">
                                  <p className="text-xs font-semibold text-indigo-700 uppercase mb-2">Design Comments</p>
                                  <p className="text-sm text-indigo-900">{item.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Totals Section - Bottom Right */}
            <div className="p-8 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-50">
              <div className="max-w-md ml-auto space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-700">Subtotal:</span>
                  <span className="text-gray-900 font-semibold">₱{subtotal.toFixed(2)}</span>
                </div>

                {/* Discount Section */}
                <div className="border-t border-gray-300 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Discount:</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as "percent" | "peso")}
                        className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value="percent">%</option>
                        <option value="peso">₱</option>
                      </select>
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder="0"
                        className="w-20 px-2 py-1 border border-orange-300 rounded focus:outline-none focus:border-orange-500 bg-orange-50 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Total Discount:</span>
                    <span>- ₱{discount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Tax */}
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Tax (12% VAT):</span>
                    <span>₱{tax.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t-2 border-gray-300 pt-3 bg-orange-50 rounded-lg p-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-orange-600">₱{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Confirm Pricing
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 mt-4">
              <p>Are you sure you want to send this pricing to the client?</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold">₱{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Discount:</span>
                    <span>- ₱{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax (12%):</span>
                  <span>₱{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-orange-200 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total:</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSend}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Yes, Send
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Modal */}
      <AlertDialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Reject Quotation
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 mt-4">
              <p>Are you sure you want to reject this quotation?</p>
              <textarea
                value={rejectMessage}
                onChange={(e) => setRejectMessage(e.target.value)}
                placeholder="Enter rejection reason (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 bg-white text-sm"
                rows={4}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectQuotation}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Expansion Modal */}
      <Dialog open={expandedImage !== null} onOpenChange={(open) => {
        if (!open) {
          setExpandedImage(null)
        }
      }}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black">
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center justify-center p-4">
            {expandedImage && (
              <img
                src={expandedImage}
                alt="Expanded Design"
                className="max-w-full max-h-[80vh] rounded-lg"
                onError={(e) => {
                  e.currentTarget.alt = "Image failed to load"
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
