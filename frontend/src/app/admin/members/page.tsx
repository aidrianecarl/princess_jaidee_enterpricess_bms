"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useRouter } from "next/navigation"
import { Plus, Edit2, Trash2, Mail, Phone, ToggleLeft as Toggle2, Users, Eye, EyeOff } from 'lucide-react'
import { apiClient } from "@/lib/api-client"

interface Member {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  address?: string
  status: string
  user_type: string
  branch_id?: number
  created_at: string
}

interface Branch {
  id: number
  name: string
  location?: string
  status: string
}

interface Role {
  id: number
  name: string
  description?: string
}

export default function MembersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)
  
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
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    password: "",
    user_type: "employee",
    status: "active",
    branch_id: "",
    role_id: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [usersRes, branchesRes, rolesRes] = await Promise.all([
        apiClient.get("/admin/users"),
        apiClient.get("/admin/branches"),
        apiClient.get("/admin/roles"),
      ])
      // Filter to only show employees
      const employees = (usersRes.data.data || []).filter((user: Member) => user.user_type === "employee")
      setMembers(employees)
      setBranches(branchesRes.data.data || [])
      setRoles(rolesRes.data.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMembers = () => {
    fetchData()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isEditMode && selectedMember) {
        await apiClient.put(`/admin/users/${selectedMember.id}`, formData)
      } else {
        await apiClient.post("/admin/users", formData)
      }

      setIsAddModalOpen(false)
      resetForm()
      fetchMembers()
    } catch (error) {
      console.error("Error saving member:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this member?")) {
      try {
        await apiClient.delete(`/admin/users/${id}`)
        fetchMembers()
      } catch (error) {
        console.error("Error deleting member:", error)
      }
    }
  }

  const handleToggleStatus = async (member: Member) => {
    try {
      const newStatus = member.status === "active" ? "inactive" : "active"
      await apiClient.put(`/admin/users/${member.id}`, { status: newStatus })
      fetchMembers()
    } catch (error) {
      console.error("Error toggling status:", error)
    }
  }

  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone_number: member.phone_number || "",
      address: member.address || "",
      password: "",
      user_type: member.user_type,
      status: member.status,
      branch_id: member.branch_id?.toString() || "",
      role_id: "",
    })
    setIsEditMode(true)
    setIsAddModalOpen(true)
  }

  const resetForm = () => {
    setIsAddModalOpen(false)
    setIsEditMode(false)
    setSelectedMember(null)
    setShowPassword(false)
    setShowEditPassword(false)
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      address: "",
      password: "",
      user_type: "employee",
      status: "active",
      branch_id: "",
      role_id: "",
    })
  }

  return (
    <div className="flex h-screen flex-col  bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Members
              </h1>
              <p className="text-neutral-600">Manage customer and member accounts</p>
            </div>
            <button
              onClick={() => {
                setIsEditMode(false)
                setShowPassword(false)
                setIsAddModalOpen(true)
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <Plus size={20} />
              Add Member
            </button>
          </div>

          {/* Members Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 animate-pulse"
                >
                  <div className="flex gap-3 mb-4">
                    <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-16">
              <Users size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
              <p className="text-neutral-600 dark:text-neutral-300 font-medium mb-4">No members yet</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold"
              >
                Add your first member
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-xl hover:border-red-200 dark:hover:border-red-700 transition-all duration-300 overflow-hidden group"
                >
                  {/* Card header */}
                  <div className="bg-gradient-to-r from-red-50 dark:from-red-950/40 to-orange-50 dark:to-orange-950/40 p-6 border-b border-red-100/50 dark:border-red-900/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg">
                            {member.first_name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {member.first_name} {member.last_name}
                          </h3>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">{member.user_type}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          member.status === "active"
                            ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                            : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {member.status}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail size={16} className="text-red-500 flex-shrink-0" />
                        <span className="text-neutral-700 dark:text-neutral-300 truncate">{member.email}</span>
                      </div>
                      {member.phone_number && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone size={16} className="text-red-500 flex-shrink-0" />
                          <span className="text-neutral-700 dark:text-neutral-300">{member.phone_number}</span>
                        </div>
                      )}
                      {member.address && (
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          <span className="font-semibold">Address:</span> {member.address}
                        </div>
                      )}
                      {member.branch_id && formData.user_type === "employee" && (
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          <span className="font-semibold">Branch:</span> {branches.find(b => b.id === member.branch_id)?.name || 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card footer with actions */}
                  <div className="bg-neutral-50 dark:bg-neutral-700/50 border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-2">
                    <button
                      onClick={() => handleToggleStatus(member)}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                        member.status === "active"
                          ? "bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400"
                          : "bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400"
                      }`}
                    >
                      <Toggle2 size={16} />
                      {member.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-medium rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
                <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6 flex items-center justify-between sticky top-0">
                  <h2 className="text-2xl font-bold text-white">
                    {isEditMode ? "Edit Member" : "Add New Member"}
                  </h2>
                  <button onClick={resetForm} className="text-white hover:bg-white/20 p-2 rounded-lg transition">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 dark:bg-neutral-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-800 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        User Type *
                      </label>
                      <select
                        value={formData.user_type}
                        onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-800 dark:text-white"
                        required
                      >
                        <option value="">Select User Type</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                        <option value="client">Client</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-800 dark:text-white"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    {formData.user_type === "employee" && (
                      <div>
                        <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                          Branch *
                        </label>
                        <select
                          value={formData.branch_id}
                          onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-800 dark:text-white"
                          required={formData.user_type === "employee"}
                        >
                          <option value="">Select Branch</option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        Role
                      </label>
                      <select
                        value={formData.role_id}
                        onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-800 dark:text-white"
                      >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {!isEditMode && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 pr-12 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-800 dark:text-white"
                            required={!isEditMode}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    )}
                    {isEditMode && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                          New Password (leave empty to keep current)
                        </label>
                        <div className="relative">
                          <input
                            type={showEditPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 pr-12 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-800 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowEditPassword(!showEditPassword)}
                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                          >
                            {showEditPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-semibold rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-700 transition"
                    >
                      {isEditMode ? "Update Member" : "Create Member"}
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
