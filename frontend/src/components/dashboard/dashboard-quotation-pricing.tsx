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
    <div className="space-y-0 divide-y-2 divide-gray-200">
      {quotation.items.map((item: PricingLineItem) => {
        const isExpanded = expandedItems.has(item.id)
        const isSublimation = item.service?.name?.includes('Sublimation')
        const isTarpaulin = item.service?.name?.includes('Tarpaulin')

        // Handle Sublimation items
        if (isSublimation) {
          const teamRoster = item.team_roster || []
          const prices = sublimationPrices[item.id]
          
          // If no prices available, skip
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
            <div key={item.id} className="border-b border-gray-200 last:border-b-0 py-6 px-4 md:px-6">
              <h3 className="font-bold text-lg text-gray-900 mb-6">{item.service?.name}</h3>

              {/* Pricing Summary Table */}
              {teamRoster.length > 0 && (
                <div className="mb-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300 bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Item Description</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Qty</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Unit Price</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {setsCount > 0 && (
                        <tr className="border-b border-gray-200 hover:bg-green-50 transition">
                          <td className="px-4 py-3 text-gray-900 font-medium">{setsCount} Sets</td>
                          <td className="px-4 py-3 text-center text-gray-900 font-semibold">{setsCount}</td>
                          <td className="px-4 py-3 text-right text-gray-900">₱{setPrice.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-bold">₱{setsAmount.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                        </tr>
                      )}
                      {topOnlyCount > 0 && (
                        <tr className="border-b border-gray-200 hover:bg-orange-50 transition">
                          <td className="px-4 py-3 text-gray-900 font-medium">Top Only {topOnlyCount}</td>
                          <td className="px-4 py-3 text-center text-gray-900 font-semibold">{topOnlyCount}</td>
                          <td className="px-4 py-3 text-right text-gray-900">₱{topPrice.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                          <td className="px-4 py-3 text-right text-orange-600 font-bold">₱{topAmount.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                        </tr>
                      )}
                      {bottomOnlyCount > 0 && (
                        <tr className="border-b border-gray-200 hover:bg-purple-50 transition">
                          <td className="px-4 py-3 text-gray-900 font-medium">Bottom Only {bottomOnlyCount}</td>
                          <td className="px-4 py-3 text-center text-gray-900 font-semibold">{bottomOnlyCount}</td>
                          <td className="px-4 py-3 text-right text-gray-900">₱{bottomPrice.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                          <td className="px-4 py-3 text-right text-purple-600 font-bold">₱{bottomAmount.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                        </tr>
                      )}
                      <tr className="border-t-2 border-gray-300 bg-blue-50">
                        <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Subtotal</td>
                        <td className="px-4 py-3 text-right font-bold text-blue-700 text-lg">₱{calculateSublimationSubtotal(item.id).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Size Specifications Table */}
              {(() => {
                let sizeSpecs = item.size_specifications
                if (typeof item.size_specifications === 'string' && item.size_specifications) {
                  try {
                    sizeSpecs = JSON.parse(item.size_specifications)
                  } catch (e) {
                    console.log(`[v0] ERROR parsing size_specifications JSON for item ${item.id}:`, e)
                    sizeSpecs = null
                  }
                }
                
                if (sizeSpecs && typeof sizeSpecs === "object" && sizeSpecs.items && Array.isArray(sizeSpecs.items) && sizeSpecs.items.length > 0) {
                  return (
                    <div className="mb-6">
                      <h5 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Size Specifications</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-300 bg-gray-50">
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Qty</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Top Size</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Top Length</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Bottom Size</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Bottom Length</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                              <th className="px-4 py-3 text-right font-semibold text-gray-700">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sizeSpecs.items.map((spec: any, idx: number) => {
                              const basePrice = Number(item.unit_price) || 0
                              const qty = Number(spec.qty) || 0
                              const hasTop = spec.sizeTop && spec.sizeTop !== "-"
                              const hasBottom = spec.sizeBottom && spec.sizeBottom !== "-"
                              const isSet = hasTop && hasBottom
                              const itemPrice = isSet ? (basePrice * 2 * qty) : (basePrice * qty)
                              
                              return (
                                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                  <td className="px-4 py-3 text-gray-900 font-semibold">{qty} {isSet ? 'SET' : 'PCS'}</td>
                                  <td className="px-4 py-3 text-gray-900">{spec.sizeTop || "-"}</td>
                                  <td className="px-4 py-3 text-gray-900">{spec.lengthTopInches || "-"}</td>
                                  <td className="px-4 py-3 text-gray-900">{spec.sizeBottom || "-"}</td>
                                  <td className="px-4 py-3 text-gray-900">{spec.lengthBottomInches || "-"}</td>
                                  <td className="px-4 py-3 text-gray-900">{spec.name || spec.additionalName || "-"}</td>
                                  <td className="px-4 py-3 text-right text-green-600 font-bold">₱{itemPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
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
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2 text-sm">Size Notes</h5>
                      <p className="text-sm text-gray-700">{notes.sizeNotes}</p>
                    </div>
                  )
                }
                return null
              })()}

              {/* Design Consultation */}
              {(() => {
                let designConsultation = item.design_consultation
                if (typeof item.design_consultation === 'string' && item.design_consultation) {
                  try {
                    designConsultation = JSON.parse(item.design_consultation)
                  } catch (e) {
                    designConsultation = null
                  }
                }
                
                if (designConsultation && typeof designConsultation === "object") {
                  return (
                    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                      <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">✨</span> Design Consultation
                      </h4>
                      {designConsultation.notes && (
                        <div className="mb-3 p-3 bg-white rounded border border-indigo-200">
                          <p className="text-xs font-semibold text-indigo-700 uppercase mb-2">Design Details</p>
                          <p className="text-sm text-gray-900">{designConsultation.notes}</p>
                        </div>
                      )}
                      {designConsultation.price && (
                        <div className="p-3 bg-white rounded border-l-4 border-l-indigo-500">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-semibold">Consultation Fee:</span>
                            <span className="text-indigo-600 font-bold">₱{Number(designConsultation.price).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }
                return null
              })()}

              {/* Design File */}
              {item.design_file_url && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 text-sm uppercase tracking-wide">Design File</h4>
                  <div className="flex gap-4 items-start">
                    <img
                      src={getApiImageUrl(item.design_file_url)}
                      alt="Design"
                      className="w-20 h-20 rounded-lg border border-green-300 object-cover shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <button
                      onClick={() => setExpandedImage(getApiImageUrl(item.design_file_url))}
                      className="self-center flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-md hover:shadow-lg"
                    >
                      <ZoomIn size={16} />
                      View Full
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
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="font-semibold text-purple-900 mb-2 text-sm">Design Comment</h5>
                      <p className="text-sm text-gray-700">{notes.designNotes}</p>
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
                    className="w-full pt-6 pb-3 border-t-2 border-gray-300 flex items-center justify-between font-semibold text-gray-900 hover:text-blue-600 transition group"
                  >
                    <span className="uppercase tracking-wide text-sm">Team Roster Details</span>
                    <ChevronDown size={20} className={`text-gray-600 group-hover:text-blue-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="mt-6 space-y-3 pb-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-300 bg-gray-50">
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Player Name</th>
                              <th className="px-4 py-3 text-center font-semibold text-gray-700">Jersey #</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Top</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Bottom</th>
                              <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
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
                                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                  <td className="px-4 py-3 text-gray-900 font-medium">{player.name}</td>
                                  <td className="px-4 py-3 text-center text-gray-900 font-semibold">{player.number}</td>
                                  <td className="px-4 py-3 text-gray-900">{player.sizeTop ? `${player.sizeTop}${player.lengthTopInches ? ` (${player.lengthTopInches}in)` : ''}` : "-"}</td>
                                  <td className="px-4 py-3 text-gray-900">{player.sizeBottom ? `${player.sizeBottom}${player.lengthBottomInches ? ` (${player.lengthBottomInches}in)` : ''}` : "-"}</td>
                                  <td className="px-4 py-3 text-right text-blue-600 font-bold">₱{amount.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {item.notes && typeof item.notes === "object" && item.notes.teamNotes && (
                        <div className="mt-4 pt-4 border-t border-gray-300">
                          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Jersey Customization Notes</p>
                          <p className="text-sm text-gray-700">{item.notes.teamNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        }

        // Handle Tarpaulin items
        if (isTarpaulin) {
          let sizeSpecs = item.size_specifications
          if (typeof item.size_specifications === 'string' && item.size_specifications) {
            try {
              sizeSpecs = JSON.parse(item.size_specifications)
            } catch (e) {
              sizeSpecs = null
            }
          }

          if (!sizeSpecs) return null

          return (
            <div key={item.id} className="border-b border-gray-200 last:border-b-0 py-6 px-4 md:px-6">
              <h3 className="font-bold text-lg text-gray-900 mb-6">{item.service?.name}</h3>

              {/* Tarpaulin Specifications Table */}
              <div className="mb-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Specification</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 hover:bg-blue-50 transition">
                      <td className="px-4 py-3 text-gray-900 font-semibold">Dimensions</td>
                      <td className="px-4 py-3 text-right text-gray-900">{sizeSpecs.width}ft × {sizeSpecs.height}ft</td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-blue-50 transition">
                      <td className="px-4 py-3 text-gray-900 font-semibold">Square Footage</td>
                      <td className="px-4 py-3 text-right text-gray-900">{sizeSpecs.totalSqft} sq ft</td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-blue-50 transition">
                      <td className="px-4 py-3 text-gray-900 font-semibold">Quantity</td>
                      <td className="px-4 py-3 text-right text-gray-900">{item.quantity} qty</td>
                    </tr>
                    <tr className="bg-blue-50 border-t-2 border-gray-300">
                      <td className="px-4 py-3 text-right text-gray-900 font-bold">Subtotal</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-700 text-lg">₱{(sizeSpecs.totalPrice || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Design Consultation for Tarpaulin */}
              {(() => {
                let designConsultation = item.design_consultation
                if (typeof item.design_consultation === 'string' && item.design_consultation) {
                  try {
                    designConsultation = JSON.parse(item.design_consultation)
                  } catch (e) {
                    designConsultation = null
                  }
                }
                
                if (designConsultation && typeof designConsultation === "object") {
                  return (
                    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                      <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">✨</span> Design Consultation
                      </h4>
                      {designConsultation.notes && (
                        <div className="mb-3 p-3 bg-white rounded border border-indigo-200">
                          <p className="text-xs font-semibold text-indigo-700 uppercase mb-2">Design Details</p>
                          <p className="text-sm text-gray-900">{designConsultation.notes}</p>
                        </div>
                      )}
                      {designConsultation.price && (
                        <div className="p-3 bg-white rounded border-l-4 border-l-indigo-500">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-semibold">Consultation Fee:</span>
                            <span className="text-indigo-600 font-bold">₱{Number(designConsultation.price).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }
                return null
              })()}

              {/* Design File for Tarpaulin */}
              {item.design_file_url && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 text-sm uppercase tracking-wide">Design File</h4>
                  <div className="flex gap-4 items-start">
                    <img
                      src={getApiImageUrl(item.design_file_url)}
                      alt="Design"
                      className="w-20 h-20 rounded-lg border border-green-300 object-cover shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <button
                      onClick={() => setExpandedImage(getApiImageUrl(item.design_file_url))}
                      className="self-center flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-md hover:shadow-lg"
                    >
                      <ZoomIn size={16} />
                      View Full
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        }

        // For other services (if any), just show basic info
        return (
          <div key={item.id} className="border-b border-gray-200 last:border-b-0 py-6 px-4 md:px-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">{item.service?.name}</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Quantity:</span>
                <span className="font-semibold text-gray-900">{item.quantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total:</span>
                <span className="font-bold text-lg text-gray-900">₱{(item.line_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            </div>
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

