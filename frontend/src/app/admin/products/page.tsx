"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, AlertCircle, TrendingUp } from 'lucide-react'
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { apiClient } from "@/lib/api-client"
import Image from "next/image"

interface Product {
  id: number
  name: string
  image_url?: string
  category: { id: number; name: string }
  color?: { id: number; name: string; hex_code?: string }
  size?: { id: number; name: string }
  base_price: number
  quantity_in_stock: number
  status: "active" | "inactive" | "discontinued"
  created_by?: number
  creator?: { first_name: string; last_name: string }
  created_at: string
  updated_at: string
}

export default function ProductsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [stockQuantity, setStockQuantity] = useState("")
  const [categories, setCategories] = useState([])
  const [colors, setColors] = useState([])
  const [sizes, setSizes] = useState([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    color_id: "",
    size_id: "",
    base_price: "",
    unit_cost: "",
    quantity_in_stock: "",
    image_url: "",
    status: "active",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [productsRes, categoriesRes, colorsRes, sizesRes] = await Promise.all([
        apiClient.get("/admin/products"),
        apiClient.get("/admin/categories"),
        apiClient.get("/colors"),
        apiClient.get("/sizes"),
      ])
      
      // Handle paginated products response
      setProducts(Array.isArray(productsRes.data.data) ? productsRes.data.data : productsRes.data)
      
      // Handle categories response - ensure it's an array
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : (categoriesRes.data.data || [])
      setCategories(categoriesData)
      
      // Handle colors response
      const colorsData = Array.isArray(colorsRes.data) ? colorsRes.data : (colorsRes.data.data || [])
      setColors(colorsData)
      
      // Handle sizes response
      const sizesData = Array.isArray(sizesRes.data) ? sizesRes.data : (sizesRes.data.data || [])
      setSizes(sizesData)
    } catch (error) {
      console.error("[v0] Failed to fetch data:", error)
      alert("Failed to load data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.post("/admin/products", formData)
      setShowCreateModal(false)
      setFormData({
        name: "",
        description: "",
        category_id: "",
        color_id: "",
        size_id: "",
        base_price: "",
        unit_cost: "",
        quantity_in_stock: "",
        image_url: "",
        status: "active",
      })
      fetchData()
    } catch (error) {
      console.error("Failed to create product:", error)
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    try {
      await apiClient.put(`/admin/products/${selectedProduct.id}`, formData)
      setShowEditModal(false)
      setSelectedProduct(null)
      fetchData()
    } catch (error) {
      console.error("Failed to update product:", error)
    }
  }

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    try {
      await apiClient.post(`/admin/products/${selectedProduct.id}/add-stock`, {
        quantity: parseInt(stockQuantity),
      })
      setShowStockModal(false)
      setStockQuantity("")
      setSelectedProduct(null)
      fetchData()
    } catch (error) {
      console.error("Failed to add stock:", error)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await apiClient.delete(`/admin/products/${id}`)
        fetchData()
      } catch (error) {
        console.error("Failed to delete product:", error)
      }
    }
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: "",
      category_id: product.category?.id.toString() || "",
      color_id: product.color?.id.toString() || "",
      size_id: product.size?.id.toString() || "",
      base_price: product.base_price.toString(),
      unit_cost: "",
      quantity_in_stock: product.quantity_in_stock.toString(),
      image_url: product.image_url || "",
      status: product.status,
    })
    setShowEditModal(true)
  }

  const handleStockClick = (product: Product) => {
    setSelectedProduct(product)
    setStockQuantity("")
    setShowStockModal(true)
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700", icon: AlertCircle }
    if (quantity < 30) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle }
    return { label: "In Stock", color: "bg-green-100 text-green-700", icon: TrendingUp }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-neutral-50">
      <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={null} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 animate-fadeIn">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Products</h1>
                <p className="text-neutral-600">Manage your product catalog</p>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null)
                  setShowCreateModal(true)
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg hover:shadow-red-200 hover:scale-105 transition-all duration-300 font-medium"
              >
                <Plus size={20} />
                Create Product
              </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative animate-slideUp">
              <Search className="absolute left-3 top-3 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              />
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin inline-block">
                  <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => {
                  const stockStatus = getStockStatus(product.quantity_in_stock)
                  const StatusIcon = stockStatus.icon

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg border border-red-200 overflow-hidden hover:shadow-lg transition-all duration-300 animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-red-50 to-red-100 overflow-hidden">
                        {product.image_url ? (
                          <Image
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div size={40} className="mx-auto text-red-300 mb-2" />
                              <p className="text-sm text-red-400">No image</p>
                            </div>
                          </div>
                        )}
                        {/* Status Badge */}
                        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color} flex items-center gap-1`}>
                          <StatusIcon size={14} />
                          {stockStatus.label}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-neutral-900 truncate mb-1">{product.name}</h3>
                        <p className="text-sm text-neutral-500 mb-3">{product.category?.name}</p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                          {product.color && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded border border-neutral-300"
                                style={{ backgroundColor: product.color.hex_code || "#cccccc" }}
                              />
                              <span className="text-neutral-600 truncate">{product.color.name}</span>
                            </div>
                          )}
                          {product.size && (
                            <div>
                              <span className="text-neutral-600">Size: {product.size.name}</span>
                            </div>
                          )}
                          <div className="font-semibold text-red-600">₱{Number(product.base_price ?? 0).toFixed(2)}</div>
                          <div className="text-neutral-600">Stock: {product.quantity_in_stock}</div>
                        </div>

                        {product.creator && (
                          <p className="text-xs text-neutral-500 mb-4">Added by: {product.creator.first_name} {product.creator.last_name}</p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 border-t border-red-100 pt-3">
                          <button
                            onClick={() => handleStockClick(product)}
                            className="flex-1 px-2 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-medium"
                          >
                            Add Stock
                          </button>
                          <button
                            onClick={() => handleEditClick(product)}
                            className="flex-1 px-2 py-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1 px-2 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <ProductModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProduct}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          colors={colors}
          sizes={sizes}
          title="Create New Product"
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <ProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditProduct}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          colors={colors}
          sizes={sizes}
          title="Edit Product"
        />
      )}

      {/* Add Stock Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-slideUp">
            <div className="p-6 border-b border-red-200">
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Add Stock - {selectedProduct.name}
              </h2>
            </div>
            <form onSubmit={handleAddStock} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Current Stock: {selectedProduct.quantity_in_stock}</label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="Enter quantity to add"
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                  min="1"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowStockModal(false)
                    setSelectedProduct(null)
                  }}
                  className="flex-1 px-4 py-2 border border-red-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Product Modal Component
interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  formData: any
  setFormData: (data: any) => void
  categories: any[]
  colors: any[]
  sizes: any[]
  title: string
}

function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  categories,
  colors,
  sizes,
  title,
}: ProductModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 animate-slideUp">
        <div className="p-6 border-b border-red-200">
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{title}</h2>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Product name"
              className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Color</label>
              <select
                value={formData.color_id}
                onChange={(e) => setFormData({ ...formData, color_id: e.target.value })}
                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">Select color</option>
                {colors.map((color: any) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Size</label>
              <select
                value={formData.size_id}
                onChange={(e) => setFormData({ ...formData, size_id: e.target.value })}
                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">Select size</option>
                {sizes.map((size: any) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Base Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Unit Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Quantity in Stock</label>
            <input
              type="number"
              value={formData.quantity_in_stock}
              onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Image URL</label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description"
              rows={3}
              className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-red-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-red-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
