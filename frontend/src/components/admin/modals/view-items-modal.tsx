"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ZoomIn, Package, ChevronDown } from "lucide-react"
import { getApiImageUrl } from "@/lib/api-urls"

interface TeamMember {
  id?: string
  name: string
  number: string | number
  sizeTop?: string
  sizeBottom?: string
  lengthTopInches?: string
  lengthBottomInches?: string
}

interface SizeSpecifications {
  top?: string
  bottom?: string
  width?: number
  height?: number
  totalSqft?: number
  totalPrice?: number
  items?: Array<{
    qty: number
    sizeTop?: string
    sizeBottom?: string
    lengthTopInches?: string
    lengthBottomInches?: string
    name?: string
    additionalName?: string
  }>
}

interface ItemNotes {
  designNotes?: string
  jerseyCustomizationNotes?: string
  teamRosterNotes?: string
  teamNotes?: string
  sizeNotes?: string
  additionalNotes?: string
  designDetails?: string
  [key: string]: string | undefined
}

interface QuotationItem {
  id: number
  quotation_id: number
  service_id?: number
  description: string
  quantity: number
  unit_price: number | string
  line_total: number | string
  design_file_url?: string
  design_consultation?: any
  notes?: any
  team_roster?: any
  size_specifications?: any
  service?: {
    id: number
    name: string
    image_url?: string
  }
}

interface ViewItemsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  quotation: {
    id: number
    quotation_number: string
    items?: QuotationItem[]
    subtotal?: number
    discount?: number
    tax?: number
    total?: number
  } | null
}

