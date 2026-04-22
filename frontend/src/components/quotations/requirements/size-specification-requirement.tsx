"use client"

import React, { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SizeItem {
  id: string
  qty?: number
  qtyUnit?: string
  sizeTop?: string
  lengthTopInches?: string
  sizeBottom?: string
  lengthBottomInches?: string
  additionalName?: string
}

interface SizeSpecs {
  items?: SizeItem[]
}

interface SizeSpecificationRequirementProps {
  onSizeSpecChange: (specs: SizeSpecs) => void
  onSizeNotesChange?: (notes: string) => void
  initialSpecs?: SizeSpecs
  initialNotes?: string
  isRequired?: boolean
}

const commonSizes = ["5TS", "4TS", "3TS", "2TS", "TS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]

export function SizeSpecificationRequirement({
  onSizeSpecChange,
  onSizeNotesChange,
  initialSpecs = {},
  initialNotes = "",
  isRequired = true,
}: SizeSpecificationRequirementProps) {
  const [items, setItems] = useState<SizeItem[]>(
    initialSpecs.items && initialSpecs.items.length > 0
      ? initialSpecs.items
      : [{ id: Date.now().toString(), qty: 0, qtyUnit: "PCS", sizeTop: "", lengthTopInches: "", sizeBottom: "", lengthBottomInches: "", additionalName: "" }]
  )
  const [sizeNotes, setSizeNotes] = useState(initialNotes)

  const addItem = () => {
    const newItem: SizeItem = {
      id: Date.now().toString(),
      qty: 0,
      qtyUnit: "PCS",
      sizeTop: "",
      lengthTopInches: "",
      sizeBottom: "",
      lengthBottomInches: "",
      additionalName: "",
    }
    const updated = [...items, newItem]
    setItems(updated)
    onSizeSpecChange({ items: updated })
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      const updated = items.filter((item) => item.id !== id)
      setItems(updated)
      onSizeSpecChange({ items: updated })
    }
  }

  const updateItem = (id: string, field: keyof SizeItem, value: any) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    )
    setItems(updated)
    onSizeSpecChange({ items: updated })
  }

  const handleNotesChange = (notes: string) => {
    setSizeNotes(notes)
    onSizeNotesChange?.(notes)
  }

  const filledItems = items.filter((item) => item.qty && item.qty > 0)

  return (
    <div className="space-y-4">
      {/* Sizing Guide Tables */}
      <div className="space-y-4 bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-lg border-2 border-amber-200">
        <div>
          <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">!</span>
            Size Specifications Guide - SANDO & T-SHIRT
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-amber-200">
                  <th rowSpan={2} className="border border-amber-300 px-2 py-1 font-bold text-amber-900">SIZE</th>
                  <th colSpan={2} className="border border-amber-300 px-2 py-1 font-bold text-amber-900">SANDO</th>
                  <th colSpan={2} className="border border-amber-300 px-2 py-1 font-bold text-amber-900">T-SHIRT</th>
                </tr>
                <tr className="bg-amber-200">
                  <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">WIDTH</th>
                  <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">LENGTH</th>
                  <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">WIDTH</th>
                  <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">LENGTH</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: '5TS', sandoW: 26, sandoL: 18, tshirtW: 26, tshirtL: 17 },
                  { size: '4TS', sandoW: 28, sandoL: 20, tshirtW: 28, tshirtL: 19 },
                  { size: '3TS', sandoW: 30, sandoL: 24, tshirtW: 30, tshirtL: 23 },
                  { size: '2TS', sandoW: 32, sandoL: 25, tshirtW: 32, tshirtL: 24 },
                  { size: 'TS', sandoW: 34, sandoL: 26, tshirtW: 34, tshirtL: 25 },
                  { size: 'XS', sandoW: 36, sandoL: 27, tshirtW: 36, tshirtL: 26 },
                  { size: 'S', sandoW: 38, sandoL: 28, tshirtW: 38, tshirtL: 27 },
                  { size: 'M', sandoW: 40, sandoL: 29, tshirtW: 40, tshirtL: 28 },
                  { size: 'L', sandoW: 42, sandoL: 30, tshirtW: 42, tshirtL: 29 },
                  { size: 'XL', sandoW: 44, sandoL: 30, tshirtW: 44, tshirtL: 30 },
                  { size: '2XL', sandoW: 46, sandoL: 31, tshirtW: 46, tshirtL: 31 },
                  { size: '3XL', sandoW: 48, sandoL: 31, tshirtW: 48, tshirtL: 31 },
                  { size: '4XL', sandoW: 50, sandoL: 32, tshirtW: 50, tshirtL: 31 },
                  { size: '5XL', sandoW: 52, sandoL: 32, tshirtW: 52, tshirtL: 32 },
                ].map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                    <td className="border border-amber-200 px-2 py-1 font-semibold text-amber-900">{row.size}</td>
                    <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.sandoW}</td>
                    <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.sandoL}</td>
                    <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.tshirtW}</td>
                    <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.tshirtL}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shorts Sizes Guide */}
        <div>
          <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">!</span>
            Size Specifications Guide - SHORTS
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-amber-200">
                  <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">SIZE</th>
                  <th colSpan={2} className="border border-amber-300 px-2 py-1 font-bold text-amber-900">FINISH</th>
                  <th colSpan={2} className="border border-amber-300 px-2 py-1 font-bold text-amber-900">BOX TYPE</th>
                </tr>
                <tr className="bg-amber-200">
                  <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900"></th>
                  <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">WIDTH</th>
                  <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">LENGTH</th>
                  <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">WIDTH</th>
                  <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">LENGTH</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: '5TS', finishW: 26, finishL: 13, boxW: 22, boxL: 17.5 },
                  { size: '4TS', finishW: 28, finishL: 13, boxW: 23, boxL: 17.5 },
                  { size: '3TS', finishW: 30, finishL: 14, boxW: 24, boxL: 18.5 },
                  { size: '2TS', finishW: 32, finishL: 15, boxW: 25, boxL: 19.5 },
                  { size: 'TS', finishW: 34, finishL: 17, boxW: 26, boxL: 21.5 },
                  { size: 'XS', finishW: 36, finishL: 18, boxW: 27, boxL: 22.5 },
                  { size: 'S', finishW: 38, finishL: 19, boxW: 28, boxL: 23.5 },
                  { size: 'M', finishW: 40, finishL: 20, boxW: 29, boxL: 24.5 },
                  { size: 'L', finishW: 42, finishL: 21, boxW: 30, boxL: 25.5 },
                  { size: 'XL', finishW: 44, finishL: 21, boxW: 31, boxL: 25.5 },
                  { size: '2XL', finishW: 46, finishL: 21, boxW: 32, boxL: 25.5 },
                  { size: '3XL', finishW: 48, finishL: 22, boxW: 33, boxL: 26.5 },
                  { size: '4XL', finishW: 50, finishL: 22, boxW: 34, boxL: 26.5 },
                  { size: '5XL', finishW: 52, finishL: 22, boxW: 35, boxL: 26.5 },
                ].map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                    <td className="border border-amber-200 px-2 py-1 font-semibold text-amber-900">{row.size}</td>
                    <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.finishW}</td>
                    <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.finishL}</td>
                    <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.boxW}</td>
                    <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.boxL}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-amber-800 bg-white p-2 rounded border border-amber-200 mt-3">
          <strong>Note:</strong> All measurements are in inches. Please refer to these specifications when selecting sizes. Contact us if you need custom sizing.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Size Specifications {isRequired && <span className="text-red-500">*</span>}
        </h3>
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
        {items.map((item) => {
          // Determine if this is a SET or PCS based on size selections
          const hasTopSize = item.sizeTop && item.sizeTop.trim() !== ""
          const hasBottomSize = item.sizeBottom && item.sizeBottom.trim() !== ""
          const qtyUnit = hasTopSize && hasBottomSize ? "SET" : "PCS"

          return (
          <div
            key={item.id}
            className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2"
          >
            {/* Row 1: Qty, Top Size, Top Length, Bottom Size, Bottom Length */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
                  <div className="h-9 px-3 rounded-md border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center bg-neutral-100 font-medium text-neutral-700">
                    {qtyUnit}
                  </div>
                </div>
              </div>

              {/* Top Size */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Top Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={item.sizeTop || ""}
                  onChange={(e) => updateItem(item.id, "sizeTop", e.target.value)}
                  className="w-full h-9 px-2 rounded-md border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  {commonSizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Top Length */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Top Length (in) <span className="text-red-500">*</span>
                </label>
                <select
                  value={item.lengthTopInches || ""}
                  onChange={(e) =>
                    updateItem(item.id, "lengthTopInches", e.target.value)
                  }
                  className="w-full h-9 px-2 rounded-md border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Standard">Standard</option>
                  {Array.from({ length: 21 }, (_, i) => 16 + i).map((len) => (
                    <option key={len} value={len}>{len}</option>
                  ))}
                </select>
              </div>

              {/* Bottom Size */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Bottom Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={item.sizeBottom || ""}
                  onChange={(e) => updateItem(item.id, "sizeBottom", e.target.value)}
                  className="w-full h-9 px-2 rounded-md border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  {commonSizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Bottom Length */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Bottom Length (in) <span className="text-red-500">*</span>
                </label>
                <select
                  value={item.lengthBottomInches || ""}
                  onChange={(e) =>
                    updateItem(item.id, "lengthBottomInches", e.target.value)
                  }
                  className="w-full h-9 px-2 rounded-md border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Standard">Standard</option>
                  {Array.from({ length: 21 }, (_, i) => 13 + i).map((len) => (
                    <option key={len} value={len}>{len}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Additional Name and Remove Button */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 items-end">
              {/* Additional Name - spans 2 cols */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Additional Name
                </label>
                <Input
                  type="text"
                  placeholder="Details"
                  value={item.additionalName || ""}
                  onChange={(e) =>
                    updateItem(item.id, "additionalName", e.target.value)
                  }
                  className="h-9 text-xs w-full"
                />
              </div>

              {/* Remove Button */}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="h-9 px-3 text-red-500 hover:bg-red-100 rounded-lg transition text-xs flex items-center justify-center border border-red-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )
        })}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          {filledItems.length > 0
            ? `✓ ${filledItems.length} item(s) specified`
            : "Please specify at least one item with quantity and sizes"}
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
