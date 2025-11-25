"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, X, Trash2 } from "lucide-react"
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
  specifications?: Record<string, string> | null
  image_url?: string
  status: "active" | "inactive"
  created_at: string
}

interface SpecificationEntry {
  key: string
  value: string
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

    if (!token || !userData) {
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
    image_url: "",
    status: "active" as "active" | "inactive",
  })

  const [specifications, setSpecifications] = useState<SpecificationEntry[]>([])

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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const specificationsToObject = (specs: SpecificationEntry[]): Record<string, string> => {
    const obj: Record<string, string> = {}
    specs.forEach((spec) => {
      if (spec.key.trim()) {
        obj[spec.key.trim()] = spec.value.trim()
      }
    })
    return obj
  }

  const objectToSpecifications = (obj: Record<string, string> | null | undefined): SpecificationEntry[] => {
    if (!obj || typeof obj !== "object") return []
    return Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }))
  }

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }])
  }

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const updateSpecification = (index: number, field: "key" | "value", value: string) => {
    const updated = [...specifications]
    updated[index][field] = value
    setSpecifications(updated)
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
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        base_price: Number.parseFloat(formData.base_price) || 0,
        category: formData.category || null,
        specifications: specificationsToObject(specifications),
        image_url: imageUrl || null,
        status: formData.status,
      }

      if (selectedService) {
        await apiClient.put(`/admin/services/${selectedService.id}`, payload)
      } else {
        await apiClient.post("/admin/services", payload)
      }
      resetForm()
      fetchServices()
    } catch (error: any) {
      console.error("Failed to save service:", error)
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        const errorMessages = Object.values(errors).flat().join(", ")
        setError(errorMessages)
      } else if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else {
        setError("Failed to save service")
      }
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
      image_url: service.image_url || "",
      status: service.status,
    })
    setSpecifications(objectToSpecifications(service.specifications))
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
      image_url: "",
      status: "active",
    })
    setSpecifications([])
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

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    })
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
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition-all duration-300 font-medium text-sm md:text-base whitespace-nowrap hover:scale-105"
              >
                <Plus size={18} />
                Add Service
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 md:p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-neutral-800 text-red-700 dark:text-red-400 rounded-lg text-sm md:text-base animate-slideDown">
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
                className="w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fadeIn">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white dark:bg-neutral-900 rounded-lg border border-red-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/30 transition-all duration-300 flex flex-col hover:border-red-400"
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
                          className="flex-1 px-2 md:px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition text-xs md:text-sm font-medium hover:shadow-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="flex-1 px-2 md:px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition text-xs md:text-sm font-medium hover:shadow-md"
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-2xl w-full my-8 animate-slideUp border border-red-200 dark:border-neutral-800">
            <div className="p-4 md:p-6 border-b border-red-200 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
              <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                {selectedService ? "Edit Service" : "Add Service"}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-lg transition-all duration-200 text-red-600 hover:text-red-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddEdit} className="p-4 md:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-2">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-2">
                  Slug (auto-generated if empty)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., tarpaulin-printing"
                  className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Printing Services"
                    className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-2">
                    Base Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the service..."
                  className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">
                    Specifications
                  </label>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/40 transition flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Specification
                  </button>
                </div>
                <div className="space-y-2">
                  {specifications.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">
                      No specifications added. Click "Add Specification" to add one.
                    </p>
                  ) : (
                    specifications.map((spec, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => updateSpecification(index, "key", e.target.value)}
                          placeholder="e.g., Material"
                          className="flex-1 px-3 py-2 text-sm border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => updateSpecification(index, "value", e.target.value)}
                          placeholder="e.g., Vinyl"
                          className="flex-1 px-3 py-2 text-sm border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecification(index)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-2">
                  Service Image
                </label>
                <ImageUpload
                  value={imageFile}
                  onChange={handleImageChange}
                  onImageUrlChange={handleImageUrlChange}
                  previewUrl={imagePreview}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  className="w-full px-3 py-2 border border-red-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-neutral-800 dark:text-white transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-red-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={resetForm}
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
