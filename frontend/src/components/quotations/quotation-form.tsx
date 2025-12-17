"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Plus, Trash2, X } from "lucide-react"
import { ProductModal } from "./product-modal"
import { ServiceModal } from "./service-modal"
import { LogoUploadModal } from "./logo-upload-modal"

interface QuotationItem {
  id: string
  type: "product" | "service"
  name: string
  description?: string
  image_url?: string
  base_price: number
  quantity: number
  unit_price: number
  line_total: number
}

export function QuotationForm() {
  const [items, setItems] = useState<QuotationItem[]>([])
  const [logoUrl, setLogoUrl] = useState<string>("")
  const [showProductModal, setShowProductModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showLogoModal, setShowLogoModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Customer Info
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerCity, setCustomerCity] = useState("")
  const [customerProvince, setCustomerProvince] = useState("")
  const [customerZipCode, setCustomerZipCode] = useState("")

  // Payment Info
  const [discountPercent, setDiscountPercent] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [notes, setNotes] = useState("")

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
  const discountAmount = (discountPercent / 100) * subtotal
  const total = subtotal - discountAmount
  const balanceDue = total - paidAmount

  const handleAddProduct = (product: any) => {
    const newItem: QuotationItem = {
      id: `product-${product.id}`,
      type: "product",
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      base_price: Number.parseFloat(product.base_price),
      quantity: 1,
      unit_price: Number.parseFloat(product.base_price),
      line_total: Number.parseFloat(product.base_price),
    }
    setItems([...items, newItem])
    setShowProductModal(false)
  }

  const handleAddService = (service: any) => {
    const newItem: QuotationItem = {
      id: `service-${service.id}`,
      type: "service",
      name: service.name,
      description: service.description,
      image_url: service.image_url,
      base_price: Number.parseFloat(service.base_price),
      quantity: 1,
      unit_price: Number.parseFloat(service.base_price),
      line_total: Number.parseFloat(service.base_price),
    }
    setItems([...items, newItem])
    setShowServiceModal(false)
  }

  const handleQuantityChange = (id: string, quantity: number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, quantity, line_total: quantity * item.unit_price } : item)),
    )
  }

  const handlePriceChange = (id: string, unitPrice: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, unit_price: unitPrice, line_total: item.quantity * unitPrice } : item,
      ),
    )
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleLogoUpload = (url: string) => {
    setLogoUrl(url)
    setShowLogoModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")

      const formData = new FormData()
      formData.append("customer_name", customerName)
      formData.append("customer_email", customerEmail)
      formData.append("customer_phone", customerPhone)
      formData.append("customer_address", customerAddress)
      formData.append("customer_city", customerCity)
      formData.append("customer_province", customerProvince)
      formData.append("customer_zip_code", customerZipCode)
      formData.append("discount", discountPercent.toString())
      formData.append("paid_amount", paidAmount.toString())
      formData.append("notes", notes)

      items.forEach((item, index) => {
        formData.append(`items[${index}][${item.type}_id]`, item.id.split("-")[1])
        formData.append(`items[${index}][quantity]`, item.quantity.toString())
        formData.append(`items[${index}][unit_price]`, item.unit_price.toString())
      })

      if (logoUrl && logoUrl.startsWith("data:")) {
        const blob = await fetch(logoUrl).then((r) => r.blob())
        formData.append("logo", blob, "logo.png")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.errors?.[0] || "Failed to create quotation")
      }

      const result = await response.json()
      alert("Quotation created successfully!")
      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fadeInUp">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Create Quotation
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Build your quotation by adding products and services</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <X className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800 text-sm sm:text-base">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Logo and Header Section */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-lg p-4 sm:p-8 animate-fadeInUp animation-delay-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Logo Upload */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Your Logo</label>
                <button
                  type="button"
                  onClick={() => setShowLogoModal(true)}
                  className="w-full h-32 sm:h-40 border-2 border-dashed border-red-300 rounded-xl flex items-center justify-center bg-red-50/50 hover:bg-red-100/50 transition-colors group"
                >
                  {logoUrl ? (
                    <img src={logoUrl || "/placeholder.svg"} alt="Logo" className="h-full w-full object-contain p-2" />
                  ) : (
                    <div className="text-center">
                      <Upload
                        className="mx-auto mb-2 text-red-600 group-hover:scale-110 transition-transform"
                        size={24}
                      />
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Choose your logo</p>
                    </div>
                  )}
                </button>
              </div>

              {/* Business Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-lg p-4 sm:p-8 animate-fadeInUp animation-delay-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Address Information</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Province"
                  value={customerProvince}
                  onChange={(e) => setCustomerProvince(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={customerZipCode}
                  onChange={(e) => setCustomerZipCode(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-lg p-4 sm:p-8 animate-fadeInUp animation-delay-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Quotation Items</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowProductModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all text-sm font-semibold"
                >
                  <Plus size={18} />
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowServiceModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all text-sm font-semibold"
                >
                  <Plus size={18} />
                  Add Service
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">
                  No items added yet. Click the buttons above to add products or services.
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-x-auto">
                <div className="hidden sm:block">
                  <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 mb-3">
                    <div className="col-span-4">Description</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1"></div>
                  </div>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100/50 transition-colors sm:items-center"
                  >
                    <div className="sm:col-span-4">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-600 mt-1">{item.description.substring(0, 60)}...</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-600 sm:hidden font-semibold mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-200 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-600 sm:hidden font-semibold mb-1">Unit Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handlePriceChange(item.id, Number.parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-600 sm:hidden font-semibold mb-1">Amount</label>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₱
                          {item.line_total.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-full sm:w-auto p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Section */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Notes */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-red-100 shadow-lg p-4 sm:p-8 animate-fadeInUp animation-delay-400">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Notes</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes or special instructions..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                />
              </div>

              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl shadow-lg p-4 sm:p-8 text-white animate-fadeInUp animation-delay-500">
                <h2 className="text-lg font-bold mb-6">Summary</h2>
                <div className="space-y-3 mb-6 border-b border-red-400 pb-6">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      ₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span>Discount (%)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number.parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-red-300 rounded bg-red-500/20 text-white text-right text-sm focus:outline-none"
                      />
                      <span className="font-semibold">
                        -₱
                        {discountAmount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Total Due</span>
                    <span className="text-lg font-bold">
                      ₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Paid Amount</span>
                    <div className="flex items-center">
                      <span className="text-sm mr-2">₱</span>
                      <input
                        type="number"
                        min="0"
                        max={total}
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(Number.parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-red-300 rounded bg-red-500/20 text-white text-right text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm pt-3 border-t border-red-400">
                    <span className="font-semibold">Balance Due</span>
                    <span className="text-lg font-bold">
                      ₱{balanceDue.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !customerName}
                  className="w-full mt-8 px-4 py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Creating..." : "Create Quotation"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Modals */}
      {showProductModal && <ProductModal onClose={() => setShowProductModal(false)} onSelect={handleAddProduct} />}
      {showServiceModal && <ServiceModal onClose={() => setShowServiceModal(false)} onSelect={handleAddService} />}
      {showLogoModal && <LogoUploadModal onClose={() => setShowLogoModal(false)} onUpload={handleLogoUpload} />}
    </div>
  )
}
