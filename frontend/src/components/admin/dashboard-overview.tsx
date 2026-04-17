"use client"

import { useState, useEffect } from "react"
import { Package, ShoppingCart, Users, Briefcase, Clock, Eye, Download, Loader } from 'lucide-react'

interface DashboardStats {
  total_services: number
  pending_orders: number
  total_employees: number
  total_clients: number
}

interface RecentOrder {
  id: number
  order_number: string
  quotation_number?: string
  customer?: {
    name: string
  }
  bill_to_name?: string
  total: number
  payment_status: string
  order_status: string
  created_at: string
}

export function DashboardOverview() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_services: 0,
    pending_orders: 0,
    total_employees: 0,
    total_clients: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    fetchDashboardData()
    fetchRecentOrders()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      if (!token) return

      // Fetch various data points for stats
      const [servicesRes, employeesRes, clientsRes, ordersRes] = await Promise.allSettled([
        fetch(`${apiUrl}/admin/services`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/admin/users?user_type=employee`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/admin/users?user_type=client`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/admin/orders?status=pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      let totalServices = 0
      let totalEmployees = 0
      let totalClients = 0
      let pendingOrders = 0

      if (servicesRes.status === 'fulfilled' && servicesRes.value.ok) {
        const data = await servicesRes.value.json()
        totalServices = Array.isArray(data) ? data.length : data.data?.length || 0
      }

      if (employeesRes.status === 'fulfilled' && employeesRes.value.ok) {
        const data = await employeesRes.value.json()
        totalEmployees = Array.isArray(data) ? data.length : data.data?.length || 0
      }

      if (clientsRes.status === 'fulfilled' && clientsRes.value.ok) {
        const data = await clientsRes.value.json()
        totalClients = Array.isArray(data) ? data.length : data.data?.length || 0
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        const data = await ordersRes.value.json()
        pendingOrders = Array.isArray(data) ? data.length : data.data?.length || 0
      }

      setDashboardStats({
        total_services: totalServices,
        pending_orders: pendingOrders,
        total_employees: totalEmployees,
        total_clients: totalClients,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true)
      const token = localStorage.getItem("admin_token")
      if (!token) return

      const response = await fetch(`${apiUrl}/admin/orders?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const orders = Array.isArray(data) ? data : data.data || []
        // Sort by created_at descending and limit to 10
        const sorted = orders
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
        setRecentOrders(sorted)
      }
    } catch (error) {
      console.error("Failed to fetch recent orders:", error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', { 
      style: 'currency', 
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-PH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStatusColor = (status: string) => {
    const lowerStatus = status?.toLowerCase() || ''
    if (lowerStatus.includes('paid') || lowerStatus.includes('completed')) return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
    if (lowerStatus.includes('pending')) return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
    if (lowerStatus.includes('failed') || lowerStatus.includes('cancelled')) return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
    return 'bg-neutral-100 dark:bg-neutral-900/20 text-neutral-800 dark:text-neutral-300'
  }

  const stats = [
    {
      icon: Package,
      label: "Total Services",
      value: dashboardStats.total_services,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: ShoppingCart,
      label: "Pending Orders",
      value: dashboardStats.pending_orders,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
      textColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
      icon: Briefcase,
      label: "Total Employees",
      value: dashboardStats.total_employees,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      textColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: Users,
      label: "Total Clients",
      value: dashboardStats.total_clients,
      color: "from-red-500 to-orange-600",
      bgColor: "from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-800/20",
      textColor: "text-red-600 dark:text-red-400"
    },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 min-h-screen">
      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className={`group bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:border-red-300 dark:hover:border-red-600 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer`}
              style={{
                animationDelay: `${i * 0.1}s`,
                animation: `fadeInUp 0.8s ease-out both`,
              }}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={28} className={`${stat.textColor}`} />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-2">{stat.label}</p>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{loading ? '-' : stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow p-8 animate-fadeInUp">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Recent Orders</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Latest 10 orders</p>
          </div>
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="text-red-600 dark:text-red-400 font-semibold text-sm">Updated Now</span>
          </div>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Order #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr 
                    key={order.id}
                    className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      animation: `slideInLeft 0.5s ease-out both`,
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white">{order.order_number}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{order.customer?.name || order.bill_to_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white">{formatCurrency(order.total || 0)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                        {order.order_status?.charAt(0).toUpperCase() + order.order_status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">No recent orders</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}