export function ViewItemsModal({ isOpen, onOpenChange, quotation }: ViewItemsModalProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  if (!quotation) return null

  const items = quotation.items || []

  const toggleItemExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const parseJSON = (value: any) => {
    if (!value) return null
    if (typeof value === "object") return value
    if (typeof value === "string") {
      try {
        return JSON.parse(value)
      } catch (e) {
        return null
      }
    }
    return null
  }

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700" aria-describedby="quotation-items-description">
        <DialogHeader>
          <DialogTitle id="quotation-items-description" className="text-2xl font-bold text-neutral-900 dark:text-white">
            Quotation Items - {quotation.quotation_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {items.length === 0 ? (
            <Card className="p-12 text-center bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <Package size={32} className="text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">No items found</p>
            </Card>
          ) : (
            <>
              {/* Items List */}
              {items.map((item) => {
                const teamRoster = parseJSON(item.team_roster) as TeamMember[] | null
                const sizeSpecs = parseJSON(item.size_specifications) as SizeSpecifications | null
                const itemNotes = parseJSON(item.notes) as ItemNotes | null
                const designConsultation = parseJSON(item.design_consultation)
                const isExpanded = expandedItems.has(item.id)
                const isSublimation = item.service?.name?.includes('Sublimation')
                const isTarpaulin = item.service?.name?.includes('Tarpaulin')

                return (
                  <div
                    key={item.id}
                    className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-2"
                  >
                    {/* Item Header */}
                    <div
                      onClick={() => toggleItemExpanded(item.id)}
                      className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 cursor-pointer hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 items-start flex-1">
                          {item.service?.image_url && (
                            <img
                              src={getApiImageUrl(item.service.image_url)}
                              alt={item.service.name}
                              className="w-10 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                              {item.service?.name || "Service Item"}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                              Qty: <span className="font-semibold">{item.quantity}</span> × {formatCurrency(item.unit_price)} = {formatCurrency(item.line_total)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(item.line_total)}
                            </p>
                          </div>
                          <ChevronDown
                            size={20}
                            className={`text-neutral-600 dark:text-neutral-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="p-6 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 space-y-6 animate-in fade-in slide-in-from-top">
                        {/* Design Image */}
                        {item.design_file_url && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                              <ZoomIn size={16} className="text-indigo-600 dark:text-indigo-400" />
                              Design Preview
                            </h4>
                            <div
                              className="relative group cursor-zoom-in"
                              onClick={() => setExpandedImage(getApiImageUrl(item.design_file_url || null))}
                            >
                              <img
                                src={getApiImageUrl(item.design_file_url)}
                                alt="Design Preview"
                                className="w-full max-h-72 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 hover:opacity-90 transition-opacity duration-300 bg-neutral-100 dark:bg-neutral-700"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = '/placeholder.svg?height=288&width=400'
                                  target.classList.add('opacity-50')
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setExpandedImage(getApiImageUrl(item.design_file_url || null))
                                }}
                                className="absolute top-2 right-2 p-2 bg-white dark:bg-neutral-800 rounded-full shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                              >
                                <ZoomIn size={18} className="text-indigo-600 dark:text-indigo-400" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Team Roster */}
                        {teamRoster && teamRoster.length > 0 && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-4 delay-100">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm uppercase tracking-wide">Team Roster</h4>
                            <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20">
                              <table className="w-full text-sm">
                                <thead className="bg-blue-100 dark:bg-blue-900/40 border-b border-blue-300 dark:border-blue-900/50">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Name</th>
                                    <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-white">Jersey #</th>
                                    <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Top Size</th>
                                    <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Bottom Size</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {teamRoster.map((player, idx) => (
                                    <tr key={idx} className="border-b border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                                      <td className="px-4 py-3 text-neutral-900 dark:text-white font-medium">{player.name}</td>
                                      <td className="px-4 py-3 text-center text-neutral-900 dark:text-white font-semibold">{player.number}</td>
                                      <td className="px-4 py-3 text-neutral-900 dark:text-white">
                                        {player.sizeTop ? `${player.sizeTop}${player.lengthTopInches ? ` (${player.lengthTopInches}in)` : ''}` : "-"}
                                      </td>
                                      <td className="px-4 py-3 text-neutral-900 dark:text-white">
                                        {player.sizeBottom ? `${player.sizeBottom}${player.lengthBottomInches ? ` (${player.lengthBottomInches}in)` : ''}` : "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Size Specifications - Items Table */}
                        {isSublimation && sizeSpecs?.items && Array.isArray(sizeSpecs.items) && sizeSpecs.items.length > 0 && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-4 delay-150">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm uppercase tracking-wide">Size Specifications - Items List</h4>
                            <div className="overflow-x-auto rounded-lg border border-green-200 dark:border-green-900/50">
                              <table className="w-full text-sm bg-white dark:bg-neutral-800">
                                <thead className="bg-green-100 dark:bg-green-900/40 border-b border-green-300 dark:border-green-900/50">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Qty</th>
                                    <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Top Size</th>
                                    <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Top Length</th>
                                    <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Bottom Size</th>
                                    <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Bottom Length</th>
                                    <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Name</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sizeSpecs.items.map((spec, idx) => {
                                    const qty = Number(spec.qty) || 0
                                    const hasTop = spec.sizeTop && spec.sizeTop !== "-"
                                    const hasBottom = spec.sizeBottom && spec.sizeBottom !== "-"
                                    const isSet = hasTop && hasBottom

                                    return (
                                      <tr key={idx} className="border-b border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                        <td className="px-4 py-3 text-neutral-900 dark:text-white font-semibold">{qty} {isSet ? 'SET' : 'PCS'}</td>
                                        <td className="px-4 py-3 text-neutral-900 dark:text-white">{spec.sizeTop || "-"}</td>
                                        <td className="px-4 py-3 text-neutral-900 dark:text-white">{spec.lengthTopInches || "-"}</td>
                                        <td className="px-4 py-3 text-neutral-900 dark:text-white">{spec.sizeBottom || "-"}</td>
                                        <td className="px-4 py-3 text-neutral-900 dark:text-white">{spec.lengthBottomInches || "-"}</td>
                                        <td className="px-4 py-3 text-neutral-900 dark:text-white">{spec.name || spec.additionalName || "-"}</td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Tarpaulin Specifications */}
                        {isTarpaulin && sizeSpecs && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-4 delay-150">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm uppercase tracking-wide">Tarpaulin Specifications</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {sizeSpecs.width && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold mb-1">Width</p>
                                  <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.width} ft</p>
                                </div>
                              )}
                              {sizeSpecs.height && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold mb-1">Height</p>
                                  <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.height} ft</p>
                                </div>
                              )}
                              {sizeSpecs.totalSqft && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/50">
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold mb-1">Square Footage</p>
                                  <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.totalSqft} sq ft</p>
                                </div>
                              )}
                              {sizeSpecs.totalPrice && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-900/50">
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold mb-1">Total Price</p>
                                  <p className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(sizeSpecs.totalPrice)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Size Notes */}
                        {itemNotes?.sizeNotes && (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 delay-200 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-900/50">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                              <span className="inline-block w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></span>
                              Size Notes
                            </h4>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">{itemNotes.sizeNotes}</p>
                          </div>
                        )}

                        {/* Design Consultation */}
                        {designConsultation && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-4 delay-200 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-900/50">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                              <span className="text-lg">✨</span> Design Consultation
                            </h4>
                            {designConsultation.notes && (
                              <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-indigo-200 dark:border-indigo-900/50">
                                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase mb-2">Design Details</p>
                                <p className="text-sm text-neutral-900 dark:text-neutral-100">{designConsultation.notes}</p>
                              </div>
                            )}
                            {designConsultation.price && (
                              <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border-l-4 border-l-indigo-500">
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-700 dark:text-neutral-300 font-semibold">Consultation Fee:</span>
                                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{formatCurrency(designConsultation.price)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Other Notes */}
                        {itemNotes && (Object.values(itemNotes).some(v => v && v !== itemNotes.sizeNotes)) && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-4 delay-300 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-900/50">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm uppercase tracking-wide">Notes</h4>
                            <div className="space-y-2 text-sm">
                              {itemNotes.designNotes && (
                                <div>
                                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-400 mb-1">Design Notes</p>
                                  <p className="text-neutral-700 dark:text-neutral-300">{itemNotes.designNotes}</p>
                                </div>
                              )}
                              {itemNotes.jerseyCustomizationNotes && (
                                <div>
                                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-400 mb-1">Jersey Customization</p>
                                  <p className="text-neutral-700 dark:text-neutral-300">{itemNotes.jerseyCustomizationNotes}</p>
                                </div>
                              )}
                              {itemNotes.teamRosterNotes && (
                                <div>
                                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-400 mb-1">Team Roster Notes</p>
                                  <p className="text-neutral-700 dark:text-neutral-300">{itemNotes.teamRosterNotes}</p>
                                </div>
                              )}
                              {itemNotes.additionalNotes && (
                                <div>
                                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-400 mb-1">Additional Notes</p>
                                  <p className="text-neutral-700 dark:text-neutral-300">{itemNotes.additionalNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Summary */}
              <div className="border-t-2 border-neutral-200 dark:border-neutral-700 pt-6 mt-6 space-y-3 animate-in fade-in slide-in-from-top-4 delay-500">
                <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(quotation.subtotal || 0)}</span>
                </div>
                {quotation.discount && quotation.discount > 0 && (
                  <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                    <span className="font-medium">Discount:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(quotation.discount)}</span>
                  </div>
                )}
                {quotation.tax && quotation.tax > 0 && (
                  <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                    <span className="font-medium">Tax:</span>
                    <span className="font-semibold">{formatCurrency(quotation.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold p-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 text-white">
                  <span>Total</span>
                  <span>{formatCurrency(quotation.total || 0)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full mt-6">
          Close
        </Button>
      </DialogContent>

      {/* Image Zoom Dialog */}
      {expandedImage && (
        <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
          <DialogContent className="max-w-2xl bg-black border-0 p-0">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X size={24} />
            </button>
            <img src={expandedImage} alt="Expanded View" className="w-full h-auto rounded-lg" />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}

export { ViewItemsModal }
