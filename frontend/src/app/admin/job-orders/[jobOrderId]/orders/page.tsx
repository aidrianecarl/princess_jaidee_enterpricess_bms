'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/header'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Loader2, AlertCircle, Package, CheckCircle, Clock, Zap, ZoomIn, X } from 'lucide-react'
import { getApiImageUrl } from '@/lib/api-urls'

interface TeamMember {
  id?: string
  name: string
  number: string | number
  sizeTop?: string
  sizeBottom?: string
}

interface SizeSpecifications {
  top?: string
  bottom?: string
  width?: number
  height?: number
  totalSqft?: number
  totalPrice?: number
  [key: string]: any
}

interface ItemNotes {
  designNotes?: string
  jerseyCustomizationNotes?: string
  teamRosterNotes?: string
  sizeNotes?: string
  additionalNotes?: string
  [key: string]: string | undefined
}

interface OrderItem {
  id: number
  order_id: number
  service_id?: number
  service?: {
    id: number
    name: string
    description?: string
    image_url?: string
  }
  quantity: number
  unit_price: string | number
  line_total?: string | number
  status: 'pending' | 'ongoing' | 'completed'
  design_file_url?: string
  notes?: any
  team_roster?: any
  size_specifications?: any
}

interface Order {
  id: number
  order_number: string
  order_date: string
  total: number
  order_status: string
  subtotal?: number
  discount?: number
  tax?: number
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
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
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

