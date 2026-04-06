'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Loader2, AlertCircle, Package, CheckCircle, Clock } from 'lucide-react'

interface OrderItem {
  id: number
  order_id: number
  service_id?: number
  quantity: number
  unit_price: string | number
  status?: 'pending' | 'ongoing' | 'completed'
}

interface Order {
  id: number
  order_number: string
  order_date: string
  total: number
  items?: OrderItem[]
}

interface JobOrder {
  id: number
  job_order_number: string
  order_id: number
  status: string
}

export default function JobOrderDetailPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [jobOrder, setJobOrder] = useState<JobOrder | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)
  const router = useRouter()
  const params = useParams()
  const jobOrderId = params.jobOrderId

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchData(token)
  }, [])

  const fetchData = async (token: string) => {
    try {
      setIsLoading(true)
      setError('')

      // Fetch job order
      const jobOrderResponse = await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!jobOrderResponse.ok) {
        throw new Error('Job order not found')
      }

      const jobOrderData = await jobOrderResponse.json()
      const jobOrder = jobOrderData.data || jobOrderData
      setJobOrder(jobOrder)

      // Fetch order details if order_id exists
      if (jobOrder?.order_id) {
        const orderResponse = await fetch(`${apiUrl}/orders/${jobOrder.order_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (orderResponse.ok) {
          const orderData = await orderResponse.json()
          const order = orderData.data || orderData
          setOrder(order)
        }
      }
    } catch (err) {
      console.error('[v0] Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateItemStatus = async (itemId: number, newStatus: 'pending' | 'ongoing' | 'completed') => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      setUpdatingItemId(itemId)

      const response = await fetch(`${apiUrl}/order-items/${itemId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update item status')
      }

      // Update local state
      setOrder((prevOrder) => {
        if (!prevOrder?.items) return prevOrder
        return {
          ...prevOrder,
          items: prevOrder.items.map((item) =>
            item.id === itemId ? { ...item, status: newStatus } : item
          ),
        }
      })
    } catch (err) {
      console.error('[v0] Error updating item status:', err)
      alert('Failed to update item status')
    } finally {
      setUpdatingItemId(null)
    }
  }

  const formatCurrency = (value: number | string | null | undefined) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (!num || isNaN(Number(num))) return '₱0.00'

    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(num))
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="flex">
          <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
          <main className="flex-1 flex items-center justify-center p-4">
            <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <Loader2 size={32} className="animate-spin text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">Loading...</p>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="flex">
          <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-6 transition"
              >
                <ArrowLeft size={20} />
                Back
              </button>

              <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-400">Error</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-6 transition font-medium"
            >
              <ArrowLeft size={20} />
              Back to Job Orders
            </button>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                {jobOrder?.job_order_number}
              </h1>
              {order && (
                <p className="text-neutral-600 dark:text-neutral-400">
                  Order #{order.order_number}
                </p>
              )}
            </div>

            {/* Order Summary Card */}
            {order && (
              <Card className="p-6 mb-8 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide mb-2">Order Number</p>
                    <p className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide mb-2">Order Date</p>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-white">{formatDate(order.order_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide mb-2">Total Amount</p>
                    <p className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Order Items */}
            {order?.items && order.items.length > 0 ? (
              <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Order Items</h2>
                </div>
                <div className="space-y-4 p-6">
                  {order.items.map((item) => (
                    <Card
                      key={item.id}
                      className="p-4 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition"
                    >
                      {/* Item Info */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-neutral-900 dark:text-white text-lg mb-2">
                          Item #{item.id}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Quantity: {item.quantity} | Unit Price: {formatCurrency(item.unit_price)} | Total: {formatCurrency(Number(item.unit_price) * item.quantity)}
                        </p>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleUpdateItemStatus(item.id, 'pending')}
                          disabled={updatingItemId === item.id}
                          variant="outline"
                          size="sm"
                          className={`flex items-center gap-2 ${
                            item.status === 'pending'
                              ? 'border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'border-neutral-300 dark:border-neutral-600 hover:border-yellow-400 dark:hover:border-yellow-600'
                          }`}
                        >
                          <Clock size={16} />
                          Pending
                        </Button>
                        <Button
                          onClick={() => handleUpdateItemStatus(item.id, 'ongoing')}
                          disabled={updatingItemId === item.id}
                          variant="outline"
                          size="sm"
                          className={`flex items-center gap-2 ${
                            item.status === 'ongoing'
                              ? 'border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-neutral-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-600'
                          }`}
                        >
                          <Loader2 size={16} />
                          Ongoing
                        </Button>
                        <Button
                          onClick={() => handleUpdateItemStatus(item.id, 'completed')}
                          disabled={updatingItemId === item.id}
                          variant="outline"
                          size="sm"
                          className={`flex items-center gap-2 ${
                            item.status === 'completed'
                              ? 'border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                              : 'border-neutral-300 dark:border-neutral-600 hover:border-green-400 dark:hover:border-green-600'
                          }`}
                        >
                          <CheckCircle size={16} />
                          Completed
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <Package size={32} className="text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">No order items found</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
