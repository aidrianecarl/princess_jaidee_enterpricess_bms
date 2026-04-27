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

        if (!token || !userData) {
          setPermissions([])
          setRoles([])
          setIsLoading(false)
          return
        }

        const user = JSON.parse(userData)
        
        // Fetch user's role and permissions from backend
        const response = await apiClient.get(`/admin/users/${user.id}/permissions`)
        
        if (response.data.data) {
          const userType = response.data.data.user_type
          
          // Set permissions from API - only admins get all permissions
          setPermissions(response.data.data.permissions || [])
          
          // Set roles from API
          setRoles(response.data.data.roles || [])
        }
      } catch (err) {
        console.error('[v0] usePermissions: Error fetching permissions:', err)
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch permissions'
        setError(errorMsg)
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
