"use client"

interface Step4Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step4Summary({ formData, setFormData }: Step4Props) {
  const calculateLineTotal = (item: any) => {
    const base = item.base_price * item.quantity
    const design = formData.customizations[item.id]?.design_cost || 0
    return base + design
  }

  const subtotal = formData.items.reduce((sum: number, item: any) => sum + calculateLineTotal(item), 0)

  const discountAmount = (formData.discountPercent / 100) * subtotal
  const total = subtotal - discountAmount

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Step 4: Review & Summary</h2>
        <p className="text-sm sm:text-base text-gray-600">Review your quotation before submitting</p>
      </div>

      {/* Table of Selected Items */}
      <div className="overflow-x-auto rounded-lg border border-red-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
              <th className="px-4 py-3 text-left font-bold">Item</th>
              <th className="px-4 py-3 text-center font-bold">Qty</th>
              <th className="px-4 py-3 text-right font-bold">Unit Price</th>
              <th className="px-4 py-3 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item: any, idx: number) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 font-semibold text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">₱{Number(item.base_price).toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-bold text-red-600">
                  ₱{Number(calculateLineTotal(item)).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pricing Summary */}
      <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-semibold text-gray-900">₱{Number(subtotal).toLocaleString()}</span>
        </div>
        {formData.discountPercent > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Discount ({formData.discountPercent}%):</span>
            <span className="font-semibold text-red-600">-₱{Number(discountAmount).toLocaleString()}</span>
          </div>
        )}
        <div className="border-t border-gray-300 pt-3 flex justify-between items-center text-lg">
          <span className="font-bold text-gray-900">Total Amount:</span>
          <span className="font-bold text-red-600">₱{Number(total).toLocaleString()}</span>
        </div>
      </div>

      {/* Terms & Notes */}
      <div className="border border-red-200 rounded-lg p-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Additional Notes</label>
        <p className="text-sm text-gray-600 whitespace-pre-wrap bg-white border border-gray-200 rounded p-3">
          {formData.customizations.notes || "No additional notes added"}
        </p>
      </div>

      {/* Terms & Conditions Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> By submitting this quotation, you agree to our terms and conditions. A representative
          will contact you to confirm the details.
        </p>
      </div>
    </div>
  )
}
