"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ZoomIn } from "lucide-react"
import { getApiImageUrl } from "@/lib/api-urls"

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
  }
}

interface DashboardQuotationPricingProps {
  quotation: any
  sublimationPrices: Record<number, { setPrice: string; topPrice: string; bottomPrice: string }>
  expandedItems: Set<number>
  onToggleExpand: (itemId: number) => void
  onImageExpand: (imageUrl: string) => void
}

export function DashboardQuotationPricing({
  quotation,
  sublimationPrices,
  expandedItems,
  onToggleExpand,
  onImageExpand,
}: DashboardQuotationPricingProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  const calculateSublimationSubtotal = (itemId: number): number => {
    const item = quotation?.items.find((i: any) => i.id === itemId)
    if (!item) return 0

    let subtotal = 0

    // If size_specifications with items array exists, sum those prices
    if (item.size_specifications?.items && Array.isArray(item.size_specifications.items)) {
      const basePrice = Number(item.unit_price) || 0
      subtotal = item.size_specifications.items.reduce((sum: number, spec: any) => {
        const qty = Number(spec.qty) || 0
        
        // Determine if it's a SET (both top and bottom) or PCS (single)
        const hasTop = spec.sizeTop && spec.sizeTop !== "-"
        const hasBottom = spec.sizeBottom && spec.sizeBottom !== "-"
        const isSet = hasTop && hasBottom
        
        // Calculate price: SET = baseprice * 2 * qty, PCS = baseprice * qty
        const itemPrice = isSet ? (basePrice * 2 * qty) : (basePrice * qty)
        return sum + itemPrice
      }, 0)
    } else if (item.team_roster) {
      // Fallback to team_roster calculation if no size_specifications.items
      const prices = sublimationPrices[itemId]
      if (prices) {
        const setPrice = Number(prices.setPrice) || 0
        const topPrice = Number(prices.topPrice) || 0
        const bottomPrice = Number(prices.bottomPrice) || 0

        subtotal = item.team_roster.reduce((sum: number, player: any) => {
          const hasTop = player.sizeTop && player.sizeTop !== "None"
          const hasBottom = player.sizeBottom && player.sizeBottom !== "None"

          if (hasTop && hasBottom) {
            return sum + setPrice
          } else if (hasTop) {
            return sum + topPrice
          } else if (hasBottom) {
            return sum + bottomPrice
          }
          return sum
        }, 0)
      }
    }

    // Add design consultation price if present
    if (item.design_consultation && typeof item.design_consultation === "object") {
      const consultationPrice = Number(item.design_consultation.price) || 0
      subtotal += consultationPrice
    }

    return subtotal
  }

  if (!quotation?.items) return null

  return (
    <div className="space-y-4">
      {quotation.items.map((item: PricingLineItem) => {
        if (!item.service?.name?.includes('Sublimation')) return null

        const isExpanded = expandedItems.has(item.id)
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
            <h3 className="font-bold text-blue-900 mb-4">{item.service?.name}</h3>

            {/* Sets, Top Only, Bottom Only Breakdown - 3 Columns */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {teamRoster.length > 0 && (
                <div className="p-2 bg-gray-50 rounded border border-gray-200 text-center">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Players</p>
                  <p className="text-lg font-bold text-gray-900">{teamRoster.length}</p>
                </div>
              )}
              <div className="space-y-2">
                {setsCount > 0 && (
                  <div className="p-2 bg-green-50 rounded border border-green-200 text-center">
                    <p className="text-xs text-green-700 font-semibold mb-1">Sets</p>
                    <p className="text-lg font-bold text-green-600">{setsCount}</p>
                    <p className="text-xs text-green-600">₱{setsAmount.toLocaleString()}</p>
                  </div>
                )}
                {topOnlyCount > 0 && (
                  <div className="p-2 bg-orange-50 rounded border border-orange-200 text-center">
                    <p className="text-xs text-orange-700 font-semibold mb-1">Top Only</p>
                    <p className="text-lg font-bold text-orange-600">{topOnlyCount}</p>
                    <p className="text-xs text-orange-600">₱{topAmount.toLocaleString()}</p>
                  </div>
                )}
                {bottomOnlyCount > 0 && (
                  <div className="p-2 bg-purple-50 rounded border border-purple-200 text-center">
                    <p className="text-xs text-purple-700 font-semibold mb-1">Bottom Only</p>
                    <p className="text-lg font-bold text-purple-600">{bottomOnlyCount}</p>
                    <p className="text-xs text-purple-600">₱{bottomAmount.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div className="p-2 bg-blue-50 rounded border border-blue-300">
                <p className="text-xs text-blue-700 font-semibold mb-1 text-center">Subtotal</p>
                <p className="text-lg font-bold text-blue-700 text-center">₱{calculateSublimationSubtotal(item.id).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
              </div>
            </div>

            {/* Size Specifications Table */}
            {(() => {
              let sizeSpecs = item.size_specifications
              if (typeof item.size_specifications === 'string' && item.size_specifications) {
                try {
                  sizeSpecs = JSON.parse(item.size_specifications)
                } catch (e) {
                  sizeSpecs = null
                }
              }
              
              if (sizeSpecs && typeof sizeSpecs === "object" && sizeSpecs.items && Array.isArray(sizeSpecs.items) && sizeSpecs.items.length > 0) {
                return (
                  <div className="mb-4">
                    <h5 className="font-semibold text-green-900 mb-3 text-sm uppercase bg-green-100 p-2 rounded">Size Specifications - Items List</h5>
                    <div className="overflow-x-auto bg-white rounded border border-green-300">
                      <table className="w-full text-xs">
                        <thead className="bg-green-100 border-b border-green-300">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-700 font-semibold">Qty</th>
                            <th className="px-3 py-2 text-left text-gray-700 font-semibold">Top Size</th>
                            <th className="px-3 py-2 text-left text-gray-700 font-semibold">Top Length (in)</th>
                            <th className="px-3 py-2 text-left text-gray-700 font-semibold">Bottom Size</th>
                            <th className="px-3 py-2 text-left text-gray-700 font-semibold">Bottom Length (in)</th>
                            <th className="px-3 py-2 text-left text-gray-700 font-semibold">Additional Name</th>
                            <th className="px-3 py-2 text-right text-gray-700 font-semibold">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sizeSpecs.items.map((spec: any, idx: number) => {
                            const basePrice = Number(item.unit_price) || 0
                            const qty = Number(spec.qty) || 0
                            
                            // Determine if it's a SET (both top and bottom) or PCS (single)
                            const hasTop = spec.sizeTop && spec.sizeTop !== "-"
                            const hasBottom = spec.sizeBottom && spec.sizeBottom !== "-"
                            const isSet = hasTop && hasBottom
                            
                            // Calculate price: SET = baseprice * 2 * qty, PCS = baseprice * qty
                            const itemPrice = isSet ? (basePrice * 2 * qty) : (basePrice * qty)
                            
                            return (
                            <tr key={idx} className="border-b border-green-200 hover:bg-green-50">
                              <td className="px-3 py-2 text-gray-900 font-semibold">{qty} {isSet ? 'SET' : 'PCS'}</td>
                              <td className="px-3 py-2 text-gray-900">{spec.sizeTop || "-"}</td>
                              <td className="px-3 py-2 text-gray-900">{spec.lengthTopInches || "-"}</td>
                              <td className="px-3 py-2 text-gray-900">{spec.sizeBottom || "-"}</td>
                              <td className="px-3 py-2 text-gray-900">{spec.lengthBottomInches || "-"}</td>
                              <td className="px-3 py-2 text-gray-900">{spec.name || spec.additionalName || "-"}</td>
                              <td className="px-3 py-2 text-right text-green-600 font-bold">₱{itemPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                            </tr>
                          )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              }
              return null
            })()}

            {/* Size Notes */}
            {(() => {
              let notes = item.notes
              if (typeof item.notes === 'string' && item.notes) {
                try {
                  notes = JSON.parse(item.notes)
                } catch (e) {
                  notes = null
                }
              }
              
              if (notes && typeof notes === "object" && notes.sizeNotes) {
                return (
                  <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-300">
                    <h5 className="font-semibold text-blue-900 mb-2 text-sm">Size Notes</h5>
                    <p className="text-xs text-gray-900">{notes.sizeNotes}</p>
                  </div>
                )
              }
              return null
            })()}

            {/* Design File */}
            {item.design_file_url && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
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

            {/* Design Comment */}
            {(() => {
              let notes = item.notes
              if (typeof item.notes === 'string' && item.notes) {
                try {
                  notes = JSON.parse(item.notes)
                } catch (e) {
                  notes = null
                }
              }
              
              if (notes && typeof notes === "object" && notes.designNotes) {
                return (
                  <div className="p-3 bg-purple-50 rounded border border-purple-300">
                    <h5 className="font-semibold text-purple-900 mb-2 text-sm">Design Comment</h5>
                    <p className="text-xs text-gray-900">{notes.designNotes}</p>
                  </div>
                )
              }
              return null
            })()}

            {/* Team Roster Table - Only show if team roster exists */}
            {item.team_roster && Array.isArray(item.team_roster) && item.team_roster.length > 0 && (
              <>
                <button
                  onClick={() => onToggleExpand(item.id)}
                  className="w-full mt-4 pt-4 border-t border-blue-200 flex items-center justify-between p-3 hover:bg-blue-50 transition rounded"
                >
                  <h4 className="font-semibold text-blue-900">TEAM ROSTER DETAILS</h4>
                  <ChevronDown size={20} className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-2 pb-4">
                    {item.team_roster.map((player: any, idx: number) => {
                      const hasTop = player.sizeTop && player.sizeTop !== "None"
                      const hasBottom = player.sizeBottom && player.sizeBottom !== "None"
                      let amount = 0

                      if (hasTop && hasBottom) {
                        amount = setPrice
                      } else if (hasTop) {
                        amount = topPrice
                      } else if (hasBottom) {
                        amount = bottomPrice
                      }

                      return (
                        <div key={idx} className="grid grid-cols-7 gap-2 text-sm bg-gray-50 p-2 rounded border border-gray-200">
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

                    {item.notes && typeof item.notes === "object" && item.notes.teamNotes && (
                      <div className="mt-4 pt-4 border-t border-blue-300">
                        <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Jersey Customization Notes</p>
                        <p className="text-sm text-blue-900">{item.notes.teamNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}

      {/* Image Expand Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setExpandedImage(null)}>
          <img src={expandedImage} alt="Expanded" className="max-w-2xl max-h-screen rounded-lg" />
        </div>
      )}
    </div>
  )
}
