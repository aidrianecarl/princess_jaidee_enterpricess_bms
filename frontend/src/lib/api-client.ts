import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

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
        'Accept': 'application/json',
      },
      withCredentials: true,
    })

    this.adminInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
    })

    this.clientInstance.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.adminInstance.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.clientInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        }
        return Promise.reject(error)
      }
    )

    this.adminInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
          if (typeof window !== 'undefined') {
            window.location.href = '/admin'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  public get(url: string, config?: any) {
    return this.adminInstance.get(url, config)
  }

  public post(url: string, data?: any, config?: any) {
    return this.adminInstance.post(url, data, config)
  }

  public put(url: string, data?: any, config?: any) {
    return this.adminInstance.put(url, data, config)
  }

  public delete(url: string, config?: any) {
    return this.adminInstance.delete(url, config)
  }

  public client() {
    return this.clientInstance
  }

  public admin() {
    return this.adminInstance
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
    }
    return 'An error occurred. Please try again.'
  }
}

export const apiClient = new ApiClient()
