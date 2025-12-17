"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingCart, Plus, Minus } from "lucide-react"
import Image from "next/image"

interface Step1Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step1SelectServices({ formData, setFormData }: Step1Props) {
  const [services, setServices] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"services" | "products">("services")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token")

        const [servicesRes, productsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/services?status=active`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?status=active`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          setServices(Array.isArray(servicesData) ? servicesData : servicesData.data || [])
        }
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(Array.isArray(productsData) ? productsData : productsData.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleItem = (item: any, type: "service" | "product") => {
    const existingIndex = formData.items.findIndex((i: any) => i.id === item.id && i.type === type)

    if (existingIndex >= 0) {
      const newItems = formData.items.filter((_: any, i: number) => i !== existingIndex)
      setFormData({ ...formData, items: newItems })
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            id: item.id,
            type,
            name: item.name,
            base_price: item.base_price,
            quantity: 1,
            image_url: item.image_url,
            has_design: item.has_design,
            has_team: item.has_team,
            has_sizes: item.has_sizes,
          },
        ],
      })
    }
  }

  const updateQuantity = (itemId: number, type: string, delta: number) => {
    setFormData({
      ...formData,
      items: formData.items.map((item: any) =>
        item.id === itemId && item.type === type ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
      ),
    })
  }

  const dataToDisplay = activeTab === "services" ? services : products
  const filteredData = dataToDisplay.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Step 1: Select Services & Products</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Choose the services and products you need for your quotation
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-red-200">
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === "services"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === "products"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Products
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No {activeTab} found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item) => {
            const isSelected = formData.items.some(
              (i: any) => i.id === item.id && i.type === (activeTab === "services" ? "service" : "product"),
            )
            const selectedItem = formData.items.find(
              (i: any) => i.id === item.id && i.type === (activeTab === "services" ? "service" : "product"),
            )

            return (
              <div
                key={`${activeTab}-${item.id}`}
                className={`rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? "border-red-600 shadow-lg shadow-red-200"
                    : "border-gray-200 hover:border-red-300 hover:shadow-md"
                }`}
              >
                {/* Image */}
                <div className="relative h-40 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      width={200}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-center">
                      <ShoppingCart className="mx-auto text-red-400 mb-2" size={32} />
                      <p className="text-xs text-red-400">No image</p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-base text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  <p className="text-lg font-bold text-red-600 mb-3">₱{Number(item.base_price).toLocaleString()}</p>

                  {/* Quantity Control */}
                  {isSelected && selectedItem ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, activeTab === "services" ? "service" : "product", -1)}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      >
                        <Minus size={16} className="mx-auto" />
                      </button>
                      <span className="px-3 py-2 font-bold text-gray-900">{selectedItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, activeTab === "services" ? "service" : "product", 1)}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      >
                        <Plus size={16} className="mx-auto" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleItem(item, activeTab === "services" ? "service" : "product")}
                      className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
                    >
                      Add to Quotation
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Selected Items Summary */}
      {formData.items.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
          <p className="font-semibold text-gray-900">
            Selected Items: <span className="text-red-600">{formData.items.length}</span>
          </p>
          <p className="text-sm text-gray-600">
            Total Quantity: {formData.items.reduce((sum, i) => sum + i.quantity, 0)}
          </p>
        </div>
      )}
    </div>
  )
}
