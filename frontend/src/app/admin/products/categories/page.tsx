"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { apiClient } from "@/lib/api-client"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useRouter } from "next/navigation"

interface Category {
  id: number
  name: string
  description?: string
  status: "active" | "inactive"
  created_at: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError("")
      const res = await apiClient.get("/admin/categories")
      const data = Array.isArray(res.data) ? res.data : (res.data.data || [])
      setCategories(data)
    } catch (error) {
      console.error("[v0] Failed to fetch categories:", error)
      setError("Failed to load categories")
    } finally {
      setIsLoading(false)
    }
  }
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


  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError("")
      if (selectedCategory) {
        await apiClient.put(`/admin/categories/${selectedCategory.id}`, formData)
      } else {
        await apiClient.post("/admin/categories", formData)
      }
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error("[v0] Failed to save category:", error)
      setError("Failed to save category")
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await apiClient.delete(`/admin/categories/${id}`)
        fetchCategories()
      } catch (error) {
        console.error("[v0] Failed to delete category:", error)
        setError("Failed to delete category")
      }
    }
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      status: category.status,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setSelectedCategory(null)
    setFormData({ name: "", description: "", status: "active" })
    setShowModal(false)
    setError("")
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen flex-col  bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                    Product Categories
                  </h1>
                  <p className="text-neutral-600">Manage product categories</p>
                </div>
                <button
                  onClick={() => {
                    resetForm()
                    setShowModal(true)
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  <Plus size={20} />
                  Add Category
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
                  placeholder="Search categories..."
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
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500">No categories found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg border border-red-200 p-4 hover:shadow-lg transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900">{category.name}</h3>
                          <p className="text-sm text-neutral-500 line-clamp-2">{category.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${
                          category.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {category.status}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-red-100">
                        <button
                          onClick={() => handleEdit(category)}
                          className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
                {selectedCategory ? "Edit Category" : "Add Category"}
              </h2>
            </div>
            <form onSubmit={handleAddEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Category Name</label>
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  {selectedCategory ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
