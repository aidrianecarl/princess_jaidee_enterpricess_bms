'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/header'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Loader2, AlertCircle, Package, CheckCircle, Clock, Zap } from 'lucide-react'

interface OrderItem {
  id: number
  order_id: number
  service_id?: number
  service?: {
    name: string
    description?: string
  }
  quantity: number
  unit_price: string | number
  status: 'pending' | 'ongoing' | 'completed'
}

interface Order {
  id: number
  order_number: string
  order_date: string
  total: number
  order_status: string
  items?: OrderItem[]
}

interface JobOrder {
  id: number
  job_order_number: string
  order_id: number
  status: string
  customer?: {
    bill_to_name: string
  }
}

export default function JobOrderDetailPage() {
  const [user, setUser] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [jobOrder, setJobOrder] = useState<JobOrder | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)
  const router = useRouter()
  const params = useParams()
  const jobOrderId = params.jobOrderId

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.princessjaideeenterprises.com/api'

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')

    if (!token || !userData) {
      router.push('/admin')
      return
    }
    setUser(JSON.parse(userData))
    fetchData(token)
  }

  const fetchData = async (token: string) => {
    try {
      setIsLoading(true)
      setError('')

      console.log('[v0] ========== FETCH DATA START ==========')
      console.log('[v0] API URL:', apiUrl)
      console.log('[v0] Job Order ID:', jobOrderId)
      console.log('[v0] Token available:', !!token)

      // Fetch job order
      console.log('[v0] Fetching job order from:', `${apiUrl}/admin/job-orders/${jobOrderId}`)
      
      const jobOrderResponse = await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('[v0] Job Order Response Status:', jobOrderResponse.status)
      console.log('[v0] Job Order Response OK:', jobOrderResponse.ok)

      if (!jobOrderResponse.ok) {
        const errorText = await jobOrderResponse.text()
        console.error('[v0] Job Order Error Response:', errorText)
        throw new Error(`Job order not found (${jobOrderResponse.status})`)
      }

      const jobOrderData = await jobOrderResponse.json()
      console.log('[v0] Job Order Response Data:', jobOrderData)
      
      const fetchedJobOrder = jobOrderData.data || jobOrderData
      setJobOrder(fetchedJobOrder)
      console.log('[v0] Fetched Job Order:', fetchedJobOrder)

      // Fetch order details if order_id exists
      if (fetchedJobOrder?.order_id) {
        console.log('[v0] ========== FETCHING ORDER ==========')
        console.log('[v0] Order ID to fetch:', fetchedJobOrder.order_id)
        console.log('[v0] Fetching order from:', `${apiUrl}/admin/orders/${fetchedJobOrder.order_id}`)
        
        const orderResponse = await fetch(`${apiUrl}/admin/orders/${fetchedJobOrder.order_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('[v0] Order Response Status:', orderResponse.status)
        console.log('[v0] Order Response OK:', orderResponse.ok)
        console.log('[v0] Order Response URL:', orderResponse.url)

        if (!orderResponse.ok) {
          const errorText = await orderResponse.text()
          console.error('[v0] Order Error Response Status:', orderResponse.status)
          console.error('[v0] Order Error Response Text:', errorText)
          throw new Error(`Failed to fetch order (${orderResponse.status}): ${errorText}`)
        }

        const orderData = await orderResponse.json()
        console.log('[v0] Order Response Data:', orderData)
        
        const fetchedOrder = orderData.data || orderData
        console.log('[v0] Fetched Order:', fetchedOrder)
        console.log('[v0] Order Items:', fetchedOrder?.items)
        
        setOrder(fetchedOrder)
      } else {
        console.warn('[v0] No order_id found in fetched job order')
      }
      
      console.log('[v0] ========== FETCH DATA END ==========')
    } catch (err) {
      console.error('[v0] ========== FETCH DATA ERROR ==========')
      console.error('[v0] Error:', err)
      console.error('[v0] Error Message:', err instanceof Error ? err.message : 'Unknown error')
      console.error('[v0] Error Stack:', err instanceof Error ? err.stack : 'N/A')
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

      const response = await fetch(`${apiUrl}/admin/order-items/${itemId}`, {
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
      const updatedOrder = { ...order } as Order
      if (updatedOrder.items) {
        updatedOrder.items = updatedOrder.items.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
        setOrder(updatedOrder)

        // Check if all items have the same status and update parent statuses
        const allStatuses = updatedOrder.items.map(item => item.status)
        const allOngoing = allStatuses.every(s => s === 'ongoing')
        const allCompleted = allStatuses.every(s => s === 'completed')

        let newJobOrderStatus = 'pending'
        let newOrderStatus = 'pending'

        if (allCompleted) {
          newJobOrderStatus = 'completed'
          newOrderStatus = 'completed'
        } else if (allOngoing) {
          newJobOrderStatus = 'in-progress'
          newOrderStatus = 'completed'
        }

        // Update Job Order status if all items are completed or ongoing
        if (allCompleted || allOngoing) {
          await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newJobOrderStatus }),
          })

          // Update Order status
          if (order.id) {
            await fetch(`${apiUrl}/admin/orders/${order.id}/status`, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: newOrderStatus }),
            })
          }

          // Update local state
          setJobOrder(prev => prev ? { ...prev, status: newJobOrderStatus } : null)
          setOrder(prev => prev ? { ...prev, order_status: newOrderStatus } : null)
        }
      }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'ongoing':
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      default:
        return 'bg-neutral-100 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-400'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (error || !jobOrder) {
    return (
      <div className="flex h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
        <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8">
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
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error || 'Job order not found'}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
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
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                    {jobOrder.job_order_number}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(jobOrder.status)}`}>
                    {getStatusLabel(jobOrder.status)}
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Order #{order?.order_number} • Customer: {jobOrder.customer?.bill_to_name || 'N/A'}
                </p>
              </div>

              {/* Summary Cards */}
              {order && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card className="p-6 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide mb-2">Order Number</p>
                    <p className="text-xl font-bold text-neutral-900 dark:text-white">{order.order_number}</p>
                  </Card>
                  <Card className="p-6 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide mb-2">Order Date</p>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-white">{formatDate(order.order_date)}</p>
                  </Card>
                  <Card className="p-6 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide mb-2">Total Amount</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(order.total)}</p>
                  </Card>
                </div>
              )}

              {/* Order Items */}
              {order?.items && order.items.length > 0 ? (
                <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
                    <div className="flex items-center gap-3">
                      <Zap size={24} className="text-orange-500" />
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Order Items</h2>
                      <span className="ml-auto text-sm text-neutral-600 dark:text-neutral-400">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4 p-6">
                    {order.items.map((item, index) => (
                      <Card
                        key={item.id}
                        className="p-6 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Item Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-xs font-semibold">
                                Item #{index + 1}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                {getStatusLabel(item.status)}
                              </span>
                            </div>
                            {item.service && (
                              <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                                {item.service.name}
                              </h4>
                            )}
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              Quantity: <span className="font-semibold">{item.quantity}</span> | 
                              Unit Price: <span className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(item.unit_price)}</span> | 
                              Total: <span className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(Number(item.unit_price) * item.quantity)}</span>
                            </p>
                          </div>

                          {/* Status Buttons */}
                          <div className="flex flex-wrap gap-2 md:flex-col">
                            <Button
                              onClick={() => handleUpdateItemStatus(item.id, 'pending')}
                              disabled={updatingItemId === item.id}
                              variant="outline"
                              size="sm"
                              className={`flex items-center gap-2 whitespace-nowrap ${
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
                              className={`flex items-center gap-2 whitespace-nowrap ${
                                item.status === 'ongoing'
                                  ? 'border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-neutral-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-600'
                              }`}
                            >
                              <Zap size={16} />
                              Ongoing
                            </Button>
                            <Button
                              onClick={() => handleUpdateItemStatus(item.id, 'completed')}
                              disabled={updatingItemId === item.id}
                              variant="outline"
                              size="sm"
                              className={`flex items-center gap-2 whitespace-nowrap ${
                                item.status === 'completed'
                                  ? 'border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                                  : 'border-neutral-300 dark:border-neutral-600 hover:border-green-400 dark:hover:border-green-600'
                              }`}
                            >
                              <CheckCircle size={16} />
                              Completed
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <Package size={40} className="text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400 font-medium text-lg">No order items found</p>
                </Card>
              )}

              {/* Info Box */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <span className="font-semibold">Pro Tip:</span> When all items have the same status, the Job Order and Order statuses will automatically update. All items completed = Job Order completed. All items ongoing = Job Order in-progress.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
