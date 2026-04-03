"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Image as ImageIcon, Package } from "lucide-react"

interface QuotationItem {
  id: number
  service_id: number
  description: string
  quantity: number
  unit_price: number
  line_total: number
  design_file_url?: string
  service?: {
    id: number
    name: string
    description: string
  }
  notes?: string[] | string
}

interface ViewItemsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  quotation: {
    id: number
    quotation_number: string
    items?: QuotationItem[]
  } | null
}

export function ViewItemsModal({
  isOpen,
  onOpenChange,
  quotation,
}: ViewItemsModalProps) {
  if (!quotation) return null

  const items = quotation.items || []

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
            Quotation Items - {quotation.quotation_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {items.length === 0 ? (
            <Card className="p-12 text-center bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <Package size={32} className="text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">No items found</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">This quotation has no items</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {items.map((item, index) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                >
                  <div className="p-4 md:p-6">
                    {/* Item Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                            {item.service?.name || `Item ${index + 1}`}
                          </h3>
                          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            Item {index + 1}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          {item.description}
                        </p>
                        {item.service?.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-500 italic">
                            {item.service.description}
                          </p>
                        )}
                      </div>

                      {/* Price Summary */}
                      <div className="text-right">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Unit Price</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          ₱{item.unit_price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Design Image */}
                    {item.design_file_url && (
                      <div className="mb-4 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700">
                        <img
                          src={item.design_file_url}
                          alt="Design"
                          className="w-full h-auto max-h-80 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none"
                          }}
                        />
                      </div>
                    )}

                    {/* Item Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-neutral-50 dark:bg-neutral-700 p-3 rounded-lg">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Quantity</p>
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">{item.quantity}</p>
                      </div>

                      <div className="bg-neutral-50 dark:bg-neutral-700 p-3 rounded-lg">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Unit Price</p>
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                          ₱{item.unit_price.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg col-span-2">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">Line Total</p>
                        <p className="text-lg font-bold text-green-700 dark:text-green-400">
                          ₱{item.line_total.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">Notes</p>
                        <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                          {Array.isArray(item.notes) ? (
                            item.notes.map((note, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{note}</span>
                              </li>
                            ))
                          ) : (
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span>{item.notes}</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {/* Summary Card */}
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800/30 p-4 md:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Total Items</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{items.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Total Quantity</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Grand Total</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                      ₱{items.reduce((sum, item) => sum + item.line_total, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