      const jobOrderResponse = await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!jobOrderResponse.ok) {
        throw new Error(`Job order not found (${jobOrderResponse.status})`)
      }

      const jobOrderData = await jobOrderResponse.json()
      const fetchedJobOrder = jobOrderData.data || jobOrderData
      setJobOrder(fetchedJobOrder)

      if (fetchedJobOrder?.order_id) {
        const orderResponse = await fetch(`${apiUrl}/admin/orders/${fetchedJobOrder.order_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!orderResponse.ok) {
          throw new Error(`Failed to fetch order (${orderResponse.status})`)
        }

        const orderData = await orderResponse.json()
        const fetchedOrder = orderData.data || orderData
        setOrder(fetchedOrder)
      }
    } catch (err) {
      console.error('[v0] Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItemExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const parseJSON = (value: any) => {
    if (!value) return null
    if (typeof value === 'object') return value
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch (e) {
        return null
      }
    }
    return null
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

      const updatedOrder = { ...order } as Order
      if (updatedOrder.items) {
        updatedOrder.items = updatedOrder.items.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
        setOrder(updatedOrder)

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

        if (allCompleted || allOngoing) {
          await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newJobOrderStatus }),
          })

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
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap size={24} className="text-orange-500" />
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Order Items</h2>
                    <span className="ml-auto text-sm text-neutral-600 dark:text-neutral-400">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {order.items.map((item) => {
                    const teamRoster = parseJSON(item.team_roster) as TeamMember[] | null
                    const sizeSpecs = parseJSON(item.size_specifications) as SizeSpecifications | null
                    const itemNotes = parseJSON(item.notes) as ItemNotes | null
                    const isExpanded = expandedItems.has(item.id)

                    return (
                      <div
                        key={item.id}
                        className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden hover:shadow-md transition"
                      >
                        {/* Item Header */}
                        <div
                          onClick={() => toggleItemExpanded(item.id)}
                          className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 cursor-pointer hover:bg-opacity-80 transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                  {item.service?.name || 'Service Item'}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                  {getStatusLabel(item.status)}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Qty: <span className="font-semibold">{item.quantity}</span> × {formatCurrency(item.unit_price)} = {formatCurrency(item.line_total || Number(item.unit_price) * item.quantity)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {formatCurrency(item.line_total || Number(item.unit_price) * item.quantity)}
                              </p>
                              <button className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition text-lg">
                                {isExpanded ? '▲' : '▼'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="p-6 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 space-y-6">
                            {/* Design Image */}
                            {item.design_file_url && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Design Preview</h4>
                                <div className="relative group">
                                  <img
                                    src={getApiImageUrl(item.design_file_url)}
                                    alt="Design Preview"
                                    className="w-full h-48 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-zoom-in bg-neutral-100 dark:bg-neutral-700"
                                    onClick={() => setExpandedImage(getApiImageUrl(item.design_file_url || null))}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = '/placeholder.svg?height=192&width=400'
                                      target.classList.add('opacity-50')
                                    }}
                                  />
                                  <button
                                    onClick={() => setExpandedImage(getApiImageUrl(item.design_file_url || null))}
                                    className="absolute top-2 right-2 p-2 bg-white dark:bg-neutral-800 rounded-full shadow-lg hover:shadow-xl transition opacity-0 group-hover:opacity-100"
                                  >
                                    <ZoomIn size={18} className="text-neutral-900 dark:text-white" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Team Roster */}
                            {teamRoster && teamRoster.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Team Roster</h4>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                  <div className="space-y-2">
                                    {teamRoster.map((player, idx) => (
                                      <div key={idx} className="flex items-center justify-between py-2 border-b border-blue-200 dark:border-blue-900/50 last:border-b-0">
                                        <div>
                                          <p className="font-medium text-neutral-900 dark:text-white">
                                            #{player.number} - {player.name}
                                          </p>
                                          {(player.sizeTop || player.sizeBottom) && (
                                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                              {player.sizeTop && `Top: ${player.sizeTop}`}
                                              {player.sizeTop && player.sizeBottom && ' • '}
                                              {player.sizeBottom && `Bottom: ${player.sizeBottom}`}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Size Specifications */}
                            {sizeSpecs && Object.keys(sizeSpecs).some(key => sizeSpecs[key as keyof SizeSpecifications]) && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Size Specifications</h4>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {sizeSpecs.top && (
                                      <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Top Size</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.top}</p>
                                      </div>
                                    )}
                                    {sizeSpecs.bottom && (
                                      <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Bottom Size</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.bottom}</p>
                                      </div>
                                    )}
                                    {sizeSpecs.width && (
                                      <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Width</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.width}</p>
                                      </div>
                                    )}
                                    {sizeSpecs.height && (
                                      <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Height</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.height}</p>
                                      </div>
                                    )}
                                    {sizeSpecs.totalSqft && (
                                      <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Sqft</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">{sizeSpecs.totalSqft}</p>
                                      </div>
                                    )}
                                    {sizeSpecs.totalPrice && (
                                      <div className="bg-white dark:bg-neutral-700 p-3 rounded">
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Price</p>
                                        <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(sizeSpecs.totalPrice)}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            {itemNotes && Object.values(itemNotes).some(v => v) && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Notes</h4>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3">
                                  {itemNotes.designNotes && (
                                    <div>
                                      <p className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-1">Design Notes</p>
                                      <p className="text-sm text-neutral-700 dark:text-neutral-300">{itemNotes.designNotes}</p>
                                    </div>
                                  )}
                                  {itemNotes.jerseyCustomizationNotes && (
                                    <div>
                                      <p className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-1">Jersey Customization</p>
                                      <p className="text-sm text-neutral-700 dark:text-neutral-300">{itemNotes.jerseyCustomizationNotes}</p>
                                    </div>
                                  )}
                                  {itemNotes.teamRosterNotes && (
                                    <div>
                                      <p className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-1">Team Roster Notes</p>
                                      <p className="text-sm text-neutral-700 dark:text-neutral-300">{itemNotes.teamRosterNotes}</p>
                                    </div>
                                  )}
                                  {itemNotes.sizeNotes && (
                                    <div>
                                      <p className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-1">Size Notes</p>
                                      <p className="text-sm text-neutral-700 dark:text-neutral-300">{itemNotes.sizeNotes}</p>
                                    </div>
                                  )}
                                  {itemNotes.additionalNotes && (
                                    <div>
                                      <p className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-1">Additional Notes</p>
                                      <p className="text-sm text-neutral-700 dark:text-neutral-300">{itemNotes.additionalNotes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Status Update Buttons */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
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
                                <Zap size={16} />
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
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Summary */}
                  <div className="border-t-2 border-neutral-200 dark:border-neutral-700 pt-6 space-y-2 mt-8">
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal || 0)}</span>
                    </div>
                    {order.discount && order.discount > 0 && (
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Discount:</span>
                        <span className="text-red-600 dark:text-red-400">-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    {order.tax && order.tax > 0 && (
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Tax:</span>
                        <span>{formatCurrency(order.tax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold bg-orange-100 dark:bg-orange-900/30 p-4 rounded-lg text-orange-900 dark:text-orange-400">
                      <span>Grand Total</span>
                      <span>{formatCurrency(order.total || 0)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <Package size={40} className="text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400 font-medium text-lg">No order items found</p>
                </Card>
              )}

              {/* Pro Tip Box */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <span className="font-semibold">Pro Tip:</span> Click on any item to expand and view detailed information including design files, team roster, size specifications, and notes. Update item status using the buttons below each expanded item.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Image Zoom Dialog */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2"
            >
              <X size={24} />
            </button>
            <img src={expandedImage} alt="Expanded View" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}
    </div>
  )
}
