"use client"

import { FileText, MapPin, User } from "lucide-react"

interface Step4Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step4Summary({ formData, setFormData }: Step4Props) {
  const calculateItemTotal = (item: any) => {
    const base = item.base_price * item.quantity
    const design = formData.customizations[item.id]?.design_cost || 0
    return base + design
  }

  const subtotal = formData.items.reduce((sum: number, item: any) => sum + calculateItemTotal(item), 0)
  const discount = (formData.discountPercent / 100) * subtotal
  const total = subtotal - discount

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 4: Review & Submit</h2>
        <p className="text-gray-600">Review your quotation details before submitting</p>
      </div>

      {/* Customer Information */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-blue-50/50">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User size={20} className="text-blue-600" />
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-semibold text-gray-900">{formData.customer?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold text-gray-900">{formData.customer?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-semibold text-gray-900">{formData.customer?.phone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin size={14} /> Address
            </p>
            <p className="font-semibold text-gray-900">
              {formData.customer?.address}, {formData.customer?.city}, {formData.customer?.province}{" "}
              {formData.customer?.zip_code}
            </p>
          </div>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-red-600" />
            Quotation Items
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {formData.items.map((item: any) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  Qty: {item.quantity}
                </span>
              </div>

              {formData.customizations[item.id]?.notes && (
                <p className="text-sm text-gray-700 mb-3 p-2 bg-white rounded border border-gray-200">
                  {formData.customizations[item.id].notes}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600">Unit Price</p>
                  <p className="font-bold text-gray-900">₱{Number(item.base_price).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Subtotal</p>
                  <p className="font-bold text-gray-900">₱{Number(item.base_price * item.quantity).toLocaleString()}</p>
                </div>
                {formData.customizations[item.id]?.design_cost > 0 && (
                  <div>
                    <p className="text-xs text-gray-600">Design</p>
                    <p className="font-bold text-red-600">+₱{formData.customizations[item.id].design_cost}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="font-bold text-gray-900">₱{Number(calculateItemTotal(item)).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-gray-50/50">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-900">
            <span>Subtotal:</span>
            <span className="font-semibold">₱{Number(subtotal).toLocaleString()}</span>
          </div>
          {formData.discountPercent > 0 && (
            <div className="flex justify-between text-orange-700">
              <span>Discount ({formData.discountPercent}%):</span>
              <span className="font-semibold">-₱{Number(discount).toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-gray-300 pt-3 flex justify-between">
            <span className="text-lg font-bold text-gray-900">Total:</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              ₱{Number(total).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {formData.customizations.notes && (
        <div className="border border-gray-200 rounded-lg p-6 bg-amber-50/50">
          <p className="text-sm text-gray-600 font-semibold mb-2">Additional Notes:</p>
          <p className="text-gray-700">{formData.customizations.notes}</p>
        </div>
      )}

      {/* Terms */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 w-4 h-4 text-red-600" defaultChecked />
          <p className="text-sm text-gray-700">
            By submitting this quotation, I agree to the terms and conditions. Valid for 30 days from submission date.
          </p>
        </div>
      </div>
    </div>
  )
}
