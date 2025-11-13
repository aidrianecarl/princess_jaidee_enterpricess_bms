"use client"

import { useState, useEffect } from "react"
import { Package, ShoppingCart, DollarSign, Users, BarChart3 } from "lucide-react"

const stats = [
  {
    icon: Package,
    label: "Total Products",
    value: "248",
    change: "+12%",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: ShoppingCart,
    label: "Pending Orders",
    value: "24",
    change: "+5%",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: DollarSign,
    label: "Monthly Revenue",
    value: "₱125,500",
    change: "+8%",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Users,
    label: "Total Members",
    value: "542",
    change: "+15%",
    color: "bg-primary/10 text-primary",
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
              <div className="flex justify-between items-end">
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold mb-4 text-neutral-900">Sales Trend</h2>
          <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto text-neutral-300 mb-2" />
              <p className="text-neutral-600">Chart will be rendered here</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold mb-4 text-neutral-900">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Completion Rate</span>
              <span className="font-bold text-neutral-900">94%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: "94%" }} />
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-neutral-600">Satisfaction Score</span>
              <span className="font-bold text-neutral-900">4.8/5.0</span>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-full ${i < 4 ? "bg-yellow-400" : "bg-neutral-200"}`} />
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <p className="text-xs text-neutral-600 font-medium uppercase">Recent Activity</p>
              <ul className="text-sm space-y-2">
                <li className="text-neutral-700">✓ Order #1245 Completed</li>
                <li className="text-neutral-700">✓ New customer registered</li>
                <li className="text-neutral-700">✓ Invoice #089 Generated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-bold mb-4 text-neutral-900">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Order #</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "1245", customer: "John Smith", amount: "₱15,500", status: "Completed", date: "2025-01-12" },
                { id: "1244", customer: "Maria Garcia", amount: "₱8,200", status: "Processing", date: "2025-01-11" },
                { id: "1243", customer: "Tech Corp", amount: "₱42,000", status: "Pending", date: "2025-01-10" },
              ].map((order) => (
                <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4">#{order.id}</td>
                  <td className="py-3 px-4">{order.customer}</td>
                  <td className="py-3 px-4 font-semibold">{order.amount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
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
                  <td className="py-3 px-4 text-neutral-600">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
