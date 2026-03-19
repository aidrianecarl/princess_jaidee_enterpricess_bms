import { apiClient } from './api-client'

export const authApi = {
  clientLogin: (email: string, password: string) =>
    apiClient.client().post('/auth/login', { email, password }),

  clientSignup: (data: any) =>
    apiClient.client().post('/auth/signup', data),

  adminLogin: (email: string, password: string) =>
    apiClient.admin().post('/auth/admin-login', { email, password }),

  logout: () =>
    apiClient.client().post('/auth/logout'),

  adminLogout: () =>
    apiClient.admin().post('/auth/logout'),
}

export const productsApi = {
  getAll: (page = 1, search = '', category = '') =>
    apiClient.admin().get('/products', { params: { page, search, category } }),

  getById: (id: number) =>
    apiClient.admin().get(`/products/${id}`),

  create: (data: any) =>
    apiClient.admin().post('/products', data),

  update: (id: number, data: any) =>
    apiClient.admin().put(`/products/${id}`, data),

  delete: (id: number) =>
    apiClient.admin().delete(`/products/${id}`),

  getCategories: () =>
    apiClient.admin().get('/categories'),

  getColors: () =>
    apiClient.admin().get('/colors'),

  getSizes: () =>
    apiClient.admin().get('/sizes'),
}

export const servicesApi = {
  getAll: (page = 1, search = '') =>
    apiClient.admin().get('/services', { params: { page, search } }),

  getById: (id: number) =>
    apiClient.admin().get(`/services/${id}`),

  create: (data: any) =>
    apiClient.admin().post('/services', data),

  update: (id: number, data: any) =>
    apiClient.admin().put(`/services/${id}`, data),

  delete: (id: number) =>
    apiClient.admin().delete(`/services/${id}`),
}

export const usersApi = {
  getCurrentUser: () =>
    apiClient.client().get('/users/me'),

  getById: (id: number) =>
    apiClient.client().get(`/users/${id}`),

  update: (id: number, data: any) =>
    apiClient.client().put(`/users/${id}`, data),
}

export const quotationsApi = {
  getAll: (page = 1, status = '') =>
    apiClient.client().get('/quotations', { params: { page, status } }),

  getById: (id: number) =>
    apiClient.client().get(`/quotations/${id}`),

  create: (data: any) =>
    apiClient.client().post('/quotations', data),

  update: (id: number, data: any) =>
    apiClient.client().put(`/quotations/${id}`, data),

  getNextQuotationNumber: () =>
    apiClient.client().get('/quotations/next-number'),

  getProducts: () =>
    apiClient.client().get('/products/list'),

  getServices: () =>
    apiClient.client().get('/services/list'),

  adminGetAll: (page = 1, status = '', search = '') =>
    apiClient.admin().get('/admin/quotations', { params: { page, status, search } }),

  adminShow: (id: number) =>
    apiClient.admin().get(`/admin/quotations/${id}`),

  adminScheduleSend: (id: number, scheduledDate: string) =>
    apiClient.admin().post(`/quotations/${id}/schedule-send`, { scheduled_date: scheduledDate }),

  adminUpdateStatus: (id: number, status: string) =>
    apiClient.admin().put(`/admin/quotations/${id}/status`, { status }),

  adminDestroy: (id: number) =>
    apiClient.admin().delete(`/admin/quotations/${id}`),
}

export const ordersApi = {
  getAll: (page = 1, status = '', search = '') =>
    apiClient.admin().get('/orders', { params: { page, status, search } }),

  getById: (id: number) =>
    apiClient.admin().get(`/orders/${id}`),

  create: (data: any) =>
    apiClient.admin().post('/orders', data),

  update: (id: number, data: any) =>
    apiClient.admin().put(`/orders/${id}`, data),

  updateStatus: (id: number, status: string) =>
    apiClient.admin().put(`/orders/${id}/status`, { status }),

  delete: (id: number) =>
    apiClient.admin().delete(`/orders/${id}`),
}

export const jobOrdersApi = {
  getAll: (page = 1, status = '', search = '') =>
    apiClient.admin().get('/job-orders', { params: { page, status, search } }),

  getById: (id: number) =>
    apiClient.admin().get(`/job-orders/${id}`),

  create: (data: any) =>
    apiClient.admin().post('/job-orders', data),

  update: (id: number, data: any) =>
    apiClient.admin().put(`/job-orders/${id}`, data),

  updateStatus: (id: number, status: string) =>
    apiClient.admin().put(`/job-orders/${id}/status`, { status }),

  assignDesigner: (id: number, designerId: number) =>
    apiClient.admin().post(`/job-orders/${id}/assign`, { designer_id: designerId }),
}

export const dashboardApi = {
  getStats: () =>
    apiClient.admin().get('/dashboard/stats'),

  getRecentOrders: () =>
    apiClient.admin().get('/dashboard/recent-orders'),

  getSalesTrend: (days = 30) =>
    apiClient.admin().get('/dashboard/sales-trend', { params: { days } }),

  getTopProducts: () =>
    apiClient.admin().get('/dashboard/top-products'),
}

export const membersApi = {
  getAll: (page = 1, search = '') =>
    apiClient.admin().get('/members', { params: { page, search } }),

  getById: (id: number) =>
    apiClient.admin().get(`/members/${id}`),

  create: (data: any) =>
    apiClient.admin().post('/members', data),

  update: (id: number, data: any) =>
    apiClient.admin().put(`/members/${id}`, data),

  delete: (id: number) =>
    apiClient.admin().delete(`/members/${id}`),
}

export const branchesApi = {
  getAll: () =>
    apiClient.admin().get('/branches'),

  getById: (id: number) =>
    apiClient.admin().get(`/branches/${id}`),

  create: (data: any) =>
    apiClient.admin().post('/branches', data),

  update: (id: number, data: any) =>
    apiClient.admin().put(`/branches/${id}`, data),

  delete: (id: number) =>
    apiClient.admin().delete(`/branches/${id}`),
}

export const rolesApi = {
  getAll: () =>
    apiClient.admin().get('/roles'),

  getPermissions: () =>
    apiClient.admin().get('/permissions'),

  assignRoleToUser: (userId: number, roleId: number) =>
    apiClient.admin().post(`/users/${userId}/roles`, { role_id: roleId }),
}
