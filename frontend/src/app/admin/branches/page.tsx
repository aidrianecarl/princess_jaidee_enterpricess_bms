"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Plus, Edit2, Trash2, Eye, MapPin, Phone, Mail } from 'lucide-react'
import { apiClient } from "@/lib/api-client"

interface Branch {
  id: number
  name: string
  location: string
  address: string
  zip_code: string
  phone_number: string
  email: string
  manager_id?: number
  is_main_branch: boolean
  status: string
  created_at: string
  updated_at: string
}

export default function BranchesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    address: "",
    zip_code: "",
    phone_number: "",
    email: "",
    is_main_branch: false,
  })

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get("/admin/branches")
      setBranches(response.data.data || [])
    } catch (error) {
      console.error("[v0] Error fetching branches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isEditMode && selectedBranch) {
        await apiClient.put(`/admin/branches/${selectedBranch.id}`, formData)
      } else {
        await apiClient.post("/admin/branches", formData)
      }

      setIsAddModalOpen(false)
      setFormData({
        name: "",
        location: "",
        address: "",
        zip_code: "",
        phone_number: "",
        email: "",
        is_main_branch: false,
      })
      setIsEditMode(false)
      setSelectedBranch(null)
      fetchBranches()
    } catch (error) {
      console.error("[v0] Error saving branch:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      try {
        await apiClient.delete(`/admin/branches/${id}`)
        fetchBranches()
      } catch (error) {
        console.error("[v0] Error deleting branch:", error)
      }
    }
  }

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch)
    setFormData({
      name: branch.name,
      location: branch.location,
      address: branch.address,
      zip_code: branch.zip_code,
      phone_number: branch.phone_number,
      email: branch.email,
      is_main_branch: branch.is_main_branch,
    })
    setIsEditMode(true)
    setIsAddModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAddModalOpen(false)
    setIsEditMode(false)
    setSelectedBranch(null)
    setFormData({
      name: "",
      location: "",
      address: "",
      zip_code: "",
      phone_number: "",
      email: "",
      is_main_branch: false,
    })
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={null} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto p-6 bg-neutral-50/50">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Branches
              </h1>
              <p className="text-neutral-600">Manage business branches and operations</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <Plus size={20} />
              Add Branch
            </button>
          </div>

          {/* Branches Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 animate-pulse"
                >
                  <div className="h-8 bg-neutral-200 rounded mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    <div className="h-4 bg-neutral-200 rounded" />
                    <div className="h-4 bg-neutral-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-16">
              <MapPin size={48} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-600 font-medium mb-4">No branches yet</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Create your first branch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white rounded-2xl shadow-sm border border-neutral-200 hover:shadow-xl hover:border-red-200 transition-all duration-300 overflow-hidden group"
                >
                  {/* Card header with badge */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-red-100/50">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-neutral-900 group-hover:text-red-600 transition-colors">
                        {branch.name}
                      </h3>
                      {branch.is_main_branch && (
                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-full">
                          Main
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600">{branch.location}</p>
                  </div>

                  {/* Card body */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin size={16} className="text-red-500 flex-shrink-0" />
                        <span className="text-neutral-700">{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone size={16} className="text-red-500 flex-shrink-0" />
                        <span className="text-neutral-700">{branch.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail size={16} className="text-red-500 flex-shrink-0" />
                        <span className="text-neutral-700">{branch.email || "N/A"}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
                      <p>
                        <span className="font-semibold text-neutral-900">ZIP Code:</span> {branch.zip_code}
                      </p>
                      <p>
                        <span className="font-semibold text-neutral-900">Status:</span>{" "}
                        <span
                          className={`px-2 py-1 rounded-full ${
                            branch.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {branch.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Card footer with actions */}
                  <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
                <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6 flex items-center justify-between sticky top-0">
                  <h2 className="text-2xl font-bold text-white">
                    {isEditMode ? "Edit Branch" : "Add New Branch"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        Branch Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-red-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-red-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-red-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={formData.zip_code}
                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-red-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-red-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="isMain"
                      checked={formData.is_main_branch}
                      onChange={(e) => setFormData({ ...formData, is_main_branch: e.target.checked })}
                      className="w-4 h-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="isMain" className="text-sm font-medium text-neutral-900">
                      Mark as Main Branch
                    </label>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-700 transition"
                    >
                      {isEditMode ? "Update Branch" : "Create Branch"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
