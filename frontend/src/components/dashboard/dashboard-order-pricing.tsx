"use client"

import { useState } from "react"
import { ChevronDown, ZoomIn } from "lucide-react"
import { getApiImageUrl } from "@/lib/api-urls"

interface OrderItem {
  id: number
  order_id: number
  quotation_items_id: number
  service_id: number | null
  quantity: number
  unit_price: number | string
  line_total: string | number
  status?: string
  design_file_url?: string
  team_roster?: any
  size_specifications?: any
  design_consultation?: any
  notes?: any
  service?: { id: number; name: string }
}

interface DashboardOrderPricingProps {
  items: OrderItem[]
  expandedItems: Set<number>
  onToggleExpand: (itemId: number) => void
  onImageExpand: (imageUrl: string) => void
}

export function DashboardOrderPricing({
  items,
  expandedItems,
  onToggleExpand,
  onImageExpand,
}: DashboardOrderPricingProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  const calculateSublimationSubtotal = (item: OrderItem): number => {
    if (!item) return 0

    let subtotal = 0

    // If size_specifications with items array exists, sum those prices
    if (item.size_specifications?.items && Array.isArray(item.size_specifications.items)) {
      const basePrice = Number(item.unit_price) || 0
      subtotal = item.size_specifications.items.reduce((sum: number, spec: any) => {
        const qty = Number(spec.qty) || 0
        const hasTop = spec.sizeTop && spec.sizeTop !== "-"
        const hasBottom = spec.sizeBottom && spec.sizeBottom !== "-"
        const isSet = hasTop && hasBottom
        const itemPrice = isSet ? (basePrice * 2 * qty) : (basePrice * qty)
        return sum + itemPrice
      }, 0)
    } else if (item.team_roster && Array.isArray(item.team_roster)) {
      // Fallback to team_roster calculation
      const basePrice = Number(item.unit_price) || 0
      
      let setsCount = 0, topOnlyCount = 0, bottomOnlyCount = 0
      
      item.team_roster.forEach((player: any) => {
        const hasTop = player.sizeTop && player.sizeTop !== "None"
        const hasBottom = player.sizeBottom && player.sizeBottom !== "None"

        if (hasTop && hasBottom) {
          setsCount++
        } else if (hasTop) {
          topOnlyCount++
        } else if (hasBottom) {
          bottomOnlyCount++
        }
      })

      const setPrice = basePrice * 2
      subtotal = (setsCount * setPrice) + (topOnlyCount * basePrice) + (bottomOnlyCount * basePrice)
    } else if (item.size_specifications?.width && item.size_specifications?.height) {
      // Tarpaulin calculation
      subtotal = (item.size_specifications.totalPrice || 0) * item.quantity
    } else {
      // Default calculation
      subtotal = Number(item.quantity) * Number(item.unit_price)
    }

    // Add design consultation price if present
    if (item.design_consultation && typeof item.design_consultation === "object") {
      const consultationPrice = Number(item.design_consultation.price) || 0
      subtotal += consultationPrice
    }

    return subtotal
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">No items in this order</p>
      </div>
    )
  }

  return (
    <div className="space-y-0 divide-y-2 divide-gray-200">
      {items.map((item: OrderItem) => {
        const isExpanded = expandedItems.has(item.id)
        const isSublimation = item.service?.name?.includes('Sublimation')
        const isTarpaulin = item.service?.name?.includes('Tarpaulin')
        const isTeamRoster = item.service?.name?.includes('Jersey') || item.service?.name?.includes('Uniform')
        
        let sizeSpecs = item.size_specifications
        if (typeof item.size_specifications === 'string' && item.size_specifications) {
          try {
            sizeSpecs = JSON.parse(item.size_specifications)
          } catch (e) {
            sizeSpecs = null
          }
        }

        let notes = item.notes
        if (typeof item.notes === 'string' && item.notes) {
          try {
            notes = JSON.parse(item.notes)
          } catch (e) {
            notes = null
          }
        }

        let teamRoster = item.team_roster
        if (typeof item.team_roster === 'string' && item.team_roster) {
          try {
            teamRoster = JSON.parse(item.team_roster)
          } catch (e) {
            teamRoster = null
          }
        }

        return (
          <div key={item.id} className="border-b border-gray-200 last:border-b-0 py-6 px-4 md:px-6">
            {/* Item Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2">{item.service?.name || `Item #${item.id}`}</h3>
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <span className="text-gray-600">
                    Quantity: <span className="font-semibold text-gray-900">{item.quantity}</span>
                  </span>
                  <span className="text-gray-600">
                    Unit Price: <span className="font-semibold text-gray-900">₱{Number(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </span>
                  {item.status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'ongoing' || item.status === 'InProduction'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {(item.status || 'pending').toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                <p className="text-2xl md:text-3xl font-bold text-orange-600">
                  ₱{calculateSublimationSubtotal(item).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Pricing Breakdown Table for Sublimation with Team Roster */}
            {isSublimation && teamRoster && Array.isArray(teamRoster) && teamRoster.length > 0 && (
              <div className="mb-6 overflow-x-auto">
                <h5 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Pricing Summary</h5>
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
                    {(() => {
                      const basePrice = Number(item.unit_price) || 0
                      let setsCount = 0, topOnlyCount = 0, bottomOnlyCount = 0
                      let setsAmount = 0, topAmount = 0, bottomAmount = 0

                      teamRoster.forEach((player: any) => {
                        const hasTop = player.sizeTop && player.sizeTop !== "None"
                        const hasBottom = player.sizeBottom && player.sizeBottom !== "None"

                        if (hasTop && hasBottom) {
                          setsCount++
                          setsAmount += basePrice * 2
                        } else if (hasTop) {
                          topOnlyCount++
                          topAmount += basePrice
                        } else if (hasBottom) {
                          bottomOnlyCount++
                          bottomAmount += basePrice
                        }
                      })

                      return (
                        <>
                          {setsCount > 0 && (
                            <tr className="border-b border-gray-200 hover:bg-green-50 transition">
                              <td className="px-4 py-3 text-gray-900 font-medium">{setsCount} Sets (Top + Bottom)</td>
                              <td className="px-4 py-3 text-center text-gray-900 font-semibold">{setsCount}</td>
                              <td className="px-4 py-3 text-right text-gray-900">₱{(basePrice * 2).toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                              <td className="px-4 py-3 text-right text-green-600 font-bold">₱{setsAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                            </tr>
                          )}
                          {topOnlyCount > 0 && (
                            <tr className="border-b border-gray-200 hover:bg-orange-50 transition">
                              <td className="px-4 py-3 text-gray-900 font-medium">Top Only ({topOnlyCount})</td>
                              <td className="px-4 py-3 text-center text-gray-900 font-semibold">{topOnlyCount}</td>
                              <td className="px-4 py-3 text-right text-gray-900">₱{basePrice.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                              <td className="px-4 py-3 text-right text-orange-600 font-bold">₱{topAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                            </tr>
                          )}
                          {bottomOnlyCount > 0 && (
                            <tr className="border-b border-gray-200 hover:bg-purple-50 transition">
                              <td className="px-4 py-3 text-gray-900 font-medium">Bottom Only ({bottomOnlyCount})</td>
                              <td className="px-4 py-3 text-center text-gray-900 font-semibold">{bottomOnlyCount}</td>
                              <td className="px-4 py-3 text-right text-gray-900">₱{basePrice.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                              <td className="px-4 py-3 text-right text-purple-600 font-bold">₱{bottomAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                            </tr>
                          )}
                          <tr className="border-t-2 border-gray-300 bg-blue-50">
                            <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Subtotal</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-700 text-lg">₱{(setsAmount + topAmount + bottomAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        </>
                      )
                    })()}
                  </tbody>
                </table>
              </div>
            )}

            {/* Size Specifications Table */}
            {sizeSpecs && typeof sizeSpecs === "object" && sizeSpecs.items && Array.isArray(sizeSpecs.items) && sizeSpecs.items.length > 0 && (
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
                            <td className="px-4 py-3 text-right text-green-600 font-bold">₱{itemPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tarpaulin Specifications */}
            {isTarpaulin && sizeSpecs && typeof sizeSpecs === "object" && (sizeSpecs.width || sizeSpecs.totalSqft) && (
              <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                <h5 className="font-semibold text-indigo-900 mb-4 text-sm uppercase tracking-wide">Tarpaulin Specifications</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sizeSpecs.width && (
                    <div className="bg-white p-3 rounded border border-indigo-200">
                      <p className="text-xs text-indigo-600 font-semibold uppercase">Width</p>
                      <p className="text-lg font-bold text-gray-900">{sizeSpecs.width} ft</p>
                    </div>
                  )}
                  {sizeSpecs.height && (
                    <div className="bg-white p-3 rounded border border-indigo-200">
                      <p className="text-xs text-indigo-600 font-semibold uppercase">Height</p>
                      <p className="text-lg font-bold text-gray-900">{sizeSpecs.height} ft</p>
                    </div>
                  )}
                  {sizeSpecs.totalSqft && (
                    <div className="bg-white p-3 rounded border border-indigo-200">
                      <p className="text-xs text-indigo-600 font-semibold uppercase">Sq Ft</p>
                      <p className="text-lg font-bold text-gray-900">{sizeSpecs.totalSqft}</p>
                    </div>
                  )}
                  {sizeSpecs.totalPrice && (
                    <div className="bg-white p-3 rounded border border-indigo-200">
                      <p className="text-xs text-indigo-600 font-semibold uppercase">Unit Price</p>
                      <p className="text-lg font-bold text-indigo-600">₱{Number(sizeSpecs.totalPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Size Notes */}
            {notes && typeof notes === "object" && notes.sizeNotes && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-2 text-sm uppercase tracking-wide">Size Notes</h5>
                <p className="text-sm text-gray-700">{notes.sizeNotes}</p>
              </div>
            )}

            {/* Design Notes */}
            {notes && typeof notes === "object" && notes.designNotes && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-900 mb-2 text-sm uppercase tracking-wide">Design Notes</h5>
                <p className="text-sm text-gray-700">{notes.designNotes}</p>
              </div>
            )}

            {/* Design Consultation */}
            {item.design_consultation && typeof item.design_consultation === "object" && (
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <span>✨</span> Design Consultation
                </h4>
                {item.design_consultation.notes && (
                  <div className="mb-3 p-3 bg-white rounded border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">Details</p>
                    <p className="text-sm text-gray-900">{item.design_consultation.notes}</p>
                  </div>
                )}
                {item.design_consultation.price && (
                  <div className="p-3 bg-white rounded border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Consultation Fee:</span>
                      <span className="text-emerald-600 font-bold">₱{Number(item.design_consultation.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Design File */}
            {item.design_file_url && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 text-sm uppercase tracking-wide">Design File</h4>
                <div className="flex gap-4 items-start flex-wrap">
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
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-md hover:shadow-lg"
                  >
                    <ZoomIn size={16} />
                    View Full
                  </button>
                </div>
              </div>
            )}

            {/* Team Roster Expandable Section */}
            {teamRoster && Array.isArray(teamRoster) && teamRoster.length > 0 && (
              <>
                <button
                  onClick={() => onToggleExpand(item.id)}
                  className="w-full pt-6 pb-3 border-t-2 border-gray-300 flex items-center justify-between font-semibold text-gray-900 hover:text-blue-600 transition group"
                >
                  <span className="uppercase tracking-wide text-sm">Team Roster Details ({teamRoster.length} Players)</span>
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
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Top Length</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Bottom</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Bottom Length</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamRoster.map((player: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                              <td className="px-4 py-3 text-gray-900 font-medium">{player.name}</td>
                              <td className="px-4 py-3 text-center text-gray-900 font-semibold">{player.number}</td>
                              <td className="px-4 py-3 text-gray-900">{player.sizeTop ? `${player.sizeTop}` : "-"}</td>
                              <td className="px-4 py-3 text-gray-900">{player.lengthTopInches ? `${player.lengthTopInches}"` : "-"}</td>
                              <td className="px-4 py-3 text-gray-900">{player.sizeBottom ? `${player.sizeBottom}` : "-"}</td>
                              <td className="px-4 py-3 text-gray-900">{player.lengthBottomInches ? `${player.lengthBottomInches}"` : "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
