'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Loader2, AlertCircle, Package } from 'lucide-react'

interface JobOrder {
  id: number
  job_order_number: string
  quotation_id: number
  order_id: number
  customer_id: number
  assigned_to: number
  start_date: string
  due_date: string
  status: 'pending' | 'ongoing' | 'completed'
  priority: 'low' | 'medium' | 'high'
  notes?: string
  customer?: {
    id: number
    bill_to_name: string
    bill_to_email: string
    bill_to_phone?: string
  }
  assigned_to?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
}

export default function JobOrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [error, setError] = useState('')
  const router = useRouter()

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchJobOrders(token)
  }, [])

  const fetchJobOrders = async (token: string) => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(`${apiUrl}/admin/job-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch job orders')
      }

      const data = await response.json()
      const jobOrders = Array.isArray(data) ? data : data.data || []
      setJobOrders(jobOrders)
    } catch (err) {
      console.error('[v0] Error fetching job orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to load job orders')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'ongoing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      default:
        return 'bg-neutral-100 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
      default:
        return 'bg-neutral-50 dark:bg-neutral-900/20 text-neutral-700 dark:text-neutral-400'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Job Orders</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                View and manage all job orders
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Card className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-400">Error</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Loading State */}
            {isLoading ? (
              <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <Loader2 size={32} className="animate-spin text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">Loading job orders...</p>
              </Card>
            ) : jobOrders.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <Package size={32} className="text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">No job orders found</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:gap-6">
                {jobOrders.map((jobOrder) => (
                  <Card
                    key={jobOrder.id}
                    className="overflow-hidden bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition"
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Left Section */}
                        <div className="flex-1">
                          {/* Title and Status */}
                          <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <h3 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
                              {jobOrder.job_order_number}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${getStatusColor(jobOrder.status)}`}>
                              {jobOrder.status.charAt(0).toUpperCase() + jobOrder.status.slice(1)}
                            </span>
                            {jobOrder.priority && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(jobOrder.priority)}`}>
                                {jobOrder.priority.toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Customer and Assignment Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide">Customer</p>
                              <p className="text-sm md:text-base font-semibold text-neutral-900 dark:text-white mt-1">
                                {jobOrder.customer?.bill_to_name || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide">Assigned To</p>
                              <p className="text-sm md:text-base font-semibold text-neutral-900 dark:text-white mt-1">
                                {jobOrder.assigned_to 
                                  ? `${jobOrder.assigned_to.first_name} ${jobOrder.assigned_to.last_name}`
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Dates and Contact Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-xs">
                              <p className="text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide">Start Date</p>
                              <p className="font-semibold text-neutral-900 dark:text-white mt-1">
                                {formatDate(jobOrder.start_date)}
                              </p>
                            </div>
                            <div className="text-xs">
                              <p className="text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide">Due Date</p>
                              <p className="font-semibold text-neutral-900 dark:text-white mt-1">
                                {formatDate(jobOrder.due_date)}
                              </p>
                            </div>
                            <div className="text-xs">
                              <p className="text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide">Email</p>
                              <p className="font-semibold text-neutral-900 dark:text-white mt-1 break-all text-xs">
                                {jobOrder.customer?.bill_to_email || 'N/A'}
                              </p>
                            </div>
                            <div className="text-xs">
                              <p className="text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide">Phone</p>
                              <p className="font-semibold text-neutral-900 dark:text-white mt-1">
                                {jobOrder.customer?.bill_to_phone || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Button */}
                        <Button
                          onClick={() => router.push(`/admin/job-orders/${jobOrder.id}/orders`)}
                          className="bg-orange-500 hover:bg-orange-600 text-white w-full md:w-auto mt-4 md:mt-0"
                        >
                          View Orders
                          <ArrowRight size={18} className="ml-2" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
