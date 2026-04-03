"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ZoomIn, Package } from "lucide-react"

interface TeamMember {
  id?: string
  name: string
  number: string | number
  sizeTop?: string
  sizeBottom?: string
}

interface SizeSpecifications {
  top?: string
  bottom?: string
  width?: number
  height?: number
  totalSqft?: number
  totalPrice?: number
}

interface ItemNotes {
  designNotes?: string
  jerseyCustomizationNotes?: string
  teamRosterNotes?: string
  sizeNotes?: string
  additionalNotes?: string
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700" aria-describedby="quotation-items-description">
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
                const isExpanded = expandedItems.has(item.id)

                return (
                  <div
                    key={item.id}
                    className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    {/* Item Header */}
                    <div
                      onClick={() => toggleItemExpanded(item.id)}
                      className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 cursor-pointer hover:bg-opacity-80 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                            {item.service?.name || "Service Item"}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            Qty: <span className="font-semibold">{item.quantity}</span> × {formatCurrency(item.unit_price)} = {formatCurrency(item.line_total)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(item.line_total)}
                          </p>
                          <button className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition">
                            {isExpanded ? "▲" : "▼"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="p-6 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 space-y-6">
                        {/* Design Image */}
                        {item.design_file_url && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Design Preview</h4>
                            <div className="relative group">
                              <img
                                src={item.design_file_url}
                                alt="Design Preview"
                                className="w-full h-48 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-zoom-in bg-neutral-100 dark:bg-neutral-700"
                                onClick={() => setExpandedImage(item.design_file_url || null)}
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement
                                  target.src = '/placeholder.svg?height=192&width=400'
                                  target.classList.add('opacity-50')
                                }}
                              />
                              <button
                                onClick={() => setExpandedImage(item.design_file_url || null)}
                                className="absolute top-2 right-2 p-2 bg-white dark:bg-neutral-800 rounded-full shadow-lg hover:shadow-xl transition opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn size={18} className="text-neutral-900 dark:text-white" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Team Roster */}
                        {teamRoster && teamRoster.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Team Roster</h4>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                              <div className="space-y-2">
                                {teamRoster.map((player, idx) => (
                                  <div key={idx} className="flex items-center justify-between py-2 border-b border-blue-200 dark:border-blue-900/50 last:border-b-0">
                                    <div>
                                      <p className="font-medium text-neutral-900 dark:text-white">
                                        #{player.number} - {player.name}
                                      </p>
                                      {(player.sizeTop || player.sizeBottom) && (
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                          {player.sizeTop && `Top: ${player.sizeTop}`}
                                          {player.sizeTop && player.sizeBottom && " • "}
                                          {player.sizeBottom && `Bottom: ${player.sizeBottom}`}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Size Specifications */}
                        {sizeSpecs && Object.keys(sizeSpecs).some(key => sizeSpecs[key as keyof SizeSpecifications]) && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Size Specifications</h4>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {sizeSpecs.top && (
                                  <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Top Size</p>
                                    <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.top}</p>
                                  </div>
                                )}
                                {sizeSpecs.bottom && (
                                  <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Bottom Size</p>
                                    <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.bottom}</p>
                                  </div>
                                )}
                                {sizeSpecs.width && (
                                  <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Width</p>
                                    <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.width}</p>
                                  </div>
                                )}
                                {sizeSpecs.height && (
                                  <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Height</p>
                                    <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.height}</p>
                                  </div>
                                )}
                                {sizeSpecs.totalSqft && (
                                  <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Sqft</p>
                                    <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.totalSqft}</p>
                                  </div>
                                )}
                                {sizeSpecs.totalPrice && (
                                  <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Price</p>
                                    <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(sizeSpecs.totalPrice)}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {itemNotes && Object.values(itemNotes).some(v => v) && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Notes</h4>
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3">
                              {itemNotes.designNotes && (
                                <div>
                                  <p className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-1">Design Notes</p>
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{itemNotes.designNotes}</p>
                                </div>
                              )}
                              {itemNotes.jerseyCustomizationNotes && (
                                <div>
                                  <p className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-1">Jersey Customization</p>
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{itemNotes.jerseyCustomizationNotes}</p>
                                </div>
                              )}
                              {itemNotes.teamRosterNotes && (
                                <div>
                                  <p className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-1">Team Roster Notes</p>
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{itemNotes.teamRosterNotes}</p>
                                </div>
                              )}
                              {itemNotes.sizeNotes && (
                                <div>
                                  <p className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-1">Size Notes</p>
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{itemNotes.sizeNotes}</p>
                                </div>
                              )}
                              {itemNotes.additionalNotes && (
                                <div>
                                  <p className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-1">Additional Notes</p>
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{itemNotes.additionalNotes}</p>
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
              <div className="border-t-2 border-neutral-200 dark:border-neutral-700 pt-4 space-y-2">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(quotation.subtotal || 0)}</span>
                </div>
                {quotation.discount && quotation.discount > 0 && (
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Discount:</span>
                    <span className="text-red-600 dark:text-red-400">-{formatCurrency(quotation.discount)}</span>
                  </div>
                )}
                {quotation.tax && quotation.tax > 0 && (
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Tax:</span>
                    <span>{formatCurrency(quotation.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg text-orange-900 dark:text-orange-400">
                  <span>Grand Total</span>
                  <span>{formatCurrency(quotation.total || 0)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full mt-4">
          Close
        </Button>
      </DialogContent>

      {/* Image Zoom Dialog */}
      {expandedImage && (
        <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
          <DialogContent className="max-w-2xl bg-black border-0 p-0">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            >
              <X size={24} />
            </button>
            <img src={expandedImage} alt="Expanded View" className="w-full h-auto" />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
