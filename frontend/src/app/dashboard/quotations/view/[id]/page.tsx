"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getApiImageUrl } from "@/lib/api-urls"
import { ArrowLeft, Loader2, ChevronDown, X, ZoomIn, Download, Eye } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/header"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { generateQuotationPDF } from "@/lib/pdf-generator"
import { Button } from "@/components/ui/button"

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

  const [user, setUser] = useState(null)
  const [quotation, setQuotation] = useState<QuotationForPricing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
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
            notesData = item.notes
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
    } catch (error) {
      console.error("Error fetching quotation:", error)
      toast({ title: "Error", description: "Failed to load quotation" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!quotation) return
    setIsDownloading(true)
    try {
      await generateQuotationPDF(quotation, `quotation-${quotation.quotation_number}`)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({ title: "Error", description: "Failed to download PDF" })
    } finally {
      setIsDownloading(false)
    }
  }

  const toggleExpanded = (itemId: number) => {
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
      <>
        <DashboardHeader user={user} />
        <div className="fixed inset-0 pt-16 bg-gray-50 flex items-center justify-center">
          <Loader2 size={48} className="animate-spin text-red-600" />
        </div>
      </>
    )
  }

  if (!quotation) {
    return (
      <>
        <DashboardHeader user={user} />
        <div className="fixed inset-0 pt-16 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Quotation not found</h2>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardHeader user={user} />
      
      <div className="pt-16 min-h-screen bg-gray-50">
        {/* Ribbon with buttons below header */}
        <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const element = document.getElementById('quotation-content')
                  if (element) element.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition font-medium"
              >
                <Eye size={18} />
                View Quotation
              </button>

              {quotation.has_price === 1 && (
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 rounded-lg transition font-medium"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download PDF
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div id="quotation-content" className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header with Logo and Title */}
            <div className="p-8 bg-gradient-to-r from-red-50 to-orange-50 border-b-4 border-orange-300">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex items-start gap-4">
                  {quotation.logo_url && (
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shadow-md flex-shrink-0">
                      <img 
                        src={getApiImageUrl(quotation.logo_url)} 
                        alt="Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">QUOTE</h1>
                    <p className="text-lg font-semibold text-gray-900">#{quotation.quotation_number}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(quotation.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="md:text-right">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">FROM:</h2>
                  <p className="font-semibold text-gray-900">{quotation.business_name}</p>
                  <p className="text-sm text-gray-600">{quotation.business_address}</p>
                  <p className="text-sm text-gray-600">{quotation.business_city}, {quotation.business_state} {quotation.business_postal}</p>
                  <p className="text-sm text-gray-600">{quotation.business_phone}</p>
                  <p className="text-sm text-gray-600">{quotation.business_email}</p>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="p-8 bg-orange-100 border-b-4 border-orange-400">
              <h2 className="text-xl font-bold text-gray-900 mb-4">BILL TO:</h2>
              <p className="font-semibold text-gray-900">{quotation.customer?.name || 'Customer'}</p>
              <p className="text-sm text-gray-600">{quotation.customer?.email || ''}</p>
              {quotation.valid_until && (
                <p className="text-sm text-gray-600 mt-4">
                  <span className="font-semibold">Valid Until:</span> {new Date(quotation.valid_until).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>

            {/* Services Summary */}
            <div className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-blue-900 mb-4">PRICING DETAILS ({quotation.items?.length || 0} item{quotation.items?.length !== 1 ? 's' : ''})</h2>
              
              {quotation.items?.map((item: PricingLineItem, idx: number) => (
                <div key={item.id} className="mb-4 last:mb-0">
                  {/* Collapsible Item Header */}
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full flex items-center gap-3 p-4 bg-white hover:bg-gray-50 border border-blue-200 rounded-lg transition group"
                  >
                    <ChevronDown
                      size={20}
                      className={`text-blue-600 flex-shrink-0 transition-transform ${
                        expandedItems.has(item.id) ? 'rotate-180' : ''
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-gray-900 group-hover:text-blue-600">{item.service?.name || item.description}</span>
                      </div>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">₱{Number(item.line_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedItems.has(item.id) && (
                    <div className="mt-2 p-4 bg-gray-50 border border-blue-200 rounded-lg space-y-4">
                      {/* Service Description */}
                      {item.service?.description && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                          <p className="text-sm text-gray-700">{item.service.description}</p>
                        </div>
                      )}

                      {/* Team Roster */}
                      {Array.isArray(item.team_roster) && item.team_roster.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <span className="w-4 h-4 bg-blue-500 rounded"></span>
                            Team Roster
                          </h4>
                          <div className="space-y-2">
                            {item.team_roster.map((player: any, playerIdx: number) => (
                              <div key={playerIdx} className="p-3 bg-white rounded border border-blue-100">
                                <p className="font-semibold text-gray-900">{player.name}</p>
                                <p className="text-xs text-gray-600">{player.position}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Size Specifications */}
                      {item.size_specifications && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <span className="w-4 h-4 bg-green-500 rounded"></span>
                            Size Specifications
                          </h4>
                          {typeof item.size_specifications === 'object' && item.size_specifications !== null ? (
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(item.size_specifications).map(([key, value]: [string, any]) => (
                                <div key={key} className="p-3 bg-white rounded border border-green-100">
                                  <p className="text-xs font-semibold text-gray-600 uppercase">{key}</p>
                                  <p className="text-sm font-bold text-gray-900">{value}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700">{item.size_specifications}</p>
                          )}
                        </div>
                      )}

                      {/* Design File */}
                      {item.design_file_url && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                            <span className="w-4 h-4 bg-purple-500 rounded"></span>
                            Design File
                          </h4>
                          <div
                            className="relative w-full h-40 bg-gray-200 rounded-lg overflow-hidden cursor-zoom-in group"
                            onClick={() => setExpandedImage(getApiImageUrl(item.design_file_url))}
                          >
                            <img
                              src={getApiImageUrl(item.design_file_url)}
                              alt="Design"
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                              <ZoomIn size={32} className="text-white bg-black/50 rounded-full p-2" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                            <span className="w-4 h-4 bg-amber-500 rounded"></span>
                            Notes
                          </h4>
                          <div className="bg-white p-3 rounded border border-amber-100">
                            {typeof item.notes === 'object' && item.notes !== null ? (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(item.notes, null, 2)}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.notes}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals Section */}
            <div className="p-8 bg-gradient-to-r from-red-50 to-orange-50 border-t-4 border-orange-300">
              <div className="max-w-sm ml-auto space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="font-semibold text-gray-900">₱{quotation.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {quotation.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">Discount:</span>
                    <span className="font-semibold text-gray-900">-₱{quotation.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {quotation.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">Tax:</span>
                    <span className="font-semibold text-gray-900">₱{quotation.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-orange-300">
                  <span className="text-red-600">TOTAL:</span>
                  <span className="text-red-600">₱{quotation.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* General Notes */}
            {quotation.notes && (
              <div className="p-8 bg-gray-50 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">General Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{quotation.notes}</p>
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
