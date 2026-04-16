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

  const handleReleaseJobOrder = async (jobOrderId: number) => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      setIsReleasing(jobOrderId)
      
      const response = await fetch(`${apiUrl}/admin/job-orders/${jobOrderId}/release`, {
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

  const fetchJobOrders = async (token: string) => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(`${apiUrl}/admin/job-orders`, {
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
      const orders = Array.isArray(data) ? data : data.data || []
      
      setJobOrders(orders)
      
      // Fetch items for each job order to get stats
      for (const order of orders) {
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
      return numberMatch || customerMatch
    })
  }, [jobOrders, searchQuery])

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
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
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
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" size={20} />
                <Input
                  type="text"
                  placeholder="Search by job order number or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-2 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                />
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
                      className="overflow-hidden bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-4"
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                          {/* Left Content */}
                          <div className="flex-1">
                            {/* Title and Status */}
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
                                {jobOrder.job_order_number}
                              </h3>
                              <div className="flex gap-2 flex-wrap items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(jobOrder.status)}`}>
                                  {getStatusLabel(jobOrder.status)}
                                </span>
                                {jobOrder.is_priority ? (
                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                    Priority
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
                            <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide mb-2">Customer</p>
                              <div className="space-y-1">
                                <p className="text-sm md:text-base font-semibold text-neutral-900 dark:text-white">
                                  {jobOrder.customer?.bill_to_name || 'N/A'}
                                </p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {jobOrder.customer?.bill_to_email || 'N/A'}
                                </p>
                                {jobOrder.customer?.bill_to_phone && (
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {jobOrder.customer.bill_to_phone}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Dates and Assignment Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar size={16} className="text-neutral-600 dark:text-neutral-400" />
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide">Start Date</p>
                                </div>
                                <p className="font-semibold text-neutral-900 dark:text-white">
                                  {formatDate(jobOrder.start_date)}
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar size={16} className="text-neutral-600 dark:text-neutral-400" />
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide">Due Date</p>
                                </div>
                                <p className="font-semibold text-neutral-900 dark:text-white">
                                  {formatDate(jobOrder.due_date)}
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Users size={16} className="text-neutral-600 dark:text-neutral-400" />
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wide">Assigned To</p>
                                </div>
                                <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                                  {jobOrder.assignedTo && (jobOrder.assignedTo.first_name || jobOrder.assignedTo.last_name)
                                    ? `${jobOrder.assignedTo.first_name || ''} ${jobOrder.assignedTo.last_name || ''}`.trim()
                                    : (jobOrder.assigned_to ? `Employee #${jobOrder.assigned_to}` : 'Unassigned')}
                                </p>
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
                            {(() => {
                              const stats = jobOrdersStats[jobOrder.id]
                              const statusLower = jobOrder.status?.toLowerCase()
                              const hasStats = stats && stats.total > 0
                              const allCompleted = stats && stats.completed === stats.total
                              const notCompleted = statusLower !== 'completed'
                              const shouldShow = hasStats && allCompleted && notCompleted
                              
                              console.log('[v0] RELEASE BUTTON DEBUG:', {
                                jobOrderId: jobOrder.id,
                                stats: stats,
                                hasStats,
                                allCompleted,
                                notCompleted,
                                shouldShow,
                                statusLower,
                                statsTotal: stats?.total,
                                statsCompleted: stats?.completed
                              })
                              
                              return null
                            })()}
                            <Button
                              onClick={() => router.push(`/admin/job-orders/${jobOrder.id}/orders`)}
                              className="bg-orange-500 hover:bg-orange-600 text-white h-10 md:h-auto md:min-w-[160px] flex items-center justify-center gap-2"
                            >
                              <Eye size={18} />
                              Update Order
                            </Button>
                            {/* Show Release button when job order status is completed */}
                            {jobOrder.status?.toLowerCase() === 'completed' && (
                              <Button
                                onClick={() => {
                                  toast({
                                    title: 'Info',
                                    description: 'This job order is already completed and released.',
                                    variant: 'default',
                                  })
                                }}
                                disabled={true}
                                className="bg-green-600 text-white h-10 md:h-auto md:min-w-[160px] flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                              >
                                <CheckCircle2 size={18} />
                                Completed
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filteredJobOrders.length > itemsPerPage && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredJobOrders.length)}</span> of <span className="font-semibold">{filteredJobOrders.length}</span> results
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          className={currentPage === page ? 'min-w-10' : ''}
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
                      className="gap-1"
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

    </div>
  )
}
