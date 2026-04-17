'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/header'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowRight, Loader2, AlertCircle, Package, Eye, Calendar, Users, CheckCircle2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { ordersApi, jobOrdersApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { OrderProgressBar } from '@/components/order/order-progress-bar'

interface JobOrder {
  id: number
  job_order_number: string
  order_id: number
  status: 'pending' | 'InProduction' | 'completed' | 'cancelled'
  start_date: string
  due_date: string
  completed_date?: string
  released_date?: string
  released_by?: number
  is_priority?: number | boolean
  notes?: string
  customer?: {
    bill_to_name: string
    bill_to_email: string
    bill_to_phone?: string
  }
  assigned_to?: number
  assignedTo?: {
    id?: number
    first_name: string
    last_name: string
    email: string
  }
  order?: {
    id: number
    order_status: string
    payment_status: string
    items?: any[]
  }
}

export default function AdminJobOrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [jobOrdersStats, setJobOrdersStats] = useState<{[key: number]: {completed: number, total: number}}>({})
  const [error, setError] = useState('')
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrder | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isReleasing, setIsReleasing] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'InProduction' | 'completed' | 'released' | null>('pending')
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false)
  const [releaseJobOrderId, setReleaseJobOrderId] = useState<number | null>(null)
  const itemsPerPage = 10


  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.princessjaideeenterprises.com/api'
  
  const handleApprovalClick = (jobOrder: JobOrder) => {
    setSelectedJobOrder(jobOrder)
    setApprovalDialogOpen(true)
  }

  const handleApproveJobOrder = async () => {
    if (!selectedJobOrder) return
    
    try {
      setIsApproving(true)
      
      // Update job order status to in-progress (backend will also update related order status)
      const response = await jobOrdersApi.updateStatus(selectedJobOrder.id, 'InProduction')
      
      if (response && response.status === 200) {
        toast({
          title: 'Success',
          description: 'Job order approved and marked as In Production',
          variant: 'default',
        })
        
        setApprovalDialogOpen(false)
        const token = localStorage.getItem('admin_token')
        if (token) {
          fetchJobOrders(token)
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to approve job order',
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to approve job order',
        variant: 'destructive',
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReleaseConfirm = (jobOrderId: number) => {
    setReleaseJobOrderId(jobOrderId)
    setReleaseConfirmOpen(true)
  }

  const handleReleaseJobOrder = async () => {
    if (!releaseJobOrderId) return
    
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      setIsReleasing(releaseJobOrderId)
      
      const response = await fetch(`${apiUrl}/admin/job-orders/${releaseJobOrderId}/release`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Job order released successfully',
          variant: 'default',
        })
        setReleaseConfirmOpen(false)
        fetchJobOrders(token)
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to release job order',
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to release job order',
        variant: 'destructive',
      })
    } finally {
      setIsReleasing(null)
    }
  }

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
    fetchJobOrders(token)
  }

  const fetchJobOrderItems = async (jobOrderId: number, token: string) => {
    try {
      const response = await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}/orders`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('[v0] Failed to fetch job order items for ID:', jobOrderId)
        return
      }

      const data = await response.json()
      const items = Array.isArray(data) ? data : (data.data || data.orders || [])
      
      // Calculate statistics - check both completed and ongoing/in_progress as not-pending states
      const completed = items.filter((item: any) => item.status === 'completed').length
      const total = items.length
      
      setJobOrdersStats((prev) => {
        return {
          ...prev,
          [jobOrderId]: { completed, total }
        }
      })
    } catch (err) {
      console.error('[v0] Error fetching job order items:', err)
    }
  }

  const fetchJobOrders = async (token: string, filter?: string) => {
    try {
      setIsLoading(true)
      setError('')

      const url = new URL(`${apiUrl}/admin/job-orders`)
      // Use provided filter or default to pending
      if (filter || statusFilter) {
        url.searchParams.append('status', filter || statusFilter)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch job orders')
      }

      const data = await response.json()
      let orders = Array.isArray(data) ? data : data.data || []
      
      console.log('[v0] FETCHED JOB ORDERS:', {
        orderCount: orders.length,
        rawData: data,
        orders: orders,
        firstOrderAssignedTo: orders[0] ? {
          assigned_to: orders[0].assigned_to,
          assignedTo: orders[0].assignedTo,
          assignedToType: typeof orders[0].assignedTo,
          assignedToKeys: orders[0].assignedTo ? Object.keys(orders[0].assignedTo) : []
        } : 'No orders'
      })
      
      // Fetch order details for each job order to check payment status
      const ordersWithDetails = await Promise.all(
        orders.map(async (jobOrder) => {
          try {
            console.log('[v0] Fetching order details for job order:', {
              jobOrderId: jobOrder.id,
              orderId: jobOrder.order_id
            })
            
            const orderResponse = await fetch(`${apiUrl}/admin/orders/${jobOrder.order_id}`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })
            if (orderResponse.ok) {
              let orderData = await orderResponse.json()
              // Handle wrapped response (data.data or data)
              if (orderData.data && !orderData.order_status) {
                orderData = orderData.data
              }
              console.log('[v0] Fetched order data:', {
                jobOrderId: jobOrder.id,
                orderData: orderData,
                hasOrderStatus: !!orderData.order_status,
                hasPaymentStatus: !!orderData.payment_status
              })
              return { ...jobOrder, order: orderData }
            } else {
              console.warn('[v0] Failed to fetch order details:', {
                jobOrderId: jobOrder.id,
                orderId: jobOrder.order_id,
                status: orderResponse.status
              })
            }
          } catch (err) {
            console.error('[v0] Error fetching order details:', err)
          }
          return jobOrder
        })
      )
      
      console.log('[v0] ORDERS WITH DETAILS:', ordersWithDetails)
      
      setJobOrders(ordersWithDetails)
      
      // Fetch items for each job order to get stats
      for (const order of ordersWithDetails) {
        await fetchJobOrderItems(order.id, token)
      }
    } catch (err) {
      console.error('[v0] Error fetching job orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to load job orders')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase()
    switch (normalizedStatus) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'inproduction':
      case 'in-progress':
      case 'in_production':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default:
        return 'bg-neutral-100 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-400'
    }
  }

  const getStatusLabel = (status: string) => {
    if (!status) return 'Unknown'
    const normalizedStatus = status.toLowerCase()
    if (normalizedStatus === 'inproduction' || normalizedStatus === 'in_production') {
      return 'In Production'
    }
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  // Filter and search logic
  const filteredJobOrders = useMemo(() => {
    return jobOrders.filter(order => {
      const searchLower = searchQuery.toLowerCase()
      const numberMatch = order.job_order_number?.toLowerCase().includes(searchLower)
      const customerMatch = order.customer?.bill_to_name?.toLowerCase().includes(searchLower)
      const searchMatches = numberMatch || customerMatch

      // Apply status filter
      if (statusFilter === 'released') {
        return searchMatches && !!order.released_date
      } else if (statusFilter === 'completed') {
        // Don't show completed jobs that have been released
        return searchMatches && order.status === 'completed' && !order.released_date
      } else if (statusFilter) {
        return searchMatches && order.status === statusFilter
      }
      
      return searchMatches
    })
  }, [jobOrders, searchQuery, statusFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredJobOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedJobOrders = filteredJobOrders.slice(startIndex, startIndex + itemsPerPage)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
        <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                {/* Header Skeleton */}
                <div className="mb-8">
                  <div className="h-10 bg-neutral-300 dark:bg-neutral-700 rounded-lg w-64 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-96 animate-pulse"></div>
                </div>

                {/* Search Bar Skeleton */}
                <div className="mb-8">
                  <div className="h-12 bg-neutral-300 dark:bg-neutral-700 rounded-lg animate-pulse"></div>
                </div>

                {/* Filter Buttons Skeleton */}
                <div className="mb-8 flex gap-3 flex-wrap">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-neutral-300 dark:bg-neutral-700 rounded-lg w-32 animate-pulse"></div>
                  ))}
                </div>

                {/* Cards Skeleton */}
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                      <div className="space-y-4">
                        <div className="h-6 bg-neutral-300 dark:bg-neutral-700 rounded w-48 animate-pulse"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="h-16 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">Job Orders</h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Manage and track all job orders. Click view to see order items and update their status.
                </p>
              </div>

              {/* Search Bar */}
              <div className="mb-8 relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="text-neutral-400 dark:text-neutral-500 group-focus-within:text-blue-500 transition-colors duration-300" size={20} />
                </div>
                <Input
                  type="text"
                  placeholder="Search by job order number or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg transition-all duration-300 focus:border-blue-500 dark:focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100 dark:focus:shadow-blue-900/20 hover:border-neutral-300 dark:hover:border-neutral-600 text-base"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="mb-8 flex gap-3 flex-wrap">
                <Button
                  onClick={() => setStatusFilter('pending')}
                  className={`transition-all duration-300 ${statusFilter === 'pending' 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg scale-105' 
                    : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 dark:text-yellow-300'}`}
                >
                  Pending
                </Button>
                <Button
                  onClick={() => setStatusFilter('InProduction')}
                  className={`transition-all duration-300 ${statusFilter === 'InProduction' 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg scale-105' 
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300'}`}
                >
                  In Production
                </Button>
                <Button
                  onClick={() => setStatusFilter('completed')}
                  className={`transition-all duration-300 ${statusFilter === 'completed' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg scale-105' 
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 dark:text-orange-300'}`}
                >
                  Completed
                </Button>
                <Button
                  onClick={() => setStatusFilter('released')}
                  className={`transition-all duration-300 ${statusFilter === 'released' 
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg scale-105' 
                    : 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300'}`}
                >
                  Released
                </Button>
                {statusFilter && (
                  <Button
                    onClick={() => setStatusFilter(null)}
                    variant="ghost"
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
                  >
                    Clear Filter
                  </Button>
                )}
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

              {/* Content */}
              {filteredJobOrders.length === 0 ? (
                <Card className="p-12 text-center bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <Package size={40} className="text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400 font-medium text-lg">
                    {jobOrders.length === 0 ? 'No job orders found' : 'No results matching your search'}
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">
                    {jobOrders.length === 0 ? 'Job orders will appear here once created' : 'Try adjusting your search criteria'}
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:gap-6">
                  {paginatedJobOrders.map((jobOrder) => (
                    <Card
                      key={jobOrder.id}
                      className="overflow-hidden bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:shadow-2xl hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 transition-all duration-300 hover:scale-[1.01] hover:border-blue-300 dark:hover:border-blue-700 animate-in fade-in slide-in-from-bottom-4 group"
                    >
                      <div className="p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                          {/* Left Content */}
                          <div className="flex-1">
                            {/* Title and Status */}
                            <div className="flex items-center gap-3 mb-6 flex-wrap">
                              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                                {jobOrder.job_order_number}
                              </h3>
                              <div className="flex gap-2 flex-wrap items-center">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${getStatusColor(jobOrder.status)}`}>
                                  {getStatusLabel(jobOrder.status)}
                                </span>
                                {jobOrder.is_priority ? (
                                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 shadow-sm shadow-red-200 dark:shadow-red-900/20 animate-pulse">
                                    🔴 Priority
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            {/* Progress Bar - Inside Card */}
                            {jobOrdersStats[jobOrder.id] && jobOrdersStats[jobOrder.id].total > 0 && (
                              <div className="mb-4 w-full p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                                <OrderProgressBar items={Array.from({ length: jobOrdersStats[jobOrder.id].total }, (_, i) => ({
                                  id: i,
                                  status: i < jobOrdersStats[jobOrder.id].completed ? 'completed' : 'pending'
                                }))} />
                              </div>
                            )}

                            {/* Customer Info */}
                            <div className="mb-6 pb-6 border-b-2 border-neutral-200 dark:border-neutral-700">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider">Customer</p>
                              </div>
                              <div className="space-y-2 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg p-3">
                                <p className="text-sm md:text-base font-bold text-neutral-900 dark:text-white">
                                  {jobOrder.customer?.bill_to_name || 'N/A'}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-help">
                                  {jobOrder.customer?.bill_to_email || 'N/A'}
                                </p>
                                {jobOrder.customer?.bill_to_phone && (
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                    📞 {jobOrder.customer.bill_to_phone}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Dates and Assignment Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                                  <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase tracking-wider">Start Date</p>
                                </div>
                                <p className="font-bold text-neutral-900 dark:text-white text-sm">
                                  {formatDate(jobOrder.start_date)}
                                </p>
                              </div>
                              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar size={16} className="text-orange-600 dark:text-orange-400" />
                                  <p className="text-xs text-orange-600 dark:text-orange-300 font-bold uppercase tracking-wider">Due Date</p>
                                </div>
                                <p className="font-bold text-neutral-900 dark:text-white text-sm">
                                  {formatDate(jobOrder.due_date)}
                                </p>
                              </div>
                              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users size={16} className="text-purple-600 dark:text-purple-400" />
                                  <p className="text-xs text-purple-600 dark:text-purple-300 font-bold uppercase tracking-wider">Assigned To</p>
                                </div>
                                {(() => {
                                  // Handle both camelCase (assignedTo) and snake_case (assigned_to) from backend
                                  const assignedToObj = jobOrder.assignedTo || (typeof jobOrder.assigned_to === 'object' ? jobOrder.assigned_to : null)
                                  const firstName = assignedToObj?.first_name
                                  const lastName = assignedToObj?.last_name
                                  const assignedToId = typeof jobOrder.assigned_to === 'number' ? jobOrder.assigned_to : jobOrder.assigned_to?.id
                                  
                                  const displayName = firstName || lastName
                                    ? `${firstName || ''} ${lastName || ''}`.trim()
                                    : (assignedToId ? `Employee #${assignedToId}` : 'Unassigned')
                                  
                                  return (
                                    <p className="font-bold text-sm text-neutral-900 dark:text-white">
                                      {displayName}
                                    </p>
                                  )
                                })()}
                              </div>
                            </div>

                            {jobOrder.notes && (
                              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide mb-2">Notes</p>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300">{jobOrder.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Right Buttons */}
                          <div className="flex gap-2 w-full md:w-auto flex-col md:flex-row">
                            {/* Update Order Button - Always shown, disabled when released */}
                            <Button
                              onClick={() => router.push(`/admin/job-orders/${jobOrder.id}/orders`)}
                              disabled={!!jobOrder.released_date}
                              className={`${jobOrder.released_date ? 'opacity-50 cursor-not-allowed' : ''} bg-orange-500 hover:bg-orange-600 text-white h-10 md:h-auto md:min-w-[160px] flex items-center justify-center gap-2`}
                            >
                              <Eye size={18} />
                              Update Order
                            </Button>

                            {/* Release Button - Show when status is completed, order status is completed, and not already released */}
                            {(() => {
                              const jobOrderStatus = jobOrder.status?.toLowerCase()
                              const orderStatus = jobOrder.order?.order_status
                              const hasReleasedDate = !!jobOrder.released_date
                              const shouldShowRelease = jobOrderStatus === 'completed' && orderStatus === 'completed' && !hasReleasedDate
                              
                              console.log('[v0] RELEASE BUTTON DEBUG:', {
                                jobOrderId: jobOrder.id,
                                jobOrderNumber: jobOrder.job_order_number,
                                jobOrderStatus: jobOrderStatus,
                                rawJobOrderStatus: jobOrder.status,
                                orderStatus: orderStatus,
                                hasOrder: !!jobOrder.order,
                                orderExists: jobOrder.order ? 'YES' : 'NO',
                                hasReleasedDate: hasReleasedDate,
                                releasedDate: jobOrder.released_date,
                                shouldShowRelease: shouldShowRelease,
                                allData: {
                                  jobOrder,
                                  order: jobOrder.order
                                }
                              })
                              
                              return shouldShowRelease
                            })() && 
                            jobOrder.status?.toLowerCase() === 'completed' && 
                            jobOrder.order?.order_status === 'completed' &&
                            !jobOrder.released_date ? (
                              <Button
                                onClick={() => handleReleaseConfirm(jobOrder.id)}
                                disabled={
                                  isReleasing === jobOrder.id || 
                                  jobOrder.order?.payment_status !== 'paid'
                                }
                                className={`${
                                  jobOrder.order?.payment_status !== 'paid'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                } bg-purple-600 hover:bg-purple-700 text-white h-10 md:h-auto md:min-w-[160px] flex items-center justify-center gap-2 transition-all duration-200`}
                                title={jobOrder.order?.payment_status !== 'paid' ? 'Payment must be marked as paid before releasing' : ''}
                              >
                                {isReleasing === jobOrder.id ? (
                                  <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Releasing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={18} />
                                    Release
                                  </>
                                )}
                              </Button>
                            ) : jobOrder.released_date ? (
                              /* Released Button - Show when already released */
                              <Button
                                disabled={true}
                                className="bg-green-600 text-white h-10 md:h-auto md:min-w-[160px] flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                              >
                                <CheckCircle2 size={18} />
                                Released
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filteredJobOrders.length > itemsPerPage && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 px-6 py-6 bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-md hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                    Showing <span className="font-bold text-blue-600 dark:text-blue-400">{startIndex + 1}</span> to <span className="font-bold text-blue-600 dark:text-blue-400">{Math.min(startIndex + itemsPerPage, filteredJobOrders.length)}</span> of <span className="font-bold text-blue-600 dark:text-blue-400">{filteredJobOrders.length}</span> results
                  </div>
                  <div className="flex gap-2 items-center flex-wrap justify-center">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700/50 rounded-lg p-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          variant={currentPage === page ? 'default' : 'ghost'}
                          size="sm"
                          className={`transition-all duration-200 ${currentPage === page ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md min-w-10' : 'hover:bg-neutral-200 dark:hover:bg-neutral-600 min-w-10'}`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    >
                      Next
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Release Confirmation Modal */}
      <AlertDialog open={releaseConfirmOpen} onOpenChange={setReleaseConfirmOpen}>
        <AlertDialogContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-900 dark:text-white">
              Release Job Order?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to release this Job Order{' '}
              <span className="font-semibold text-neutral-900 dark:text-white">
                #{releaseJobOrderId && jobOrders.find(j => j.id === releaseJobOrderId)?.job_order_number}
              </span>
              ? This action will mark it as released and the customer can pick it up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="hover:bg-neutral-100 dark:hover:bg-neutral-700">
              No, Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleReleaseJobOrder()}
              disabled={isReleasing === releaseJobOrderId}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isReleasing === releaseJobOrderId ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Releasing...
                </>
              ) : (
                'Yes, Release'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
