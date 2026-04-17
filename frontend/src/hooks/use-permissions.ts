'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface UserWithPermissions {
  id: number
  first_name: string
  last_name: string
  email: string
  permissions: string[]
  roles: Array<{ id: number; name: string }>
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([])
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('admin_token')
        const userData = localStorage.getItem('admin_user')

        console.log('[v0] usePermissions: Token exists:', !!token)
        console.log('[v0] usePermissions: User data exists:', !!userData)

        if (!token || !userData) {
          console.log('[v0] usePermissions: No token or user data, setting empty permissions')
          setPermissions([])
          setRoles([])
          setIsLoading(false)
          return
        }

        const user = JSON.parse(userData)
        console.log('[v0] usePermissions: Fetching permissions for user ID:', user.id)
        
        // Fetch user's role and permissions from backend
        const response = await apiClient.get(`/admin/users/${user.id}/permissions`)
        
        console.log('[v0] usePermissions: API Response:', response.data)
        
        if (response.data.data) {
          const userType = response.data.data.user_type
          console.log('[v0] usePermissions: User type:', userType)
          
          // Admins always get all permissions
          if (userType === 'admin') {
            const allPermissions = [
              'view_dashboard',
              'manage_branches',
              'manage_roles',
              'view_users',
              'create_users',
              'edit_users',
              'delete_users',
              'view_services',
              'create_services',
              'edit_services',
              'delete_services',
              'view_quotations',
              'create_quotations',
              'edit_quotations',
              'approve_quotations',
              'view_orders',
              'create_orders',
              'edit_orders',
              'manage_payments',
              'view_job_orders',
              'create_job_orders',
              'edit_job_orders',
            ]
            console.log('[v0] usePermissions: Admin user - setting all permissions')
            setPermissions(allPermissions)
          } else {
            console.log('[v0] usePermissions: Employee user - permissions from API:', response.data.data.permissions)
            setPermissions(response.data.data.permissions || [])
          }
          
          console.log('[v0] usePermissions: Roles from API:', response.data.data.roles)
          setRoles(response.data.data.roles || [])
        }
      } catch (err) {
        console.error('[v0] usePermissions: Error fetching permissions:', err)
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch permissions'
        setError(errorMsg)
        // Still set loading to false even on error
        setIsLoading(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserPermissions()
  }, [])

  const hasPermission = (permissionName: string): boolean => {
    return permissions.includes(permissionName)
  }

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(perm => permissions.includes(perm))
  }

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(perm => permissions.includes(perm))
  }

  const hasRole = (roleName: string): boolean => {
    return roles.some(role => role.name === roleName)
  }

  return {
    permissions,
    roles,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  }
}
