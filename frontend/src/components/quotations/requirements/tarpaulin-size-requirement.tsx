"use client"

import React, { useState, useEffect } from "react"
import { Ruler, AlertCircle } from "lucide-react"

interface TarpaulinSize {
  width: number | string
  height: number | string
  totalSqft?: number
  totalPrice?: number
}

interface TarpaulinSizeRequirementProps {
  onSizeSpecChange: (specs: TarpaulinSize) => void
  initialSpecs?: TarpaulinSize
  isRequired?: boolean
}

export function TarpaulinSizeRequirement({
  onSizeSpecChange,
  initialSpecs = {},
  isRequired = true,
}: TarpaulinSizeRequirementProps) {
  const [width, setWidth] = useState<number | string>(initialSpecs.width || "")
  const [height, setHeight] = useState<number | string>(initialSpecs.height || "")
  const [totalSqft, setTotalSqft] = useState<number>(0)
  const [totalPrice, setTotalPrice] = useState<number>(0)

  const WIDTH_MIN = 3
  const WIDTH_MAX = 10
  const HEIGHT_MIN = 2
  const HEIGHT_MAX = 10
  const PRICE_PER_SQFT = 20

  // Width options: 3 to 10 feet
  const widthOptions = Array.from({ length: WIDTH_MAX - WIDTH_MIN + 1 }, (_, i) => WIDTH_MIN + i)

  // Height options: 2 to 10 feet
  const heightOptions = Array.from({ length: HEIGHT_MAX - HEIGHT_MIN + 1 }, (_, i) => HEIGHT_MIN + i)

  useEffect(() => {
    if (width && height) {
      const w = Number(width)
      const h = Number(height)
      const sqft = w * h
      const price = sqft * PRICE_PER_SQFT

      setTotalSqft(sqft)
      setTotalPrice(price)

      onSizeSpecChange({
        width: w,
        height: h,
        totalSqft: sqft,
        totalPrice: price,
      })
    }
  }, [width, height])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Ruler size={20} className="text-neutral-600" />
        <h3 className="text-lg font-semibold text-neutral-900">
          Tarpaulin Size Specifications {isRequired && <span className="text-red-500">*</span>}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Width Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-900">
            Width (feet)
            <span className="text-xs text-neutral-500 ml-2">
              ({WIDTH_MIN}ft - {WIDTH_MAX}ft)
            </span>
          </label>
          <select
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-full px-4 py-2.5 border-2 border-neutral-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-neutral-900 font-medium"
          >
            <option value="">Select Width</option>
            {widthOptions.map((w) => (
              <option key={w} value={w}>
                {w} feet
              </option>
            ))}
          </select>
          {width && (
            <p className="text-xs text-green-600 font-medium">
              ✓ Width: {width} feet selected
            </p>
          )}
        </div>

        {/* Height Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-900">
            Height (feet)
            <span className="text-xs text-neutral-500 ml-2">
              ({HEIGHT_MIN}ft - {HEIGHT_MAX}ft)
            </span>
          </label>
          <select
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full px-4 py-2.5 border-2 border-neutral-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-neutral-900 font-medium"
          >
            <option value="">Select Height</option>
            {heightOptions.map((h) => (
              <option key={h} value={h}>
                {h} feet
              </option>
            ))}
          </select>
          {height && (
            <p className="text-xs text-green-600 font-medium">
              ✓ Height: {height} feet selected
            </p>
          )}
        </div>
      </div>

      {/* Calculation Display */}
      {width && height && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg space-y-3">
          <p className="text-sm font-semibold text-neutral-900">Price Calculation</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Width × Height:</span>
              <span className="font-medium text-neutral-900">
                {width} ft × {height} ft = {totalSqft} sq ft
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Price per sq ft:</span>
              <span className="font-medium text-neutral-900">₱{PRICE_PER_SQFT}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
              <span className="font-semibold text-neutral-900">Total Cost:</span>
              <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                ₱{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {!width || !height ? (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Please select both width and height to calculate the total price
          </p>
        </div>
      ) : (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            ✓ Size specifications complete - {width}ft × {height}ft = ₱{totalPrice.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}
