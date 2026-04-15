'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/header'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, AlertCircle, Package, CheckCircle, ZoomIn, X, Edit2, ChevronDown } from 'lucide-react'
import { getApiImageUrl } from '@/lib/api-urls'
import { ordersApi, jobOrdersApi } from '@/lib/api'
import { OrderProgressBar } from '@/components/order/order-progress-bar'
import { ItemCompletionModal } from '@/components/order/item-completion-modal'

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
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [completingItemId, setCompletingItemId] = useState<number | null>(null)
  const [completingItemName, setCompletingItemName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [itemCompletionModalOpen, setItemCompletionModalOpen] = useState(false)
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
      
      console.log('[v0] === FETCHING JOB ORDER DATA ===')
      console.log('[v0] Job Order ID:', jobOrderId)
      console.log('[v0] API URL:', apiUrl)

      const jobOrderResponse = await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('[v0] Job Order Response Status:', jobOrderResponse.status)

      if (!jobOrderResponse.ok) {
        const errorText = await jobOrderResponse.text()
        console.error('[v0] Job Order Error Response:', errorText)
        throw new Error(`Job order not found (${jobOrderResponse.status})`)
      }

      const jobOrderData = await jobOrderResponse.json()
      console.log('[v0] Job Order Data:', jobOrderData)
      const fetchedJobOrder = jobOrderData.data || jobOrderData
      console.log('[v0] Fetched Job Order:', fetchedJobOrder)
      setJobOrder(fetchedJobOrder)

      if (fetchedJobOrder?.order_id) {
        console.log('[v0] === FETCHING ORDER DATA ===')
        console.log('[v0] Order ID:', fetchedJobOrder.order_id)
        
        const orderResponse = await fetch(`${apiUrl}/admin/orders/${fetchedJobOrder.order_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('[v0] Order Response Status:', orderResponse.status)

        if (!orderResponse.ok) {
          const errorText = await orderResponse.text()
          console.error('[v0] Order Error Response:', errorText)
          throw new Error(`Failed to fetch order (${orderResponse.status})`)
        }

        const orderData = await orderResponse.json()
        console.log('[v0] Order Data:', orderData)
        const fetchedOrder = orderData.data || orderData
        console.log('[v0] Fetched Order:', fetchedOrder)
        console.log('[v0] Order Items:', fetchedOrder?.items)
        
        if (fetchedOrder?.items && fetchedOrder.items.length > 0) {
          fetchedOrder.items.forEach((item: OrderItem, idx: number) => {
            console.log(`[v0] Item ${idx + 1}:`, {
              id: item.id,
              service: item.service?.name,
              quantity: item.quantity,
              status: item.status,
              design_file_url: item.design_file_url,
              team_roster: item.team_roster,
              size_specifications: item.size_specifications,
              notes: item.notes,
            })
          })
        }
        
        setOrder(fetchedOrder)
      } else {
        console.warn('[v0] No order_id found in job order')
      }
      console.log('[v0] === FETCH COMPLETE ===')
    } catch (err) {
      console.error('[v0] Error fetching data:', err)
      console.error('[v0] Error message:', err instanceof Error ? err.message : 'Unknown error')
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

  const handleCompleteItem = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token || !completingItemId || !order || !jobOrder) return

    try {
      setIsSubmitting(true)
      
      console.log('[v0] === MARKING ITEM AS COMPLETED ===')
      console.log('[v0] Item ID:', completingItemId)
      console.log('[v0] API Endpoint:', `${apiUrl}/admin/order-items/${completingItemId}`)

      const response = await fetch(`${apiUrl}/admin/order-items/${completingItemId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      })

      console.log('[v0] Response Status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[v0] Error Response:', errorText)
        throw new Error('Failed to mark item as completed')
      }

      const responseData = await response.json()
      console.log('[v0] Response Data:', responseData)

      // Update local state
      const updatedOrder = { ...order } as Order
      if (updatedOrder.items) {
        updatedOrder.items = updatedOrder.items.map((item) =>
          item.id === completingItemId ? { ...item, status: 'completed' } : item
        )
        setOrder(updatedOrder)
        console.log('[v0] Local state updated')

        // Check if at least one item is completed - update job order to in-progress
        const hasCompletedItem = updatedOrder.items.some((item) => item.status === 'completed')
        if (hasCompletedItem && jobOrder.status === 'pending') {
          console.log('[v0] Updating job order status to in-progress')
          await fetch(`${apiUrl}/admin/job-orders/${jobOrder.id}/status`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'in-progress' }),
          })
          setJobOrder({ ...jobOrder, status: 'in-progress' })
        }

        // Check if all items are completed - update to completed
        const allCompleted = updatedOrder.items.every((item) => item.status === 'completed')
        if (allCompleted) {
          console.log('[v0] All items completed - updating order and job order to completed')
          
          // Update order status
          await fetch(`${apiUrl}/orders/${order.id}/status`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'completed' }),
          })
          
          // Update job order status
          await fetch(`${apiUrl}/admin/job-orders/${jobOrder.id}/status`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'completed' }),
          })
          
          setOrder({ ...updatedOrder, status: 'completed' } as Order)
          setJobOrder({ ...jobOrder, status: 'completed' })
        }
      }

      setItemCompletionModalOpen(false)
      setCompletingItemId(null)
      setCompletingItemName('')
      console.log('[v0] Item marked as completed successfully')
    } catch (err) {
      console.error('[v0] Error completing item:', err)
      console.error('[v0] Error details:', err instanceof Error ? err.message : 'Unknown error')
      alert('Failed to mark item as completed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCompleteDialog = (itemId: number, itemName: string) => {
    setCompletingItemId(itemId)
    setCompletingItemName(itemName)
    setItemCompletionModalOpen(true)
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

              {/* Order Progress and Summary */}
              {order && (
                <div className="space-y-6 mb-8">
                  <Card className="p-6 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <OrderProgressBar items={order.items || []} />
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-6 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide mb-2">Order Number</p>
                      <p className="text-xl font-bold text-neutral-900 dark:text-white">{order.order_number}</p>
                    </Card>
                    <Card className="p-6 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide mb-2">Order Date</p>
                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">{formatDate(order.order_date)}</p>
                    </Card>
                  </div>
                </div>
              )}

              {/* Order Items Grid */}
              {order?.items && order.items.length > 0 ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Order Items</h2>

                  {order.items.map((item) => {
                    const teamRoster = parseJSON(item.team_roster) as TeamMember[] | null
                    const sizeSpecs = parseJSON(item.size_specifications)

                    return (
                      <div key={item.id} className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shadow-md hover:shadow-lg transition">
                        {/* Item Header with Collapse Button and Submit Button */}
                        <button
                          onClick={() => toggleItemExpanded(item.id)}
                          className="w-full p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-neutral-200 dark:border-neutral-700 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition text-left"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <ChevronDown 
                                  size={20} 
                                  className={`text-neutral-600 dark:text-neutral-400 transition-transform ${expandedItems.has(item.id) ? 'rotate-180' : ''}`}
                                />
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                  {item.service?.name || 'Service Item'}
                                </h3>
                              </div>
                              <div className="flex items-center gap-3 flex-wrap ml-8">
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                  Qty: <span className="font-semibold text-neutral-900 dark:text-white">{item.quantity}</span>
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                  {getStatusLabel(item.status)}
                                </span>
                              </div>
                            </div>
                            {item.status !== 'completed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openCompleteDialog(item.id, item.service?.name || 'Item')
                                }}
                                disabled={isSubmitting && completingItemId === item.id}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold rounded-lg transition whitespace-nowrap"
                              >
                                {isSubmitting && completingItemId === item.id ? 'Submitting...' : '✓ Submit'}
                              </button>
                            )}
                          </div>
                        </button>

                        {/* Collapsible Content */}
                        {expandedItems.has(item.id) && (
                          <div className="p-6 space-y-6 border-t border-neutral-200 dark:border-neutral-700 animate-in fade-in duration-200">
                            {/* Design Image */}
                            {item.design_file_url && (
                              <div>
                                <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Design File</h4>
                                <div className="relative group w-full max-w-sm">
                                  <img
                                    src={getApiImageUrl(item.design_file_url)}
                                    alt="Design"
                                    className="w-full h-48 object-cover rounded border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                                    onClick={() => setExpandedImage(getApiImageUrl(item.design_file_url || ''))}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = '/placeholder.svg'
                                    }}
                                  />
                                  <button
                                    onClick={() => setExpandedImage(getApiImageUrl(item.design_file_url || ''))}
                                    className="absolute top-2 right-2 p-2 bg-white dark:bg-neutral-800 rounded shadow opacity-0 group-hover:opacity-100 transition"
                                  >
                                    <ZoomIn size={16} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Team Roster Table */}
                            {teamRoster && teamRoster.length > 0 && (
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-4 text-lg">Team Roster</h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900/50">
                                        <th className="px-4 py-3 text-left font-semibold text-blue-900 dark:text-blue-300">Player Name</th>
                                        <th className="px-4 py-3 text-center font-semibold text-blue-900 dark:text-blue-300">Jersey #</th>
                                        <th className="px-4 py-3 text-center font-semibold text-blue-900 dark:text-blue-300">Top Size</th>
                                        <th className="px-4 py-3 text-center font-semibold text-blue-900 dark:text-blue-300">Bottom Size</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {teamRoster.map((player, idx) => (
                                        <tr key={idx} className="border-b border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
                                          <td className="px-4 py-3 text-neutral-900 dark:text-white font-medium">{player.name}</td>
                                          <td className="px-4 py-3 text-center text-neutral-900 dark:text-white font-semibold">#{player.number}</td>
                                          <td className="px-4 py-3 text-center text-neutral-900 dark:text-white">{player.sizeTop || '—'}</td>
                                          <td className="px-4 py-3 text-center text-neutral-900 dark:text-white">{player.sizeBottom || '—'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Size Specifications - for Tarpaulin & Uniform items */}
                            {sizeSpecs && (typeof sizeSpecs === 'object') && Object.keys(sizeSpecs).length > 0 && (
                              <div className={`p-4 rounded-lg border ${item.service?.name?.includes('Tarpaulin') ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'}`}>
                                <h4 className={`font-bold mb-4 text-lg ${item.service?.name?.includes('Tarpaulin') ? 'text-purple-900 dark:text-purple-300' : 'text-indigo-900 dark:text-indigo-300'}`}>
                                  {item.service?.name?.includes('Tarpaulin') ? 'Tarpaulin Size Specification' : 'Uniform Size'}
                                </h4>
                                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4`}>
                                  {sizeSpecs.width && (
                                    <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Width</p>
                                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.width}</p>
                                    </div>
                                  )}
                                  {sizeSpecs.height && (
                                    <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Height</p>
                                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.height}</p>
                                    </div>
                                  )}
                                  {sizeSpecs.top && (
                                    <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Top Size</p>
                                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.top}</p>
                                    </div>
                                  )}
                                  {sizeSpecs.bottom && (
                                    <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Bottom Size</p>
                                      <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sizeSpecs.bottom}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Notes Section - Display as Text */}
                            {item.notes && (
                              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-3 text-lg">Notes</h4>
                                <div className="space-y-3">
                                  {typeof item.notes === 'object' ? (
                                    <>
                                      {item.notes.designNotes && (
                                        <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                                          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase mb-1">Design Notes</p>
                                          <p className="text-sm text-neutral-900 dark:text-white">{item.notes.designNotes}</p>
                                        </div>
                                      )}
                                      {item.notes.teamNotes && (
                                        <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                                          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase mb-1">Team Notes</p>
                                          <p className="text-sm text-neutral-900 dark:text-white">{item.notes.teamNotes}</p>
                                        </div>
                                      )}
                                      {item.notes.sizeNotes && (
                                        <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                                          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase mb-1">Size Notes</p>
                                          <p className="text-sm text-neutral-900 dark:text-white">{item.notes.sizeNotes}</p>
                                        </div>
                                      )}
                                      {item.notes.additionalNotes && (
                                        <div className="p-3 bg-white dark:bg-neutral-800 rounded">
                                          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase mb-1">Additional Notes</p>
                                          <p className="text-sm text-neutral-900 dark:text-white">{item.notes.additionalNotes}</p>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-sm text-neutral-900 dark:text-white">{item.notes}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <Package size={40} className="text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400 font-medium text-lg">No order items found</p>
                </Card>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* Image Zoom Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 bg-black/50 p-2 rounded"
            >
              <X size={20} />
            </button>
            <img src={expandedImage} alt="Design" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}

      {/* Item Completion Modal */}
      <ItemCompletionModal
        isOpen={itemCompletionModalOpen}
        onOpenChange={setItemCompletionModalOpen}
        itemName={completingItemName}
        onConfirm={handleCompleteItem}
      />
    </div>
  )
}
