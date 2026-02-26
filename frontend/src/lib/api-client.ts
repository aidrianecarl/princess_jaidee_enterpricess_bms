import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.princessjaideeenterprises.com/api'

interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

class ApiClient {
  private clientInstance: AxiosInstance
  private adminInstance: AxiosInstance

  constructor() {
    this.clientInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true,
    })

    this.adminInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true,
    })

    // CLIENT REQUEST INTERCEPTOR
    this.clientInstance.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    })

    // ADMIN REQUEST INTERCEPTOR
    this.adminInstance.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('admin_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    })

    // CLIENT RESPONSE INTERCEPTOR
    this.clientInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        const status = error.response?.status

        if (status === 401 && typeof window !== 'undefined') {
          const hasToken = localStorage.getItem('auth_token')

          // Only redirect if user was already logged in
          if (hasToken) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            window.location.href = '/'
          }
        }

        return Promise.reject(error)
      }
    )

    // ADMIN RESPONSE INTERCEPTOR (FIXED)
    this.adminInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        const status = error.response?.status

        if (status === 401 && typeof window !== 'undefined') {
          const hasToken = localStorage.getItem('admin_token')

          // Only redirect if admin session expired
          if (hasToken) {
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_user')
            window.location.href = '/admin'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  public client() {
    return this.clientInstance
  }

  public admin() {
    return this.adminInstance
  }

  // Convenience methods for admin API calls
  public get(url: string, config?: any) {
    return this.adminInstance.get(url, config)
  }

  public post(url: string, data?: any, config?: any) {
    return this.adminInstance.post(url, data, config)
  }

  public put(url: string, data?: any, config?: any) {
    return this.adminInstance.put(url, data, config)
  }

  public patch(url: string, data?: any, config?: any) {
    return this.adminInstance.patch(url, data, config)
  }

  public delete(url: string, config?: any) {
    return this.adminInstance.delete(url, config)
  }

  public getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        return error.response.data.message
      }

      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors
        return Object.values(errors).flat().join(', ')
      }

      if (error.response?.data?.error) {
        return error.response.data.error
      }
    }

    return 'Login failed. Please try again.'
  }
}

export const apiClient = new ApiClient()
