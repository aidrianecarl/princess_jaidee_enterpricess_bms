"use client"

import { useState, useEffect } from "react"
import { Package, ShoppingCart, DollarSign, Users, BarChart3, TrendingUp } from 'lucide-react'

const stats = [
  {
    icon: Package,
    label: "Total Products",
    value: "248",
    change: "+12%",
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100",
  },
  {
    icon: ShoppingCart,
    label: "Pending Orders",
    value: "24",
    change: "+5%",
    color: "from-yellow-500 to-yellow-600",
    bgColor: "from-yellow-50 to-yellow-100",
  },
  {
    icon: DollarSign,
    label: "Monthly Revenue",
    value: "₱125,500",
    change: "+8%",
    color: "from-green-500 to-green-600",
    bgColor: "from-green-50 to-green-100",
  },
  {
    icon: Users,
    label: "Total Members",
    value: "542",
    change: "+15%",
    color: "from-red-500 to-orange-600",
    bgColor: "from-red-50 to-orange-100",
  },
]

export function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState({
    stats: stats,
    recentOrders: [],
    topProducts: [],
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      // Fetch dashboard data from API
      // For now, using static data
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-neutral-50/50">
      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-neutral-600 text-lg">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeInUp">
        {dashboardData.stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="group bg-white rounded-2xl border border-neutral-200 hover:border-red-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer"
              style={{
                animationDelay: `${i * 0.1}s`,
                animation: `fadeInUp 0.8s ease-out both`,
              }}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={28} className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
              </div>
              <p className="text-sm text-neutral-600 font-medium mb-2">{stat.label}</p>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                  <TrendingUp size={16} />
                  {stat.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeInUp">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Sales Trend</h2>
              <p className="text-sm text-neutral-600">Monthly performance overview</p>
            </div>
            <div className="px-4 py-2 bg-red-50 rounded-lg">
              <span className="text-red-600 font-semibold text-sm">+12.5% Growth</span>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200">
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-full mb-4">
                <BarChart3 size={48} className="text-neutral-300" />
              </div>
              <p className="text-neutral-600 font-medium">Chart will be rendered here</p>
              <p className="text-neutral-400 text-sm mt-2">Connected to your analytics</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Quick Stats</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-600 font-medium">Completion Rate</span>
                <span className="font-bold text-neutral-900">94%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: "94%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-600 font-medium">Satisfaction Score</span>
                <span className="font-bold text-neutral-900">4.8/5.0</span>
              </div>
              <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2.5 rounded-full transition-all ${
                      i < 4
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                        : "bg-neutral-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-200 space-y-3">
              <p className="text-xs text-neutral-600 font-semibold uppercase tracking-wide">Recent Activity</p>
              <ul className="text-sm space-y-2.5">
                <li className="text-neutral-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Order #1245 Completed
                </li>
                <li className="text-neutral-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  New customer registered
                </li>
                <li className="text-neutral-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Invoice #089 Generated
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden animate-fadeInUp">
        <div className="p-8 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Recent Orders</h2>
              <p className="text-sm text-neutral-600">Latest customer transactions</p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium text-sm hover:from-red-700 hover:to-orange-700 transition-all">
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50">
                <th className="text-left py-4 px-6 font-semibold text-neutral-900">Order #</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-900">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-900">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "1245",
                  customer: "John Smith",
                  amount: "₱15,500",
                  status: "Completed",
                  date: "2025-01-12",
                },
                {
                  id: "1244",
                  customer: "Maria Garcia",
                  amount: "₱8,200",
                  status: "Processing",
                  date: "2025-01-11",
                },
                {
                  id: "1243",
                  customer: "Tech Corp",
                  amount: "₱42,000",
                  status: "Pending",
                  date: "2025-01-10",
                },
              ].map((order, i) => (
                <tr
                  key={order.id}
                  className="border-b border-neutral-100 hover:bg-red-50/30 transition-colors group cursor-pointer"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    animation: `fadeInUp 0.6s ease-out both`,
                  }}
                >
                  <td className="py-4 px-6 font-semibold text-neutral-900">#{order.id}</td>
                  <td className="py-4 px-6 text-neutral-700">{order.customer}</td>
                  <td className="py-4 px-6 font-semibold text-neutral-900">{order.amount}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Processing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-neutral-600">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
