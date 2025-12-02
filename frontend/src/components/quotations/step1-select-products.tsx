"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Search } from "lucide-react"

interface Step1Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step1SelectProducts({ formData, setFormData }: Step1Props) {
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProductsAndServices()
  }, [])

  const fetchProductsAndServices = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")
      console.log("[v0] Fetching products and services with token:", token ? "exists" : "missing")

      const [productsRes, servicesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        console.log("[v0] Products response:", productsData)
        const productsArray = Array.isArray(productsData) ? productsData : productsData.data || []
        setProducts(productsArray)
      } else {
        console.error("[v0] Products fetch failed:", productsRes.status)
        setError("Failed to load products")
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        console.log("[v0] Services response:", servicesData)
        const servicesArray = Array.isArray(servicesData) ? servicesData : servicesData.data || []
        setServices(servicesArray)
      } else {
        console.error("[v0] Services fetch failed:", servicesRes.status)
        setError("Failed to load services")
      }
    } catch (err: any) {
      console.error("[v0] Fetch error:", err.message)
      setError("Failed to fetch products and services")
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = (type: "product" | "service", item: any) => {
    const newItem = {
      id: `${type}-${item.id}`,
      type,
      ...item,
      quantity: 1,
    }

    const exists = formData.items.some((i: any) => i.id === newItem.id)
    if (!exists) {
      setFormData({
        ...formData,
        items: [...formData.items, newItem],
      })
    }
  }

  const removeItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item: any) => item.id !== id),
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    setFormData({
      ...formData,
      items: formData.items.map((item: any) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
        <p className="text-gray-600">Loading products and services...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchProductsAndServices}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  const filteredServices = Array.isArray(services)
    ? services.filter((s: any) => s.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 1: Select Products & Services</h2>
        <p className="text-gray-600">Choose what you want to quotate. You can add multiple items.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search products and services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products & Services List */}
        <div className="lg:col-span-2 space-y-6">
          {filteredProducts.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                Products
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50/30 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-red-600">₱{Number(product.base_price).toLocaleString()}</p>
                      <button
                        onClick={() => addItem("product", product)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredServices.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServices.map((service: any) => (
                  <div
                    key={service.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-orange-600">₱{Number(service.base_price).toLocaleString()}</p>
                      <button
                        onClick={() => addItem("service", service)}
                        className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredProducts.length === 0 && filteredServices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No products or services found. Try a different search.</p>
            </div>
          )}
        </div>

        {/* Selected Items Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-lg p-4 sticky top-4">
            <h3 className="font-bold text-gray-900 mb-4">Selected Items ({formData.items.length})</h3>

            {formData.items.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-6">Select products or services to begin</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {formData.items.map((item: any) => (
                  <div key={item.id} className="bg-white rounded-lg p-3 border border-red-100 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-600">₱{Number(item.base_price).toLocaleString()}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
