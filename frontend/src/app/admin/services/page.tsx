"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import Image from "next/image"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { ImageUpload } from "@/components/admin/image-upload"
import { useRouter } from "next/navigation"

interface Service {
  id: number
  name: string
  slug: string
  description?: string
  base_price: number | string
  category?: string
  specifications?: any
  image_url?: string
  status: "active" | "inactive"
  created_at: string
}

export default function ServicesPage() {
   const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = () => {
    const token = localStorage.getItem("admin_token")
    const userData = localStorage.getItem("admin_user")

    if (!token || !userData){
    router.push("/admin")
    return
  }
  
  setUser(JSON.parse(userData))
  setIsLoading(false)
}

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    base_price: "",
    category: "",
    specifications: "{}",
    image_url: "",
    status: "active" as "active" | "inactive",
  })
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      setError("")
      const res = await apiClient.get("/admin/services")
      const data = Array.isArray(res.data) ? res.data : res.data.data || []
      setServices(data)
    } catch (error) {
      console.error("Failed to fetch services:", error)
      setError("Failed to load services")
    } finally {
      setIsLoading(false)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append("image", file)

    try {
      const res = await apiClient.post("/admin/services/upload-image", formDataUpload, {
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

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError("")
      setIsUploading(true)

      let imageUrl = formData.image_url
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const payload = {
        ...formData,
        image_url: imageUrl,
        base_price: Number.parseFloat(formData.base_price) || 0,
        specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
      }

      if (selectedService) {
        await apiClient.put(`/admin/services/${selectedService.id}`, payload)
      } else {
        await apiClient.post("/admin/services", payload)
      }
      resetForm()
      fetchServices()
    } catch (error) {
      console.error("Failed to save service:", error)
      setError("Failed to save service")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await apiClient.delete(`/admin/services/${id}`)
        fetchServices()
      } catch (error) {
        console.error("Failed to delete service:", error)
        setError("Failed to delete service")
      }
    }
  }

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setFormData({
      name: service.name,
      slug: service.slug,
      description: service.description || "",
      base_price: typeof service.base_price === "number" ? service.base_price.toString() : String(service.base_price),
      category: service.category || "",
      specifications: JSON.stringify(service.specifications || {}),
      image_url: service.image_url || "",
      status: service.status,
    })
    setImagePreview(service.image_url || "")
    setImageFile(null)
    setShowModal(true)
  }

  const resetForm = () => {
    setSelectedService(null)
    setFormData({
      name: "",
      slug: "",
      description: "",
      base_price: "",
      category: "",
      specifications: "{}",
      image_url: "",
      status: "active",
    })
    setImageFile(null)
    setImagePreview("")
    setShowModal(false)
    setError("")
  }

  const handleImageChange = (file: File | null) => {
    setImageFile(file)
  }

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url })
  }

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2)
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user = {user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}/>
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen = {isSidebarOpen} onToggle={setIsSidebarOpen} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent break-words">
                  Services
                </h1>
                <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400">Manage service offerings</p>
              </div>
              <button
                onClick={() => {
                  resetForm()
                  setShowModal(true)
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition font-medium text-sm md:text-base whitespace-nowrap"
              >
                <Plus size={18} />
                Add Service
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 md:p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-neutral-800 text-red-700 dark:text-red-400 rounded-lg text-sm md:text-base">
                {error}
              </div>
            )}

            {/* Search */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-500 dark:text-neutral-400">No services found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white dark:bg-neutral-900 rounded-lg border border-red-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-40 sm:h-48 bg-gradient-to-br from-red-50 to-red-100">
                      {service.image_url ? (
                        <Image
                          src={service.image_url || "/placeholder.svg"}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-red-300">
                          <span className="text-xs md:text-sm">No image</span>
                        </div>
                      )}
                      <span
                        className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${
                          service.status === "active"
                            ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm md:text-base text-neutral-900 dark:text-white mb-1 truncate">
                        {service.name}
                      </h3>
                      {service.category && (
                        <p className="text-xs md:text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                          {service.category}
                        </p>
                      )}
                      <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <p className="text-base md:text-lg font-bold text-red-600 dark:text-red-400 mb-3">
                        ₱{formatPrice(service.base_price)}
                      </p>
                      <div className="flex gap-2 border-t border-red-100 dark:border-neutral-800 pt-3 mt-auto">
                        <button
                          onClick={() => handleEdit(service)}
                          className="flex-1 px-2 md:px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition text-xs md:text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="flex-1 px-2 md:px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition text-xs md:text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-2xl w-full my-8">
            <div className="p-4 md:p-6 border-b border-red-200 dark:border-neutral-800">
              <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                {selectedService ? "Edit Service" : "Add Service"}
              </h2>
            </div>
            <form onSubmit={handleAddEdit} className="p-4 md:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Service Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., tarpauline-printing"
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Base Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Service Image</label>
                <ImageUpload
                  value={imageFile}
                  onChange={handleImageChange}
                  onImageUrlChange={handleImageUrlChange}
                  previewUrl={imagePreview}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4 border-t border-red-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-red-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? "Saving..." : selectedService ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
