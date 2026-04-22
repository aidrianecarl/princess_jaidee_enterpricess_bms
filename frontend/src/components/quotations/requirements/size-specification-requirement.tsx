"use client"

import React, { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SizeItem {
  id: string
  qty?: number
  qtyUnit?: string
  width?: number
  height?: number
  name?: string
  additionalName?: string
}

interface SizeSpecs {
  top?: string
  bottom?: string
  width?: number
  height?: number
  totalSqft?: number
  totalPrice?: number
  items?: SizeItem[]
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
}

export function SizeSpecificationRequirement({
  onSizeSpecChange,
  onSizeNotesChange,
  initialSpecs = {},
  initialNotes = "",
  isRequired = true,
  topLabel = "Top/Shirt Size",
  bottomLabel = "Bottom/Short Size",
  sizeType = "generic",
}: SizeSpecificationRequirementProps) {
  const [items, setItems] = useState<SizeItem[]>(
    initialSpecs.items && initialSpecs.items.length > 0
      ? initialSpecs.items
      : [{ id: Date.now().toString(), qty: 0, qtyUnit: "PCS", width: 0, height: 0, additionalName: "" }]
  )
  const [sizeNotes, setSizeNotes] = useState(initialNotes)

  const addItem = () => {
    const newItem: SizeItem = {
      id: Date.now().toString(),
      qty: 0,
      qtyUnit: "PCS",
      width: 0,
      height: 0,
      additionalName: "",
    }
    const updated = [...items, newItem]
    setItems(updated)
    onSizeSpecChange({ ...initialSpecs, items: updated })
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      const updated = items.filter((item) => item.id !== id)
      setItems(updated)
      onSizeSpecChange({ ...initialSpecs, items: updated })
    }
  }

  const updateItem = (id: string, field: keyof SizeItem, value: any) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    )
    setItems(updated)
    onSizeSpecChange({ ...initialSpecs, items: updated })
  }

  const handleNotesChange = (notes: string) => {
    setSizeNotes(notes)
    onSizeNotesChange?.(notes)
  }

  const filledItems = items.filter((item) => item.qty && item.qty > 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-neutral-900">
            Size Specifications {isRequired && <span className="text-red-500">*</span>}
          </h3>
        </div>
        <Button
          type="button"
          onClick={addItem}
          variant="outline"
          size="sm"
          className="gap-1 bg-transparent"
        >
          <Plus size={16} />
          Add Item
        </Button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto p-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {/* Qty */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Qty <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    min="1"
                    placeholder="4"
                    value={item.qty || ""}
                    onChange={(e) =>
                      updateItem(item.id, "qty", parseInt(e.target.value) || 0)
                    }
                    className="h-9 text-sm flex-1"
                  />
                  <select
                    value={item.qtyUnit || "PCS"}
                    onChange={(e) =>
                      updateItem(item.id, "qtyUnit", e.target.value)
                    }
                    className="h-9 px-2 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PCS">PCS</option>
                    <option value="SETS">SETS</option>
                    <option value="UNITS">UNITS</option>
                  </select>
                </div>
              </div>

              {/* Width */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Width (inches) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="0"
                  value={item.width || ""}
                  onChange={(e) =>
                    updateItem(item.id, "width", parseFloat(e.target.value) || 0)
                  }
                  className="h-9 text-sm"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Height (inches) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="0"
                  value={item.height || ""}
                  onChange={(e) =>
                    updateItem(item.id, "height", parseFloat(e.target.value) || 0)
                  }
                  className="h-9 text-sm"
                />
              </div>

              {/* Jersey# (Number only) */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Jersey # <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Jersey #"
                  value={item.name || ""}
                  onChange={(e) =>
                    updateItem(item.id, "name", e.target.value)
                  }
                  className="h-9 text-sm"
                />
              </div>

              {/* Additional Name */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Additional Name
                </label>
                <Input
                  type="text"
                  placeholder="Additional details"
                  value={item.additionalName || ""}
                  onChange={(e) =>
                    updateItem(item.id, "additionalName", e.target.value)
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Remove Button */}
            {items.length > 1 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          {filledItems.length > 0
            ? `✓ ${filledItems.length} item(s) specified`
            : "Please specify at least one item with quantity and dimensions"}
        </p>
      </div>

      {filledItems.length > 0 && (
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
