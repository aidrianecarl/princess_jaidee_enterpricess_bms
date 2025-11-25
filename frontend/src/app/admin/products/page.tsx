"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, AlertCircle, TrendingUp, X } from "lucide-react"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { apiClient } from "@/lib/api-client"
import Image from "next/image"
import { useRouter } from "next/navigation"

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = () => {
    const token = localStorage.getItem("admin_token")
    const userData = localStorage.getItem("admin_user")

    if (!token || !userData) {
      router.push("/admin")
      return
    }
    setUser(JSON.parse(userData))
    setIsLoading(false)
  }

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
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.data || []
      setCategories(categoriesData)

      // Handle colors response
      const colorsData = Array.isArray(colorsRes.data) ? colorsRes.data : colorsRes.data.data || []
      setColors(colorsData)

      // Handle sizes response
      const sizesData = Array.isArray(sizesRes.data) ? sizesRes.data : sizesRes.data.data || []
      setSizes(sizesData)
    } catch (error) {
      console.error("[v0] Failed to fetch data:", error)
      alert("Failed to load data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append("image", file)

    try {
      const res = await apiClient.post("/admin/products/upload-image", formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return res.data.image_url || res.data.url
    } catch (error) {
      console.error("Failed to upload image:", error)
      throw new Error("Failed to upload image")
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsUploading(true)

      let imageUrl = formData.image_url
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const payload = {
        ...formData,
        image_url: imageUrl,
      }

      await apiClient.post("/admin/products", payload)
      setShowCreateModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Failed to create product:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    try {
      setIsUploading(true)

      let imageUrl = formData.image_url
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const payload = {
        ...formData,
        image_url: imageUrl,
      }

      await apiClient.put(`/admin/products/${selectedProduct.id}`, payload)
      setShowEditModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Failed to update product:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    try {
      await apiClient.post(`/admin/products/${selectedProduct.id}/add-stock`, {
        quantity: Number.parseInt(stockQuantity),
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
    setImagePreview(product.image_url || "")
    setImageFile(null)
    setShowEditModal(true)
  }

  const handleStockClick = (product: Product) => {
    setSelectedProduct(product)
    setStockQuantity("")
    setShowStockModal(true)
  }

  const resetForm = () => {
    setSelectedProduct(null)
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
    setImageFile(null)
    setImagePreview("")
    setShowCreateModal(false)
    setShowEditModal(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700", icon: AlertCircle }
    if (quantity < 30) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle }
    return { label: "In Stock", color: "bg-green-100 text-green-700", icon: TrendingUp }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex h-screen flex-col  bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 animate-fadeIn">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent break-words">
                  Products
                </h1>
                <p className="text-sm md:text-base text-neutral-600">Manage your product catalog</p>
              </div>
              <button
                onClick={() => {
                  resetForm()
                  setShowCreateModal(true)
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg hover:shadow-red-200 hover:scale-105 transition-all duration-300 font-medium text-sm md:text-base whitespace-nowrap"
              >
                <Plus size={18} />
                Create
              </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative animate-slideUp">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition-all"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => {
                  const stockStatus = getStockStatus(product.quantity_in_stock)
                  const StatusIcon = stockStatus.icon

                  return (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-neutral-900 rounded-lg border border-red-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/30 transition-all duration-300 animate-fadeIn flex flex-col hover:border-red-400"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Image */}
                      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-red-50 to-red-100 overflow-hidden">
                        {product.image_url ? (
                          <Image
  src={product.image_url || "/placeholder.svg"}
  alt={product.name}
  fill
  className="object-cover group-hover:scale-110 transition-transform duration-300"
  loading="eager"
  priority
/>

                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-xs md:text-sm text-red-400">No image</p>
                            </div>
                          </div>
                        )}
                        {/* Status Badge */}
                        <div
                          className={`absolute top-2 right-2 px-2 md:px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color} flex items-center gap-1`}
                        >
                          <StatusIcon size={12} />
                          <span className="hidden sm:inline">{stockStatus.label}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 md:p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-sm md:text-base text-neutral-900 dark:text-white truncate mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs md:text-sm text-neutral-500 mb-2">{product.category?.name}</p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs md:text-sm">
                          {product.color && (
                            <div className="flex items-center gap-1 truncate">
                              <div
                                className="w-3 h-3 rounded border border-neutral-300 flex-shrink-0"
                                style={{ backgroundColor: product.color.hex_code || "#cccccc" }}
                              />
                              <span className="text-neutral-600 dark:text-neutral-400 truncate">
                                {product.color.name}
                              </span>
                            </div>
                          )}
                          {product.size && (
                            <div className="text-neutral-600 dark:text-neutral-400 truncate">
                              Size: {product.size.name}
                            </div>
                          )}
                          <div className="font-semibold text-red-600">
                            ₱{Number(product.base_price ?? 0).toFixed(2)}
                          </div>
                          <div className="text-neutral-600 dark:text-neutral-400">
                            Stock: {product.quantity_in_stock}
                          </div>
                        </div>

                        {product.creator && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                            Added by: {product.creator.first_name} {product.creator.last_name}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 border-t border-red-100 dark:border-neutral-800 pt-3 mt-auto">
                          <button
                            onClick={() => handleStockClick(product)}
                            className="flex-1 px-2 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition text-xs md:text-sm font-medium hover:shadow-md"
                          >
                            Stock
                          </button>
                          <button
                            onClick={() => handleEditClick(product)}
                            className="flex-1 px-2 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition text-xs md:text-sm font-medium hover:shadow-md"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1 px-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition text-xs md:text-sm font-medium hover:shadow-md"
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
          onClose={() => {
            resetForm()
          }}
          onSubmit={handleCreateProduct}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          colors={colors}
          sizes={sizes}
          title="Create New Product"
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          isUploading={isUploading}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <ProductModal
          isOpen={showEditModal}
          onClose={() => {
            resetForm()
          }}
          onSubmit={handleEditProduct}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          colors={colors}
          sizes={sizes}
          title="Edit Product"
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          isUploading={isUploading}
        />
      )}

      {/* Add Stock Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full animate-slideUp border border-red-200 dark:border-neutral-800">
            <div className="p-6 border-b border-red-200 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
              <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Add Stock - {selectedProduct.name}
              </h2>
              <button
                onClick={() => {
                  setShowStockModal(false)
                  setSelectedProduct(null)
                }}
                className="p-1 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-lg transition-all duration-200 text-red-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddStock} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-2">
                  Current Stock: {selectedProduct.quantity_in_stock}
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="Enter quantity to add"
                  className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
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
                  className="flex-1 px-4 py-2 border border-red-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition-all duration-200 font-medium hover:scale-105"
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
  imagePreview: string
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isUploading: boolean
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
  imagePreview,
  onImageChange,
  isUploading,
}: ProductModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-2xl w-full my-8 animate-slideUp border border-red-200 dark:border-neutral-800">
        <div className="p-6 border-b border-red-200 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
          <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-lg transition-all duration-200 text-red-600 hover:text-red-700"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Product name"
              className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">Color</label>
              <select
                value={formData.color_id}
                onChange={(e) => setFormData({ ...formData, color_id: e.target.value })}
                className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
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
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">Size</label>
              <select
                value={formData.size_id}
                onChange={(e) => setFormData({ ...formData, size_id: e.target.value })}
                className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">
                Base Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity_in_stock}
                onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-2">
              Product Image
            </label>
            <div className="border-2 border-dashed border-red-300 dark:border-red-900/50 rounded-lg p-4 text-center hover:border-red-400 dark:hover:border-red-800 transition-all">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image_url: "" })
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear Image
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <input type="file" accept="image/*" onChange={onImageChange} className="hidden" id="product-image" />
                  <label
                    htmlFor="product-image"
                    className="text-sm text-red-600 hover:text-red-700 cursor-pointer font-medium"
                  >
                    Select Image
                  </label>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
                id="product-image-input"
              />
              <label htmlFor="product-image-input" className="block mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-900/20 dark:file:text-red-400"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description"
              rows={2}
              className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4 border-t border-red-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-red-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition-all duration-200 font-medium disabled:opacity-50 hover:scale-105"
              disabled={isUploading}
            >
              {isUploading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
