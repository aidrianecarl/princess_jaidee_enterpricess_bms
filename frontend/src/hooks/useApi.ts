import { useState, useCallback, useEffect } from 'react'

interface UseApiOptions {
  autoFetch?: boolean
  dependencies?: any[]
}

interface ApiResponse<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApi<T>(
  apiCall: () => Promise<any>,
  options: UseApiOptions = {}
): ApiResponse<T> {
  const { autoFetch = false, dependencies = [] } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall()
      setData(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, dependencies)

  return { data, loading, error, refetch: fetchData }
}
