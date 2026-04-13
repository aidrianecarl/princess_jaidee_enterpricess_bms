"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/header"
import { getApiImageUrl } from "@/lib/api-urls"
import { generateQuotationPDF } from "@/lib/pdf-generator"

interface TeamMember {
  name: string
  number: number
  sizeTop?: string
  sizeBottom?: string
}

interface QuotationItem {
  id: number
  service_id: number
  quantity: number
  unit_price: number
  description: string
  design_file_url?: string
  team_roster?: any
  size_specifications?: any
  notes?: any
  service?: { id: number; name: string }
}

interface Quotation {
  id: number
  quotation_number: string
  business_name: string
  business_address: string
  business_city: string
  business_state: string
  business_postal: string
  business_phone: string
  business_email: string
  subtotal: number
  discount: number
  tax: number
  total: number
  notes: string
  status: string
  has_price: number
  created_at: string
  items: QuotationItem[]
  logo_url?: string
}

export default function ViewQuotationPage() {
  const params = useParams()
  const router = useRouter()
  const quotationId = params.id

  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    if (quotationId) {
      fetchQuotation()
    }
  }, [quotationId])

  const parseJSON = (value: any): any => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }

  const fetchQuotation = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")

      if (!token) {
        router.push("/")
        return
      }

      const response = await fetch(`${apiUrl}/quotations/${quotationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch quotation")
      }

      const data = await response.json()
      const quot = data.data || data
      
      // Parse JSON fields from items
      if (quot.items && Array.isArray(quot.items)) {
        quot.items = quot.items.map((item: QuotationItem) => ({
          ...item,
          team_roster: parseJSON(item.team_roster),
          size_specifications: parseJSON(item.size_specifications),
          notes: parseJSON(item.notes),
        }))
      }
      
      setQuotation(quot)
    } catch (err) {
      console.error("[v0] Error fetching quotation:", err)
      setError(err instanceof Error ? err.message : "Failed to load quotation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!quotation) return
    
    try {
      setIsDownloading(true)
      await generateQuotationPDF(quotation, `quotation-${quotation.quotation_number}`)
    } catch (err) {
      console.error("[v0] Error downloading PDF:", err)
      alert("Failed to download PDF")
    } finally {
      setIsDownloading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <DashboardHeader user={user} />
        <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <DashboardHeader user={user} />
        <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button onClick={() => router.back()} variant="outline" className="gap-2">
              <ArrowLeft size={16} />
              Back
            </Button>
          </div>
          <Card className="p-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
            <p className="text-red-700 dark:text-red-400">{error || "Quotation not found"}</p>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <DashboardHeader user={user} />

      <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
        {/* Header with Back Button and Download */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Button onClick={() => router.back()} variant="outline" className="gap-2">
            <ArrowLeft size={16} />
            Back
          </Button>
          {quotation.has_price === 1 && (
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isDownloading}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Download size={16} />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
              {quotation.quotation_number}
            </h1>
            <Badge className={`${quotation.status === "sent" ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" : quotation.has_price === 1 ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"}`}>
              {quotation.status === "sent" ? "Sent to Production" : quotation.has_price === 1 ? "Priced" : "Pending"}
            </Badge>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Created {formatDate(quotation.created_at)}</p>
        </div>

        {/* Business Information */}
        <Card className="p-6 mb-6 border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Business Name</p>
              <p className="font-semibold text-neutral-900 dark:text-white">{quotation.business_name}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Email</p>
              <p className="font-semibold text-neutral-900 dark:text-white">{quotation.business_email}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Phone</p>
              <p className="font-semibold text-neutral-900 dark:text-white">{quotation.business_phone}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Address</p>
              <p className="font-semibold text-neutral-900 dark:text-white">
                {quotation.business_address}, {quotation.business_city}, {quotation.business_state} {quotation.business_postal}
              </p>
            </div>
          </div>
        </Card>

        {/* Quotation Items */}
        {quotation.items && quotation.items.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Quotation Items</h2>
            
            {quotation.items.map((item) => {
              const teamRoster = Array.isArray(item.team_roster) ? item.team_roster : null
              const sizeSpecs = typeof item.size_specifications === 'object' ? item.size_specifications : null

              return (
                <div key={item.id} className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shadow-md hover:shadow-lg transition">
                  {/* Item Header */}
                  <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                          {item.service?.name || 'Service Item'}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Quantity: <span className="font-semibold text-neutral-900 dark:text-white">{item.quantity}</span>
                          </span>
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Unit Price: <span className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(item.unit_price)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Total</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Team Roster */}
                    {teamRoster && teamRoster.length > 0 && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-4 text-lg">Team Roster</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900/50">
                                <th className="px-4 py-3 text-left font-semibold text-blue-900 dark:text-blue-300">Player Name</th>
                                <th className="px-4 py-3 text-center font-semibold text-blue-900 dark:text-blue-300">Jersey #</th>
                                <th className="px-4 py-3 text-center font-semibold text-blue-900 dark:text-blue-300">Top Size</th>
                                <th className="px-4 py-3 text-center font-semibold text-blue-900 dark:text-blue-300">Bottom Size</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teamRoster.map((player: TeamMember, idx: number) => (
                                <tr key={idx} className="border-b border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
                                  <td className="px-4 py-3 text-neutral-900 dark:text-white font-medium">{player.name}</td>
                                  <td className="px-4 py-3 text-center text-neutral-900 dark:text-white font-semibold">#{player.number}</td>
                                  <td className="px-4 py-3 text-center text-neutral-900 dark:text-white">{player.sizeTop || '—'}</td>
                                  <td className="px-4 py-3 text-center text-neutral-900 dark:text-white">{player.sizeBottom || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Size Specifications */}
                    {sizeSpecs && Object.keys(sizeSpecs).length > 0 && (
                      <div className={`p-4 rounded-lg border ${item.service?.name?.includes('Tarpaulin') ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'}`}>
                        <h4 className={`font-bold mb-4 text-lg ${item.service?.name?.includes('Tarpaulin') ? 'text-purple-900 dark:text-purple-300' : 'text-indigo-900 dark:text-indigo-300'}`}>
                          {item.service?.name?.includes('Tarpaulin') ? 'Tarpaulin Size Specification' : 'Uniform Size'}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {sizeSpecs.width && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Width</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.width} ft</p>
                            </div>
                          )}
                          {sizeSpecs.height && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Height</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.height} ft</p>
                            </div>
                          )}
                          {sizeSpecs.totalSqft && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Total Sq Ft</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.totalSqft} sq ft</p>
                            </div>
                          )}
                          {sizeSpecs.top && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Top Size</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.top}</p>
                            </div>
                          )}
                          {sizeSpecs.bottom && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Bottom Size</p>
                              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.bottom}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Design Preview */}
                    {item.design_file_url && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                        <h4 className="font-bold text-gray-900 dark:text-gray-300 mb-4 text-lg">Design Preview</h4>
                        <div className="relative w-full h-64 md:h-80 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                          <img 
                            src={getApiImageUrl(item.design_file_url)} 
                            alt="Design preview" 
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.error("[v0] Image failed to load:", item.design_file_url)
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E"
                            }}
                            className="w-full h-full object-contain p-4"
                          />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          <span className="font-semibold">File:</span> {item.design_file_url?.split('/').pop() || 'Unknown'}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && typeof item.notes === 'object' && Object.keys(item.notes).length > 0 && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-4 text-lg">Notes</h4>
                        <div className="space-y-3">
                          {item.notes.designNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Design Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.designNotes}</p>
                            </div>
                          )}
                          {item.notes.sizeNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Size Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.sizeNotes}</p>
                            </div>
                          )}
                          {item.notes.teamNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Team Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.teamNotes}</p>
                            </div>
                          )}
                          {item.notes.additionalNotes && (
                            <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Additional Notes</p>
                              <p className="text-sm text-neutral-900 dark:text-white mt-1">{item.notes.additionalNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary */}
        <Card className="p-6 border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-800 dark:to-neutral-900">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-neutral-600 dark:text-neutral-400">Subtotal</p>
              <p className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(quotation.subtotal)}</p>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-neutral-600 dark:text-neutral-400">Discount</p>
                <p className="font-semibold text-neutral-900 dark:text-white">-{formatCurrency(quotation.discount)}</p>
              </div>
            )}
            {quotation.tax > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-neutral-600 dark:text-neutral-400">Tax</p>
                <p className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(quotation.tax)}</p>
              </div>
            )}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-neutral-900 dark:text-white">Total</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(quotation.total)}</p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
