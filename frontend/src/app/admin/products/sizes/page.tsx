"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { apiClient } from "@/lib/api-client"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"

interface Size {
  id: number
  name: string
  description?: string
  created_at: string
}

export default function SizesPage() {
  const [sizes, setSizes] = useState<Size[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSizes()
  }, [])

  const fetchSizes = async () => {
    try {
      setIsLoading(true)
      setError("")
      const res = await apiClient.get("/sizes")
      const data = Array.isArray(res.data) ? res.data : (res.data.data || [])
      setSizes(data)
    } catch (error) {
      console.error("[v0] Failed to fetch sizes:", error)
      setError("Failed to load sizes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError("")
      if (selectedSize) {
        await apiClient.put(`/sizes/${selectedSize.id}`, formData)
      } else {
        await apiClient.post("/sizes", formData)
      }
      resetForm()
      fetchSizes()
    } catch (error) {
      console.error("[v0] Failed to save size:", error)
      setError("Failed to save size")
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this size?")) {
      try {
        await apiClient.delete(`/sizes/${id}`)
        fetchSizes()
      } catch (error) {
        console.error("[v0] Failed to delete size:", error)
        setError("Failed to delete size")
      }
    }
  }

  const handleEdit = (size: Size) => {
    setSelectedSize(size)
    setFormData({
      name: size.name,
      description: size.description || "",
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setSelectedSize(null)
    setFormData({ name: "", description: "" })
    setShowModal(false)
    setError("")
  }

  const filteredSizes = sizes.filter(size =>
    size.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                    Product Sizes
                  </h1>
                  <p className="text-neutral-600">Manage available sizes</p>
                </div>
                <button
                  onClick={() => {
                    resetForm()
                    setShowModal(true)
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  <Plus size={20} />
                  Add Size
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Search */}
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 text-neutral-400" size={20} />
                <input
                  type="text"
                  placeholder="Search sizes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Grid */}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
                </div>
              ) : filteredSizes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500">No sizes found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSizes.map((size) => (
                    <div key={size.id} className="bg-white rounded-lg border border-red-200 p-4 hover:shadow-lg transition">
                      <h3 className="font-semibold text-neutral-900 mb-1">{size.name}</h3>
                      <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{size.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(size)}
                          className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(size.id)}
                          className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-red-200">
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                {selectedSize ? "Edit Size" : "Add Size"}
              </h2>
            </div>
            <form onSubmit={handleAddEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Size Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
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
              <div className="flex gap-2 pt-4 border-t border-red-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-red-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  {selectedSize ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
