"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2, Download, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

interface QuotationItem {
  id: number
  product_id?: number
  service_id?: number
  quantity: number
  unit_price: number
  customization: string
  design_file_url?: string
  team_roster?: any
  size_specifications?: any
  notes?: any
  service?: {
    id: number
    name: string
    image_url?: string
  }
}

interface Quotation {
  id: number
  quotation_number: string
  customer?: any
  business_name: string
  business_address: string
  business_city: string
  business_state: string
  business_postal: string
  business_phone: string
  business_email: string
  logo_url: string
  items: QuotationItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  notes: string
  valid_until: string
  status: string
  has_price: number
  created_at: string
}

export default function ViewQuotationPage() {
  const params = useParams()
  const quotationId = params.id as string
  const router = useRouter()

  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"

  useEffect(() => {
    fetchQuotation()
  }, [])

  const handleSendForProduction = async () => {
    if (!quotation) return

    try {
      setIsSending(true)
      const token = localStorage.getItem("auth_token")
      
      const response = await fetch(`${apiUrl}/quotations/${quotation.id}/send-production`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "sent",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send for production")
      }

      // Update quotation status locally
      setQuotation({
        ...quotation,
        status: "sent",
      })

      alert("Quotation sent for production successfully!")
    } catch (error) {
      console.error("Error sending for production:", error)
      alert("Failed to send for production. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const fetchQuotation = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${apiUrl}/quotations/${quotationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch quotation")
      }

      const data = await response.json()
      const quot = data.data || data

      // Process items
      const processedItems = quot.items?.map((item: any) => {
        let teamRoster = item.team_roster
        if (typeof item.team_roster === 'string' && item.team_roster) {
          try {
            teamRoster = JSON.parse(item.team_roster)
          } catch {
            teamRoster = null
          }
        }

        let sizeSpecs = item.size_specifications
        if (typeof item.size_specifications === 'string' && item.size_specifications) {
          try {
            sizeSpecs = JSON.parse(item.size_specifications)
          } catch {
            sizeSpecs = null
          }
        }

        let notesData = item.notes
        if (typeof item.notes === 'string' && item.notes) {
          try {
            notesData = JSON.parse(item.notes)
          } catch {
            notesData = null
          }
        }

        return {
          ...item,
          team_roster: teamRoster,
          size_specifications: sizeSpecs,
          notes: notesData,
        }
      })

      setQuotation({
        ...quot,
        items: processedItems,
      })
    } catch (error) {
      console.error("Error fetching quotation:", error)
    } finally {
      setIsLoading(false)
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
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const statusColor = quotation.has_price ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  const statusText = quotation.has_price ? "Priced" : "Pending Pricing"

  return (
    <div className="flex">
      {/* Import DashboardSidebar at top and render it here */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      <div className="flex-1 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quotation {quotation.quotation_number}</h1>
                <p className="text-sm text-gray-600">Created {new Date(quotation.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                {quotation.status === "sent" ? "Sent to Production" : statusText}
              </span>
              {quotation.status !== "sent" && quotation.has_price && (
                <Button 
                  onClick={handleSendForProduction}
                  disabled={isSending}
                  className="bg-gradient-to-r from-red-600 to-orange-500 text-white hover:shadow-lg"
                  size="sm"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send for Production
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Client & Business Info */}
          <div className="col-span-1 space-y-6">
            {/* Business Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{quotation.business_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Address</p>
                  <p className="font-semibold text-gray-900">{quotation.business_address}</p>
                </div>
                <div>
                  <p className="text-gray-600">City</p>
                  <p className="font-semibold text-gray-900">{quotation.business_city}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{quotation.business_phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{quotation.business_email}</p>
                </div>
              </div>
            </Card>

            {/* Logo */}
            {quotation.logo_url && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo</h3>
                <img
                  src={quotation.logo_url}
                  alt="Quotation Logo"
                  className="w-full h-auto rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </Card>
            )}
          </div>

          {/* Right Column - Items & Totals */}
          <div className="col-span-2 space-y-6">
            {/* Items Table */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Items</h3>
              <div className="space-y-4">
                {quotation.items.map((item) => (
                  <div key={item.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex gap-4">
                      {item.design_file_url ? (
                        <img
                          src={item.design_file_url}
                          alt={item.service?.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      ) : item.service?.image_url ? (
                        <img
                          src={item.service.image_url}
                          alt={item.service.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                      ) : null}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.service?.name}</p>
                        <p className="text-sm text-gray-600">{item.customization}</p>
                        <div className="mt-2 flex gap-4 text-sm">
                          <span>Qty: {item.quantity}</span>
                          <span>₱{Number(item.unit_price).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {(item.team_roster?.length > 0 || item.size_specifications || item.design_file_url) && (
                      <div className="mt-3">
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
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {expandedItems.has(item.id) ? "Hide Details" : "Show Details"}
                        </button>

                        {expandedItems.has(item.id) && (
                          <div className="mt-3 space-y-3">
                            {/* Team Roster */}
                            {item.team_roster?.length > 0 && (
                              <div className="bg-blue-50 p-3 rounded-lg text-xs">
                                <p className="font-semibold text-blue-900 mb-2">Team Roster</p>
                                {item.team_roster.map((player: any, idx: number) => (
                                  <div key={idx} className="text-blue-800">
                                    {player.name} - Jersey #{player.number}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Size Specs */}
                            {item.size_specifications && (
                              <div className="bg-purple-50 p-3 rounded-lg text-xs">
                                <p className="font-semibold text-purple-900 mb-2">Uniform Customization</p>
                                {item.size_specifications.top && <p>Top Size: {item.size_specifications.top}</p>}
                                {item.size_specifications.bottom && <p>Bottom Size: {item.size_specifications.bottom}</p>}
                                {item.notes?.sizeNotes && <p className="mt-2 italic">{item.notes.sizeNotes}</p>}
                              </div>
                            )}

                            {/* Design */}
                            {item.design_file_url && (
                              <div className="bg-indigo-50 p-3 rounded-lg text-xs">
                                <p className="font-semibold text-indigo-900 mb-2">Design File</p>
                                <button
                                  onClick={() => window.open(item.design_file_url, '_blank')}
                                  className="text-indigo-600 hover:text-indigo-700 underline"
                                >
                                  View Design
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Totals */}
            <Card className="p-6 bg-gradient-to-br from-gray-50 to-white">
              <div className="space-y-3 max-w-sm ml-auto">
                <div className="flex justify-between text-base">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold">₱{quotation.subtotal.toFixed(2)}</span>
                </div>
                {quotation.discount > 0 && (
                  <div className="flex justify-between text-base border-t border-gray-200 pt-3">
                    <span className="text-gray-700">Discount:</span>
                    <span className="font-semibold">- ₱{quotation.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base border-t border-gray-200 pt-3">
                  <span className="text-gray-700">Tax (12%):</span>
                  <span className="font-semibold">₱{quotation.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t-2 border-gray-200 pt-3 bg-orange-50 rounded-lg p-3">
                  <span>Total:</span>
                  <span className="text-orange-600">₱{quotation.total.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* Notes */}
            {quotation.notes && (
              <Card className="p-6 bg-blue-50 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Notes</h3>
                <p className="text-blue-800 text-sm">{quotation.notes}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
