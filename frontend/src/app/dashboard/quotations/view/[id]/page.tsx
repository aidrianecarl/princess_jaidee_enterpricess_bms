"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getApiImageUrl } from "@/lib/api-urls"
import { ArrowLeft, Loader2, ChevronDown, X, ZoomIn, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { generateQuotationPDF } from "@/lib/pdf-generator"

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
  design_consultation?: any
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

export default function DashboardViewQuotationPage() {
  const params = useParams()
  const quotationId = params.id as string
  const router = useRouter()
  const { toast } = useToast()

  const [quotation, setQuotation] = useState<QuotationForPricing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [sublimationPrices, setSublimationPrices] = useState<Record<number, { setPrice: string; topPrice: string; bottomPrice: string }>>({})
  const [user, setUser] = useState<any>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    fetchQuotation()
  }, [])

  const fetchQuotation = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")
      const url = `${apiUrl}/quotations/${quotationId}`

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

        let designConsultation = item.design_consultation
        if (typeof item.design_consultation === 'string' && item.design_consultation) {
          try {
            designConsultation = JSON.parse(item.design_consultation)
          } catch (e) {
            designConsultation = null
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

        console.log("[v0] Processing item team roster:", {
          itemId: item.id,
          teamRoster: teamRoster,
          sizeSpecs: sizeSpecs,
          designConsultation: designConsultation,
          notes: notesData
        })

        return {
          ...item,
          team_roster: teamRoster,
          size_specifications: sizeSpecs,
          design_consultation: designConsultation,
          notes: notesData,
        }
      }) || []

      console.log("[v0] Quotation fetched successfully:", {
        quotation_id: quot.id,
        items_count: processedItems.length,
        customer: quot.customer,
        first_item_team_roster: processedItems[0]?.team_roster
      })

      setQuotation({ ...quot, items: processedItems })

      // Initialize sublimation pricing
      const sublimationMap: Record<number, { setPrice: string; topPrice: string; bottomPrice: string }> = {}

      processedItems.forEach((item: PricingLineItem) => {
        if (item.service?.name?.includes('Sublimation')) {
          const basePrice = item.unit_price || 0
          sublimationMap[item.id] = {
            setPrice: (Number(basePrice) * 2).toString(),
            topPrice: basePrice.toString(),
            bottomPrice: basePrice.toString(),
          }
        }
      })

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

  const handleDownloadPDF = async () => {
    if (!quotation) return
    try {
      setIsDownloading(true)
      await generateQuotationPDF(quotation)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const calculateSublimationSubtotal = (itemId: number): number => {
    const item = quotation?.items.find((i) => i.id === itemId)
    if (!item) return 0

    const teamRoster = item.team_roster || []
    const prices = sublimationPrices[itemId]
    if (!prices) return 0

    const setPrice = Number(prices.setPrice) || 0
    const topPrice = Number(prices.topPrice) || 0
    const bottomPrice = Number(prices.bottomPrice) || 0

    let total = 0
    teamRoster.forEach((player: any) => {
      const hasTop = player.sizeTop && player.sizeTop !== "None"
      const hasBottom = player.sizeBottom && player.sizeBottom !== "None"

      if (hasTop && hasBottom) {
        total += setPrice
      } else if (hasTop) {
        total += topPrice
      } else if (hasBottom) {
        total += bottomPrice
      }
    })

    return total
  }

  const calculateTarpaulinSubtotal = (itemId: number): number => {
    const item = quotation?.items.find((i) => i.id === itemId)
    if (!item) return 0

    const specs = item.size_specifications
    if (!specs) return 0

    return (specs.totalPrice || 0) * item.quantity
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={40} className="text-red-600 animate-spin" />
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

  return (
    <>
      <DashboardHeader user={user} />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Toolbar */}
        <div className="sticky top-16 z-30 bg-gradient-to-r from-red-600 to-orange-500 shadow-lg">
          <div className="ml-0 md:ml-64 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-2 md:gap-4 py-3 md:py-4 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition text-sm md:text-base"
                >
                  <ArrowLeft size={16} className="md:w-5 md:h-5" />
                  <span className="hidden md:inline">Back</span>
                </button>
                <h2 className="text-lg md:text-xl font-bold text-white">View Quotation</h2>
              </div>
              {quotation.has_price === 1 && (
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="flex items-center gap-1 md:gap-2 px-4 md:px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition disabled:opacity-50 text-sm md:text-base"
                >
                  {isDownloading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Download size={16} className="md:w-5 md:h-5" />}
                  <span className="hidden md:inline">Download PDF</span>
                  <span className="md:hidden">PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="ml-0 md:ml-64 px-3 md:px-4 lg:px-8 py-6 md:py-8">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Bill To / Client</h3>
                    <div className="space-y-1 text-sm text-gray-900">
                      <p className="font-semibold text-lg">{quotation.customer?.name || quotation.customer?.bill_to_name || "-"}</p>
                      <p>{quotation.customer?.email || quotation.customer?.bill_to_email || "-"}</p>
                      <p className="text-xs text-gray-500 mt-2">{quotation.customer?.bill_to_street || quotation.customer?.street || ""}</p>
                      <p className="text-xs text-gray-500">{quotation.customer?.bill_to_city || quotation.customer?.city || ""} {quotation.customer?.bill_to_state || quotation.customer?.state || ""}</p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
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

            {/* Pricing Details */}
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
                          {/* Team Roster */}
                          {Array.isArray(item.team_roster) && item.team_roster.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <h4 className="font-bold text-blue-900 mb-3">TEAM ROSTER DETAILS</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs md:text-sm">
                                  <thead>
                                    <tr className="border-b border-blue-200">
                                      <th className="text-left p-2 font-semibold text-blue-900">Name</th>
                                      <th className="text-left p-2 font-semibold text-blue-900">Jersey #</th>
                                      <th className="text-left p-2 font-semibold text-blue-900">Top Size</th>
                                      <th className="text-left p-2 font-semibold text-blue-900">Top Length (in)</th>
                                      <th className="text-left p-2 font-semibold text-blue-900">Bottom Size</th>
                                      <th className="text-left p-2 font-semibold text-blue-900">Bottom Length (in)</th>
                                      <th className="text-left p-2 font-semibold text-blue-900">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.team_roster.map((player: any, idx: number) => {
                                      const hasTop = player.sizeTop && player.sizeTop !== "None"
                                      const hasBottom = player.sizeBottom && player.sizeBottom !== "None"
                                      const prices = sublimationPrices[item.id]
                                      const setPrice = prices ? Number(prices.setPrice) : 0
                                      const topPrice = prices ? Number(prices.topPrice) : 0
                                      const bottomPrice = prices ? Number(prices.bottomPrice) : 0

                                      let amount = 0
                                      if (hasTop && hasBottom) {
                                        amount = setPrice
                                      } else if (hasTop) {
                                        amount = topPrice
                                      } else if (hasBottom) {
                                        amount = bottomPrice
                                      }

                                      return (
                                        <tr key={idx} className="border-b border-blue-100 hover:bg-blue-100/50">
                                          <td className="p-2 text-gray-900">{player.name || "-"}</td>
                                          <td className="p-2 text-gray-900">{player.number || "-"}</td>
                                          <td className="p-2 text-gray-900">{player.sizeTop || "-"}</td>
                                          <td className="p-2 text-gray-900">{player.lengthTopInches || "-"}</td>
                                          <td className="p-2 text-gray-900">{player.sizeBottom || "-"}</td>
                                          <td className="p-2 text-gray-900">{player.lengthBottomInches || "-"}</td>
                                          <td className="p-2 font-bold text-blue-600">₱{amount.toLocaleString()}</td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Size Specifications */}
                          {item.size_specifications && typeof item.size_specifications === "object" && Object.keys(item.size_specifications).length > 0 && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <h4 className="font-bold text-green-900 mb-3">SIZE SPECIFICATIONS</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                {Object.entries(item.size_specifications).map(([key, value]: [string, any]) => (
                                  <div key={key} className="p-2 bg-white rounded border border-green-100">
                                    <p className="text-green-700 font-semibold capitalize text-xs">{key}</p>
                                    <p className="text-gray-900">{value || "-"}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Design File */}
                          {item.design_file_url && (
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                              <h4 className="font-bold text-purple-900 mb-3">DESIGN FILE</h4>
                              <div
                                className="relative inline-block cursor-pointer"
                                onClick={() => setExpandedImage(getApiImageUrl(item.design_file_url))}
                              >
                                <img
                                  src={getApiImageUrl(item.design_file_url)}
                                  alt="Design"
                                  className="max-w-xs max-h-40 rounded-lg border border-purple-200 hover:opacity-75 transition"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                  <ZoomIn size={32} className="text-white bg-black/50 rounded-full p-2" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {item.notes && (
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                              <h4 className="font-bold text-amber-900 mb-2">NOTES</h4>
                              <p className="text-gray-900 whitespace-pre-wrap text-sm">
                  {typeof item.notes === 'string' 
                    ? item.notes 
                    : typeof item.notes === 'object' 
                      ? (item.notes.additionalNotes || item.notes.teamNotes || item.notes.sizeNotes || item.notes.designNotes || item.notes.notes || Object.values(item.notes).filter((v: any) => v && typeof v === 'string').join(' | ') || 'No notes')
                      : 'No notes'}
                </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Totals Section */}
            <div className="p-8 bg-gradient-to-r from-red-50 to-orange-50 border-t-4 border-orange-200">
              <div className="max-w-md ml-auto space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">₱{quotation.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {quotation.discount > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Discount:</span>
                      <span className="font-semibold text-gray-900">-₱{quotation.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}
                {quotation.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Tax:</span>
                    <span className="font-semibold text-gray-900">₱{quotation.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-orange-200">
                  <span className="text-red-600">TOTAL:</span>
                  <span className="text-red-600">₱{quotation.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* General Notes */}
            {quotation.notes && (
              <div className="p-8 bg-gray-50 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">General Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{quotation.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Expand Modal */}
      <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Design Preview</DialogTitle>
          </DialogHeader>
          {expandedImage && (
            <img src={expandedImage} alt="Design Preview" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
