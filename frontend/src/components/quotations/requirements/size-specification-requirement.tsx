"use client"

import React, { useState } from "react"
import { Ruler } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SizeSpecs {
  top?: string
  bottom?: string
  width?: number
  height?: number
  totalSqft?: number
  totalPrice?: number
}

interface SizeSpecificationRequirementProps {
  onSizeSpecChange: (specs: SizeSpecs) => void
  onSizeNotesChange?: (notes: string) => void
  initialSpecs?: SizeSpecs
  initialNotes?: string
  isRequired?: boolean
  topLabel?: string
  bottomLabel?: string
  sizeType?: "generic" | "tarpaulin"
  isLastStep?: boolean
}

export function SizeSpecificationRequirement({
  onSizeSpecChange,
  onSizeNotesChange,
  initialSpecs = {},
  initialNotes = "",
  isRequired = true,
  topLabel = "Top/Shirt Size",
  bottomLabel = "Bottom/Short Size",
  isLastStep = false,
}: SizeSpecificationRequirementProps) {
  const [specs, setSpecs] = useState<SizeSpecs>({
    top: initialSpecs.top || "",
    bottom: initialSpecs.bottom || "",
  })
  const [sizeNotes, setSizeNotes] = useState(initialNotes)

  const handleChange = (field: keyof SizeSpecs, value: string) => {
    const updated = { ...specs, [field]: value }
    setSpecs(updated)
    onSizeSpecChange(updated)
  }

  const handleNotesChange = (notes: string) => {
    setSizeNotes(notes)
    onSizeNotesChange?.(notes)
  }

  const commonSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Ruler size={20} className="text-neutral-600" />
        <h3 className="text-lg font-semibold text-neutral-900">
          Size Specifications {isRequired && <span className="text-red-500">*</span>}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Size */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-900">
            {topLabel}
          </label>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="e.g., Large, XL, 42"
              value={specs.top || ""}
              onChange={(e) => handleChange("top", e.target.value)}
              className="w-full"
            />
            <div className="flex flex-wrap gap-1">
              {commonSizes.map((size) => (
                <button
                  key={`top-${size}`}
                  type="button"
                  onClick={() => handleChange("top", size)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    specs.top === size
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-neutral-300 text-neutral-700 hover:border-primary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          {specs.top && (
            <p className="text-xs text-green-600 font-medium">
              ✓ Selected: {specs.top}
            </p>
          )}
        </div>

        {/* Bottom Size */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-900">
            {bottomLabel}
          </label>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="e.g., Medium, M, 30"
              value={specs.bottom || ""}
              onChange={(e) => handleChange("bottom", e.target.value)}
              className="w-full"
            />
            <div className="flex flex-wrap gap-1">
              {commonSizes.map((size) => (
                <button
                  key={`bottom-${size}`}
                  type="button"
                  onClick={() => handleChange("bottom", size)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    specs.bottom === size
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-neutral-300 text-neutral-700 hover:border-primary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          {specs.bottom && (
            <p className="text-xs text-green-600 font-medium">
              ✓ Selected: {specs.bottom}
            </p>
          )}
        </div>
      </div>

      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-900">
          {specs.top && specs.bottom
            ? "✓ All sizes specified"
            : "Please specify both top and bottom sizes"}
        </p>
      </div>

      {isLastStep && specs.top && specs.bottom && (
        <div className="space-y-2 pt-4 border-t border-neutral-200">
          <label className="block text-sm font-medium text-neutral-900">
            Size Notes <span className="text-neutral-500 text-xs">(Optional)</span>
          </label>
          <textarea
            placeholder="Add any special size modifications, material preferences, or other specific requirements..."
            value={sizeNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={3}
          />
        </div>
      )}
    </div>
  )
}
