"use client"

import { useState } from "react"
import { X, ChevronDown, ZoomIn } from "lucide-react"
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
  service?: {
    id: number
    name: string
    image_url?: string
    description?: string
  }
}

interface Quotation {
  id: number
  quotation_number: string
  customer: any
  items: PricingLineItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  status: string
  created_at: string
  notes: string
  logo_url?: string
  business_name?: string
  business_address?: string
  business_city?: string
  business_state?: string
  business_postal?: string
  business_phone?: string
  business_email?: string
  valid_until?: string
}

interface QuotationViewModalProps {
  quotation: Quotation | null
  isOpen: boolean
  onClose: () => void
}

export function QuotationViewModal({ quotation, isOpen, onClose }: QuotationViewModalProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  if (!isOpen || !quotation) return null

  const toggleItemExpanded = (itemId: number) => {
    const newSet = new Set(expandedItems)
    if (newSet.has(itemId)) {
      newSet.delete(itemId)
    } else {
      newSet.add(itemId)
    }
    setExpandedItems(newSet)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X size={24} />
        </button>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header with Logo */}
            <div className="p-8 border-b-4 border-orange-100">
              <div className="space-y-8">
                {/* Top: Logo and Quote Title */}
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
                          {new Date(quotation.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FROM SECTION */}
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">From</h3>
                  <div className="space-y-1 text-sm text-gray-900">
                    <p className="font-semibold">{quotation.business_name || "Princess Jaidee Enterprises"}</p>
                    <p>{quotation.business_address || ""}</p>
                    <p>
                      {quotation.business_city || ""} {quotation.business_state || ""} {quotation.business_postal || ""}
                    </p>
                    <p>{quotation.business_phone || ""}</p>
                    <p>{quotation.business_email || ""}</p>
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
                    <p className="font-semibold">{quotation.customer?.bill_to_name || quotation.customer?.name || "-"}</p>
                    <p>{quotation.customer?.bill_to_street || quotation.customer?.address || "-"}</p>
                    <p>
                      {quotation.customer?.bill_to_city || quotation.customer?.city || ""}{" "}
                      {quotation.customer?.bill_to_state || quotation.customer?.state || ""}{" "}
                      {quotation.customer?.bill_to_postal || quotation.customer?.postal || ""}
                    </p>
                    <p>{quotation.customer?.bill_to_phone || quotation.customer?.phone || "-"}</p>
                    <p>{quotation.customer?.bill_to_email || quotation.customer?.email || "-"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Due Date</h3>
                  <div className="space-y-4">
                    <p className="text-gray-900 font-semibold">
                      {quotation.valid_until
                        ? new Date(quotation.valid_until).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-3 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                Items
                <span className="text-sm font-normal text-gray-500">
                  ({quotation.items.length} {quotation.items.length === 1 ? "item" : "items"})
                </span>
              </h2>

              <div className="mb-6">
                {/* Table Header - Responsive */}
                <div className="hidden md:flex items-center gap-3 mb-3 pb-3 border-b-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-lg font-semibold text-gray-700">
                  <div className="flex-1 text-base">Name</div>
                  <div className="w-20 text-center text-base">Qty</div>
                  <div className="w-24 text-right text-base">Amount</div>
                </div>

                {/* Table Body */}
                {quotation.items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">No items added</p>
                  </div>
                ) : (
                  quotation.items.map((item: PricingLineItem) => (
                    <div key={item.id} className="mb-4 pb-4 border-b border-gray-200">
                      {/* Main Row - Collapsible */}
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 p-3 bg-gray-50 rounded-lg">
                        {/* Expand Button - Show if there's any expandable content */}
                        {(Array.isArray(item.team_roster) && item.team_roster.length > 0) ||
                        (item.size_specifications &&
                          typeof item.size_specifications === "object" &&
                          Object.keys(item.size_specifications).length > 0) ||
                        item.design_file_url ||
                        item.notes ? (
                          <button
                            onClick={() => toggleItemExpanded(item.id)}
                            className="p-1 hover:bg-gray-200 rounded transition self-start md:self-center"
                          >
                            <ChevronDown
                              size={18}
                              className={`transition-transform ${expandedItems.has(item.id) ? "rotate-180" : ""}`}
                            />
                          </button>
                        ) : null}

                        {/* Image & Name Column */}
                        <div className="flex-1 flex gap-2 min-w-0">
                          {item.design_file_url ? (
                            <img
                              src={getApiImageUrl(item.design_file_url)}
                              alt={item.service?.name || "Design"}
                              className="w-12 h-12 md:w-14 md:h-14 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          ) : item.service?.image_url ? (
                            <img
                              src={getApiImageUrl(item.service.image_url)}
                              alt={item.service.name}
                              className="w-12 h-12 md:w-14 md:h-14 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          ) : null}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                              {item.service?.name || "Custom Item"}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Column */}
                        <div className="w-16 md:w-20 flex items-center justify-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            disabled
                            className="w-full px-2 py-1 md:py-2 border border-gray-300 rounded text-center text-xs md:text-sm bg-gray-100 cursor-not-allowed"
                          />
                        </div>

                        {/* Amount Column - Read Only */}
                        <div className="w-24 flex items-center justify-end">
                          <input
                            type="number"
                            value={item.unit_price || ""}
                            disabled
                            placeholder="0.00"
                            className="w-full px-2 py-1 md:py-2 border border-gray-300 rounded text-right text-xs bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Collapsible Details */}
                      {expandedItems.has(item.id) && (
                        <div className="mt-3 ml-0 md:ml-8 pt-3 border-t border-gray-200 space-y-3">
                          {/* Team Roster Details */}
                          {item.team_roster && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="font-semibold text-blue-900 mb-3">TEAM ROSTER DETAILS</h4>
                              <div className="space-y-3">
                                {Array.isArray(item.team_roster) && item.team_roster.length > 0 ? (
                                  item.team_roster.map((player: any, idx: number) => (
                                    <div key={idx} className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm bg-white p-3 rounded">
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Name</p>
                                        <p className="text-gray-900">{player.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Jersey #</p>
                                        <p className="text-gray-900">{player.number || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Top Size</p>
                                        <p className="text-gray-900">{player.sizeTop || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Bottom Size</p>
                                        <p className="text-gray-900">{player.sizeBottom || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 font-semibold">Position</p>
                                        <p className="text-gray-900">{player.position || "-"}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="bg-white p-3 rounded text-sm text-gray-500">
                                    <p>No team roster data available</p>
                                  </div>
                                )}
                              </div>

                              {item.notes && typeof item.notes === "object" && item.notes.teamNotes && (
                                <div className="mt-4 pt-4 border-t border-blue-300">
                                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Jersey Customization Notes</p>
                                  <p className="text-sm text-blue-900">{item.notes.teamNotes}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Size Specifications */}
                          {item.size_specifications &&
                            item.size_specifications !== null &&
                            typeof item.size_specifications === "object" &&
                            (Object.keys(item.size_specifications).length > 0 ||
                              (item.notes &&
                                typeof item.notes === "object" &&
                                item.notes.sizeNotes)) && (
                              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-900 mb-3">
                                  {item.service?.name?.includes("Tarpaulin") ? "SIZE SPECIFICATION" : "UNIFORM CUSTOMIZATION"}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-white p-3 rounded">
                                  {item.service?.name?.includes("Tarpaulin") ? (
                                    <>
                                      {item.size_specifications.width && (
                                        <div>
                                          <p className="text-xs text-gray-600 font-semibold">Width</p>
                                          <p className="text-gray-900">{item.size_specifications.width} ft</p>
                                        </div>
                                      )}
                                      {item.size_specifications.height && (
                                        <div>
                                          <p className="text-xs text-gray-600 font-semibold">Height</p>
                                          <p className="text-gray-900">{item.size_specifications.height} ft</p>
                                        </div>
                                      )}
                                      {item.size_specifications.totalSqft && (
                                        <div>
                                          <p className="text-xs text-gray-600 font-semibold">Total Sq Ft</p>
                                          <p className="text-gray-900 font-semibold">{item.size_specifications.totalSqft} sq ft</p>
                                        </div>
                                      )}
                                      {item.size_specifications.totalPrice && (
                                        <div>
                                          <p className="text-xs text-gray-600 font-semibold">Total Price</p>
                                          <p className="text-gray-900 font-bold">₱{item.size_specifications.totalPrice}</p>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {item.size_specifications.top && (
                                        <div>
                                          <p className="text-xs text-gray-600 font-semibold">Top/Shirt Size</p>
                                          <p className="text-gray-900">{item.size_specifications.top}</p>
                                        </div>
                                      )}
                                      {item.size_specifications.bottom && (
                                        <div>
                                          <p className="text-xs text-gray-600 font-semibold">Bottom/Short Size</p>
                                          <p className="text-gray-900">{item.size_specifications.bottom}</p>
                                        </div>
                                      )}
                                      {!item.size_specifications.top && !item.size_specifications.bottom && (
                                        <div>
                                          <p className="text-xs text-gray-600 font-semibold">Size</p>
                                          <p className="text-gray-900">Not specified</p>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                                {item.notes && typeof item.notes === "object" && item.notes.sizeNotes && (
                                  <div className="mt-4 pt-4 border-t border-purple-300">
                                    <p className="text-xs font-semibold text-purple-700 uppercase mb-2">Size Notes</p>
                                    <p className="text-sm text-purple-900">{item.notes.sizeNotes}</p>
                                  </div>
                                )}
                              </div>
                            )}

                          {/* Design File Preview */}
                          {item.design_file_url && (
                            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                              <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                                DESIGN PREVIEW
                                <span className="text-xs text-indigo-700 font-normal">(Click to expand)</span>
                              </h4>
                              <div
                                className="relative inline-block cursor-pointer group"
                                onClick={() => {
                                  if (item.design_file_url) {
                                    setExpandedImage(getApiImageUrl(item.design_file_url))
                                  }
                                }}
                              >
                                <img
                                  src={getApiImageUrl(item.design_file_url)}
                                  alt="Design"
                                  className="max-w-md max-h-64 rounded bg-white hover:opacity-90 transition-opacity"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                                  <ZoomIn className="w-8 h-8 text-white" />
                                </div>
                              </div>
                              {item.notes && (
                                <div className="mt-4 pt-4 border-t border-indigo-300">
                                  <p className="text-xs font-semibold text-indigo-700 uppercase mb-2">Design Comments</p>
                                  <p className="text-sm text-indigo-900">
                                    {typeof item.notes === "string" 
                                      ? item.notes 
                                      : typeof item.notes === "object" && item.notes.designNotes
                                        ? item.notes.designNotes
                                        : typeof item.notes === "object"
                                          ? Object.values(item.notes).filter(v => v && typeof v === "string").join(", ")
                                          : ""}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Totals Section - Bottom Right */}
            <div className="p-8 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-50">
              <div className="max-w-md ml-auto space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-700">Subtotal:</span>
                  <span className="text-gray-900 font-semibold">₱{Number(quotation.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {/* Discount */}
                {quotation.discount > 0 && (
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-700">Discount:</span>
                      <span className="text-gray-900">- ₱{Number(quotation.discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}

                {/* Tax */}
                {quotation.tax > 0 && (
                  <div className="flex justify-between text-base">
                    <span className="text-gray-700">Tax (12%):</span>
                    <span className="text-gray-900">₱{Number(quotation.tax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}

                {/* Total */}
                <div className="border-t-2 border-gray-300 pt-3 bg-orange-50 rounded-lg p-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-orange-600">₱{Number(quotation.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {quotation.notes && (
              <div className="p-8 border-t-2 border-gray-200 bg-white">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Notes</h3>
                <p className="text-sm text-gray-900 whitespace-pre-line">{quotation.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/75 z-[60] flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:bg-black/50 rounded-lg transition"
            >
              <X size={24} />
            </button>
            <img src={expandedImage} alt="Expanded view" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}
    </div>
  )
}
