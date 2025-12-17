"use client"

import { DollarSign, ImageIcon, Users, Upload } from "lucide-react"
import { useState } from "react"

interface Step2Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step2Configure({ formData, setFormData }: Step2Props) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const handleCustomizationChange = (itemId: string, field: string, value: any) => {
    setFormData({
      ...formData,
      customizations: {
        ...formData.customizations,
        [itemId]: {
          ...(formData.customizations[itemId] || {}),
          [field]: value,
        },
      },
    })
  }

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum: number, item: any) => {
      const base = item.base_price * item.quantity
      const designCost = formData.customizations[item.id]?.design_cost || 0
      return sum + base + designCost
    }, 0)

    const discount = (formData.discountPercent / 100) * subtotal
    return subtotal - discount
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Step 2: Configure Your Order</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Customize each item with design, team, and size requirements
        </p>
      </div>

      {/* Items Configuration */}
      <div className="space-y-4">
        {formData.items.map((item: any, idx: number) => (
          <div
            key={item.id}
            className="border-2 border-red-200 rounded-xl overflow-hidden transition-all hover:border-red-400 hover:shadow-md"
          >
            <button
              onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              className="w-full p-4 sm:p-6 bg-gradient-to-r from-red-50 to-orange-50 flex items-center justify-between hover:from-red-100 hover:to-orange-100 transition"
            >
              <div className="text-left">
                <h3 className="font-bold text-base sm:text-lg text-gray-900">{item.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className={`transform transition-transform ${expandedItem === item.id ? "rotate-180" : ""}`}>▼</div>
            </button>

            {expandedItem === item.id && (
              <div className="p-4 sm:p-6 space-y-4 bg-white border-t border-red-200">
                {/* Design Option */}
                {item.has_design && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id={`design-${item.id}`}
                      checked={!!formData.customizations[item.id]?.design_cost}
                      onChange={(e) => handleCustomizationChange(item.id, "design_cost", e.target.checked ? 500 : 0)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600"
                    />
                    <label htmlFor={`design-${item.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                      <ImageIcon size={16} className="text-blue-600" />
                      <span className="font-semibold text-gray-900">Include Design Service</span>
                      <span className="text-blue-600 font-bold">+₱500</span>
                    </label>
                  </div>
                )}

                {/* Image Upload */}
                {item.has_design && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={!!formData.customizations[item.id]?.has_image_upload}
                        onChange={(e) => handleCustomizationChange(item.id, "has_image_upload", e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-red-600"
                      />
                      <Upload size={16} className="text-green-600" />
                      <span className="font-semibold text-gray-900">Upload Custom Design</span>
                    </label>
                    {formData.customizations[item.id]?.has_image_upload && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCustomizationChange(item.id, "image_file", e.target.files?.[0])}
                        className="block w-full text-sm text-gray-500"
                      />
                    )}
                  </div>
                )}

                {/* Team Members */}
                {item.has_team && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                      <Users size={16} className="text-purple-600" />
                      Team Members ({formData.customizations[item.id]?.team_roster?.length || 0})
                    </label>
                    <button
                      type="button"
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                      onClick={() => setExpandedItem(`team-${item.id}`)}
                    >
                      Manage Team
                    </button>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Customization Details</label>
                  <textarea
                    placeholder="Add special requirements or notes..."
                    value={formData.customizations[item.id]?.notes || ""}
                    onChange={(e) => handleCustomizationChange(item.id, "notes", e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    rows={3}
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Unit Price</p>
                    <p className="font-bold text-gray-900">₱{Number(item.base_price).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-bold text-gray-900">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-bold text-red-600">
                      ₱{Number(item.base_price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Discount */}
      <div className="border-2 border-red-300 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-red-50 to-orange-50">
        <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign size={18} className="text-red-600" />
          Discount (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.discountPercent}
          onChange={(e) => setFormData({ ...formData, discountPercent: Number.parseFloat(e.target.value) || 0 })}
          className="w-full px-4 py-3 text-lg border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
        />
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <span className="text-base sm:text-lg font-semibold">Estimated Total:</span>
        <span className="text-3xl sm:text-4xl font-bold">₱{Number(calculateTotal()).toLocaleString()}</span>
      </div>
    </div>
  )
}
