"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useRouter } from "next/navigation"

interface Color {
  id: number
  name: string
  hex_code?: string
  created_at: string
}

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)

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
    hex_code: "#000000",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    fetchColors()
  }, [])

  const fetchColors = async () => {
    try {
      setIsLoading(true)
      setError("")
      const res = await apiClient.get("/admin/colors")
      const data = Array.isArray(res.data) ? res.data : res.data.data || []
      setColors(data)
    } catch (error) {
      console.error("[v0] Failed to fetch colors:", error)
      setError("Failed to load colors")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError("")
      if (selectedColor) {
        await apiClient.put(`/admin/colors/${selectedColor.id}`, formData)
      } else {
        await apiClient.post("/admin/colors", formData)
      }
      resetForm()
      fetchColors()
    } catch (error) {
      console.error("Failed to save color:", error)
      setError("Failed to save color")
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this color?")) {
      try {
        await apiClient.delete(`/admin/colors/${id}`)
        fetchColors()
      } catch (error) {
        console.error("Failed to delete color:", error)
        setError("Failed to delete color")
      }
    }
  }

  const handleEdit = (color: Color) => {
    setSelectedColor(color)
    setFormData({
      name: color.name,
      hex_code: color.hex_code || "#000000",
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setSelectedColor(null)
    setFormData({ name: "", hex_code: "#000000" })
    setShowModal(false)
    setError("")
  }

  const filteredColors = colors.filter((color) => color.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
                    Product Colors
                  </h1>
                  <p className="text-neutral-600">Manage available colors</p>
                </div>
                <button
                  onClick={() => {
                    resetForm()
                    setShowModal(true)
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  <Plus size={20} />
                  Add Color
                </button>
              </div>

              {/* Error Message */}
              {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

              {/* Search */}
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 text-neutral-400" size={20} />
                <input
                  type="text"
                  placeholder="Search colors..."
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
              ) : filteredColors.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500">No colors found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredColors.map((color) => (
                    <div
                      key={color.id}
                      className="bg-white rounded-lg border border-red-200 overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="h-24 w-full" style={{ backgroundColor: color.hex_code || "#cccccc" }} />
                      <div className="p-4">
                        <h3 className="font-semibold text-neutral-900 mb-1">{color.name}</h3>
                        <p className="text-sm text-neutral-500 mb-3 font-mono">{color.hex_code}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(color)}
                            className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(color.id)}
                            className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
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
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-red-200">
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                {selectedColor ? "Edit Color" : "Add Color"}
              </h2>
            </div>
            <form onSubmit={handleAddEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Color Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Hex Code</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.hex_code}
                    onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                    className="w-12 h-10 border border-red-200 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.hex_code}
                    onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                    className="flex-1 px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="#000000"
                  />
                </div>
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
                  {selectedColor ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
