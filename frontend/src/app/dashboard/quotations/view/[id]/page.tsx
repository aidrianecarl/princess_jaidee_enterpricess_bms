"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getApiImageUrl } from "@/lib/api-urls"
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, X, ZoomIn, Download } from "lucide-react"
import { useRouter } from "next/navigation"
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"

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
      await generateQuotationPDF(quotation, `quotation-${quotation.quotation_number}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const toggleItemExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
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

  const subtotal = quotation.subtotal
  const discount = quotation.discount
  const tax = quotation.tax
  const total = quotation.total

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
                <h2 className="text-xl font-bold text-white">Quotation Details</h2>
              </div>
              <div className="flex gap-2">
                {quotation.has_price === 1 && (
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition disabled:opacity-50"
                  >
                    {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download size={18} />}
                    Download PDF
                  </button>
                )}
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">Services Summary</h2>
              <div className="space-y-4">
                {quotation.items.map((item, idx) => (
                  <div key={item.id} className="bg-white rounded-lg border border-blue-200 overflow-hidden">
                    <button
                      onClick={() => toggleItemExpanded(item.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-blue-900">{item.service?.name}</p>
                          <p className="text-sm text-gray-600">{item.description || "No description"}</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-gray-900">₱{(Number(item.line_total) || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      {expandedItems.has(item.id) ? (
                        <ChevronUp size={20} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-600" />
                      )}
                    </button>

                    {expandedItems.has(item.id) && (
                      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-6">
                        {/* Design File */}
                        {item.design_file_url && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase">Design File</p>
                            <div
                              className="relative inline-block cursor-pointer group"
                              onClick={() => setExpandedImage(getApiImageUrl(item.design_file_url || ""))}
                            >
                              <img
                                src={getApiImageUrl(item.design_file_url)}
                                alt="Design"
                                className="max-w-xs h-auto rounded-lg border border-gray-300 group-hover:border-blue-500 transition"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center rounded-lg transition">
                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100" size={24} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Team Roster */}
                        {item.team_roster && item.team_roster.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase">Team Roster</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {item.team_roster.map((member: any, i: number) => (
                                <div key={i} className="p-3 bg-white rounded border border-gray-200">
                                  <p className="font-semibold text-gray-900">{member.name}</p>
                                  <p className="text-sm text-gray-600">Number: {member.number}</p>
                                  {member.sizeTop && member.sizeTop !== "None" && (
                                    <p className="text-sm text-gray-600">Top: {member.sizeTop}</p>
                                  )}
                                  {member.sizeBottom && member.sizeBottom !== "None" && (
                                    <p className="text-sm text-gray-600">Bottom: {member.sizeBottom}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Size Specifications */}
                        {item.size_specifications && Object.keys(item.size_specifications).length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase">Size Specifications</p>
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(item.size_specifications).map(([key, value]: [string, any]) => (
                                <div key={key} className="p-2 bg-white rounded border border-gray-200">
                                  <p className="text-xs text-gray-600 uppercase font-semibold">{key}</p>
                                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && Object.keys(item.notes).length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase">Additional Notes</p>
                            <div className="bg-white rounded border border-gray-200 p-3 space-y-2">
                              {Object.entries(item.notes).map(([key, value]: [string, any]) => (
                                <div key={key}>
                                  <p className="text-xs text-gray-600 font-semibold uppercase">{key}</p>
                                  <p className="text-sm text-gray-900">{String(value)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Section */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-lg font-semibold text-gray-900">₱{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-lg font-semibold text-green-600">-₱{discount.toLocaleString()}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-lg font-semibold text-gray-900">₱{tax.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">TOTAL:</span>
                  <span className="text-3xl font-bold text-red-600">₱{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* General Notes */}
            {quotation.notes && (
              <div className="p-8 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Notes:</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{quotation.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Image Expand Modal */}
        <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Design Preview</DialogTitle>
            </DialogHeader>
            {expandedImage && (
              <div className="flex items-center justify-center">
                <img src={expandedImage} alt="Expanded design" className="max-w-full h-auto rounded-lg" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
