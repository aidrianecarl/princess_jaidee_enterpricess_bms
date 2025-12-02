"use client"

import { DollarSign, ImageIcon, Users } from "lucide-react"

interface Step2Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step2Configure({ formData, setFormData }: Step2Props) {
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

  const handleGeneralNotes = (notes: string) => {
    setFormData({
      ...formData,
      customizations: {
        ...formData.customizations,
        notes,
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
        <p className="text-sm sm:text-base text-gray-600">Customize each item and add special requirements</p>
      </div>

      {/* Items Configuration */}
      <div className="space-y-4 sm:space-y-6">
        {formData.items.map((item: any) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-4">{item.name}</h3>

            {/* Customization Notes */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Users size={16} className="inline mr-2" />
                Customization Details
              </label>
              <textarea
                placeholder={`Example: ${item.type === "service" ? "Sublimation printing for 5 team members" : "T-shirt size variations"}`}
                value={formData.customizations[item.id]?.notes || ""}
                onChange={(e) => handleCustomizationChange(item.id, "notes", e.target.value)}
                className="w-full px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
              />
            </div>

            {/* Design Cost */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.customizations[item.id]?.design_cost}
                  onChange={(e) => handleCustomizationChange(item.id, "design_cost", e.target.checked ? 500 : 0)}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <ImageIcon size={16} />
                Include Design Service (₱500)
              </label>
              {formData.customizations[item.id]?.design_cost > 0 && (
                <p className="text-xs sm:text-sm text-gray-600 ml-6">We will create a custom design for this item</p>
              )}
            </div>

            {/* Item Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
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
                  <p className="font-bold text-gray-900">₱{Number(item.base_price * item.quantity).toLocaleString()}</p>
                </div>
                {formData.customizations[item.id]?.design_cost > 0 && (
                  <div>
                    <p className="text-gray-600">Design</p>
                    <p className="font-bold text-red-600">+₱{formData.customizations[item.id].design_cost}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* General Notes */}
      <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Additional Notes</label>
        <textarea
          placeholder="Add any special requests or general notes..."
          value={formData.customizations.notes || ""}
          onChange={(e) => handleGeneralNotes(e.target.value)}
          className="w-full px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          rows={4}
        />
      </div>

      {/* Discount */}
      <div className="border border-red-200 rounded-lg p-4 sm:p-6 bg-gradient-to-r from-red-50 to-orange-50">
        <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign size={16} className="text-red-600" />
          Discount (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.discountPercent}
          onChange={(e) => setFormData({ ...formData, discountPercent: Number.parseFloat(e.target.value) || 0 })}
          className="w-full px-4 py-3 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-base sm:text-lg font-semibold">Estimated Total:</span>
        <span className="text-2xl sm:text-3xl font-bold">₱{Number(calculateTotal()).toLocaleString()}</span>
      </div>
    </div>
  )
}
