"use client"

import { useState } from "react"
import { Plus, Trash2, Download, Send } from "lucide-react"

interface Product {
  id: number
  name: string
  base_price: number
  sku: string
}

interface Service {
  id: number
  name: string
  base_price: number
  slug: string
}

interface QuotationItem {
  id: string
  type: "product" | "service"
  itemId: number
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

interface QuotationBuilderProps {
  products: Product[]
  services: Service[]
}

export function QuotationBuilder({ products, services }: QuotationBuilderProps) {
  const [items, setItems] = useState<QuotationItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState("")

  const addItem = (type: "product" | "service", item: Product | Service) => {
    const newItem: QuotationItem = {
      id: Math.random().toString(),
      type,
      itemId: item.id,
      name: item.name,
      quantity: 1,
      unitPrice: item.base_price,
      lineTotal: item.base_price,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
              lineTotal: item.unitPrice * quantity,
            }
          : item,
      ),
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const total = subtotal - discount

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Selection Panel */}
      <div className="lg:col-span-2 space-y-8">
        {/* Products */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-neutral-900">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary/30 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{product.name}</p>
                  <p className="text-sm text-neutral-600">₱{product.base_price}</p>
                </div>
                <button
                  onClick={() => addItem("product", product)}
                  className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition"
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-neutral-900">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary/30 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{service.name}</p>
                  <p className="text-sm text-neutral-600">₱{service.base_price}</p>
                </div>
                <button
                  onClick={() => addItem("service", service)}
                  className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition"
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-neutral-900">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes or special requests..."
            className="w-full h-24 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>

      {/* Summary Panel */}
      <div className="space-y-6">
        {/* Items */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold mb-4 text-neutral-900">Selected Items ({items.length})</h2>

          {items.length === 0 ? (
            <p className="text-neutral-600 text-sm">No items selected</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="p-3 bg-neutral-50 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-600">₱{item.unitPrice.toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                  />

                  <p className="text-right font-semibold text-neutral-900">₱{item.lineTotal.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal:</span>
            <span className="font-semibold">₱{subtotal.toLocaleString()}</span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discount</label>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Number.parseFloat(e.target.value)))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">₱{total.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                <Send size={18} />
                Generate Quotation
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-600 rounded-lg hover:bg-neutral-50 transition">
                <Download size={18} />
                Preview PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
