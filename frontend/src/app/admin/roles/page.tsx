"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Plus, Edit2, Trash2, Lock, Shield, Check, X } from 'lucide-react'
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { SIDEBAR_MENU_ITEMS } from "@/lib/rbac-helper"

interface Role {
  id: number
  name: string
  description?: string
  permissions?: any[]
  created_at: string
}

interface Permission {
  id: number
  name: string
  description?: string
  module?: string
}

// Map permissions to sidebar menu items for display
const PERMISSION_TO_MENU_ITEM: Record<string, string> = {}
SIDEBAR_MENU_ITEMS.forEach(item => {
  item.permissions.forEach(perm => {
    PERMISSION_TO_MENU_ITEM[perm] = item.label
  })
})

export default function RolesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
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
  }

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as number[],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [rolesRes, permRes] = await Promise.all([
        apiClient.get("/admin/roles"),
        apiClient.get("/admin/permissions"),
      ])

      setRoles(rolesRes.data.data || [])
      setPermissions(permRes.data.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isEditMode && selectedRole) {
        await apiClient.put(`/admin/roles/${selectedRole.id}`, formData)
      } else {
        await apiClient.post("/admin/roles", formData)
      }

      setIsAddModalOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error saving role:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this role?")) {
      try {
        await apiClient.delete(`/admin/roles/${id}`)
        fetchData()
      } catch (error) {
        console.error("Error deleting role:", error)
      }
    }
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions?.map((p) => p.id) || [],
    })
    setIsEditMode(true)
    setIsAddModalOpen(true)
  }

  const resetForm = () => {
    setIsAddModalOpen(false)
    setIsEditMode(false)
    setSelectedRole(null)
    setFormData({
      name: "",
      description: "",
      permissions: [],
    })
  }

  const togglePermission = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const getMenuItemPermissions = () => {
    // Get all unique permissions by menu item
    const itemPermissions: Record<string, { icon: string; permissions: any[] }> = {}
    
    SIDEBAR_MENU_ITEMS.forEach(item => {
      const itemPerms = item.permissions.length === 0 
        ? [] 
        : permissions.filter(p => item.permissions.includes(p.name))
      
      if (itemPerms.length > 0 || item.permissions.length === 0) {
        itemPermissions[item.id] = {
          icon: item.icon,
          permissions: itemPerms
        }
      }
    })
    
    return itemPermissions
  }

  const getSelectedPermissionsText = () => {
    const selectedPerms = permissions.filter(p => formData.permissions.includes(p.id))
    const menuItems = new Set<string>()
    
    selectedPerms.forEach(p => {
      SIDEBAR_MENU_ITEMS.forEach(item => {
        if (item.permissions.includes(p.name)) {
          menuItems.add(item.label)
        }
      })
    })
    
    return Array.from(menuItems).join(', ') || 'No access selected'
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
                Roles & Permissions
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">Manage user roles and access control</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <Plus size={20} />
              Add Role
            </button>
          </div>

          {/* Roles Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 animate-pulse"
                >
                  <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-16">
              <Shield size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
              <p className="text-neutral-600 dark:text-neutral-300 font-medium mb-4">No roles yet</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold"
              >
                Create your first role
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-xl hover:border-red-200 dark:hover:border-red-700 transition-all duration-300 overflow-hidden group"
                >
                  <div className="bg-gradient-to-r from-red-50 dark:from-red-950/40 to-orange-50 dark:to-orange-950/40 p-6 border-b border-red-100/50 dark:border-red-900/50">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                        <Lock size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {role.name}
                        </h3>
                        {role.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{role.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {role.permissions && role.permissions.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Can Access:</p>
                        <div className="space-y-2">
                          {role.permissions.slice(0, 3).map((perm) => {
                            const menuItem = SIDEBAR_MENU_ITEMS.find(item => item.permissions.includes(perm.name))
                            const displayName = menuItem ? menuItem.label : perm.name
                            
                            return (
                              <span
                                key={perm.id}
                                className="block px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg border border-green-200 dark:border-green-800"
                              >
                                ✓ {displayName}
                              </span>
                            )
                          })}
                          {role.permissions.length > 3 && (
                            <span className="block px-3 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded-lg">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">No access assigned</p>
                    )}
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-700/50 border-t border-neutral-200 dark:border-neutral-700 p-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(role)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-medium rounded-lg transition-colors"
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
              <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
                <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6 flex items-center justify-between sticky top-0">
                  <h2 className="text-2xl font-bold text-white">
                    {isEditMode ? "Edit Role" : "Add New Role"}
                  </h2>
                  <button onClick={resetForm} className="text-white hover:bg-white/20 p-2 rounded-lg transition">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 dark:bg-neutral-800">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-neutral-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-red-500 focus:outline-none resize-none dark:bg-neutral-700 dark:text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-4">
                      Can Access
                    </label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">Select which admin sections this role can access:</p>
                    <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-700">
                      {SIDEBAR_MENU_ITEMS.filter(item => item.permissions.length > 0).map((menuItem) => {
                        const itemPerms = permissions.filter(p => menuItem.permissions.includes(p.name))
                        if (itemPerms.length === 0) return null

                        const mainPerm = itemPerms[0] // Get the first permission for this menu item
                        const isChecked = formData.permissions.includes(mainPerm.id)

                        return (
                          <div key={menuItem.id} className="border border-neutral-300 dark:border-neutral-600 rounded-lg p-4 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(mainPerm.id)}
                                className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-red-600 focus:ring-red-500 cursor-pointer dark:bg-neutral-700"
                              />
                              <div className="flex-1">
                                <div className="font-semibold text-neutral-900 dark:text-white">{menuItem.label}</div>
                                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Can access {menuItem.label.toLowerCase()} section</div>
                              </div>
                              {isChecked && <Check size={20} className="text-green-600 dark:text-green-400" />}
                            </label>
                          </div>
                        )
                      })}
                    </div>
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
                      {isEditMode ? "Update Role" : "Create Role"}
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
