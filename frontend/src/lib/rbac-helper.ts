// RBAC Helper for admin sidebar menu items and permissions mapping
// This maps sidebar menu items to required permissions for role-based access control

export const SIDEBAR_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin/dashboard',
    permissions: [], // Dashboard visible to all admins
    icon: 'LayoutDashboard'
  },
  {
    id: 'branches',
    label: 'Branches',
    href: '/admin/branches',
    permissions: ['manage_branches'],
    icon: 'MapPin'
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    href: '/admin/roles',
    permissions: ['manage_roles'],
    icon: 'Lock'
  },
  {
    id: 'members',
    label: 'Members',
    href: '/admin/members',
    permissions: ['view_users', 'create_users', 'edit_users', 'delete_users'],
    icon: 'Users'
  },
  {
    id: 'services',
    label: 'Services',
    href: '/admin/services',
    permissions: ['view_services', 'create_services', 'edit_services', 'delete_services'],
    icon: 'Briefcase'
  },
  {
    id: 'quotations',
    label: 'Quotations',
    href: '/admin/quotations',
    permissions: ['view_quotations', 'create_quotations', 'edit_quotations', 'approve_quotations'],
    icon: 'ShoppingCart'
  },
  {
    id: 'orders',
    label: 'Sales/Orders',
    href: '/admin/orders',
    permissions: ['view_orders', 'create_orders', 'edit_orders', 'manage_payments'],
    icon: 'Layers'
  },
  {
    id: 'job_orders',
    label: 'Job Orders',
    href: '/admin/job-orders',
    permissions: ['view_job_orders', 'create_job_orders', 'edit_job_orders'],
    icon: 'LayoutDashboard'
  },
]

/**
 * Check if a user has permission for a specific menu item
 * @param userPermissions - Array of permission names the user has
 * @param requiredPermissions - Array of permission names required for access
 * @returns true if user has ANY of the required permissions (OR logic)
 */
export const hasMenuPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  // Empty required permissions means always visible (e.g., dashboard)
  if (requiredPermissions.length === 0) return true
  
  // User must have at least one of the required permissions
  return requiredPermissions.some(perm => userPermissions.includes(perm))
}

/**
 * Get filtered menu items based on user permissions
 * @param userPermissions - Array of permission names the user has
 * @returns Array of menu items the user can access
 */
export const getAccessibleMenuItems = (userPermissions: string[]) => {
  return SIDEBAR_MENU_ITEMS.filter(item => 
    hasMenuPermission(userPermissions, item.permissions)
  )
}

/**
 * Check if user has permission to access a specific page
 * @param pagePath - The admin page path (e.g., '/admin/quotations')
 * @param userPermissions - Array of permission names the user has
 * @returns true if user can access the page
 */
export const canAccessPage = (pagePath: string, userPermissions: string[]): boolean => {
  const menuItem = SIDEBAR_MENU_ITEMS.find(item => item.href === pagePath)
  if (!menuItem) return false
  return hasMenuPermission(userPermissions, menuItem.permissions)
}

/**
 * Convert permission array to readable format for display
 * @param permissions - Array of permission names
 * @returns Readable string representation
 */
export const formatPermissionsForDisplay = (permissions: string[]): string => {
  const uniqueModules = new Set<string>()
  
  permissions.forEach(perm => {
    const menuItem = SIDEBAR_MENU_ITEMS.find(item => 
      item.permissions.includes(perm)
    )
    if (menuItem) {
      uniqueModules.add(menuItem.label)
    }
  })
  
  return Array.from(uniqueModules).join(', ') || 'No access'
}
