"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { QuotationList } from "@/components/dashboard/quotation-list"
import { StatsCard } from "@/components/dashboard/stats-card"
import { TermsConditionsModal } from "@/components/dashboard/terms-modal"
import { QuotationSkeleton } from "@/components/dashboard/quotation-skeleton"
import { FileText, CheckCircle, Clock, DollarSign, Plus } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalQuotations: 0,
    approvedQuotations: 0,
    pendingQuotations: 0,
    totalSpent: 0,
  })
  const [showTerms, setShowTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user")

      if (!token || !userData) {
        router.push("/")
        return
      }

      const user = JSON.parse(userData)
      setUser(user)

      const seenTerms = localStorage.getItem("terms_accepted")
      if (!seenTerms) {
        setShowTerms(true)
      }

      await fetchStats(token)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const quotations = Array.isArray(data) ? data : data.data || []
        const approved = quotations.filter((q: any) => q.status === "approved").length
        const pending = quotations.filter((q: any) => q.status === "pending").length
        const total = quotations.reduce((sum: number, q: any) => sum + (q.total || 0), 0)

        setStats({
          totalQuotations: quotations.length,
          approvedQuotations: approved,
          pendingQuotations: pending,
          totalSpent: total,
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-red-50/20">
        <DashboardHeader user={user} />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-lg">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <QuotationSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50/20">
      <DashboardHeader user={user} />

      {showTerms && <TermsConditionsModal onAccept={() => setShowTerms(false)} />}

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12 animate-fadeInUp">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              {user?.first_name}
            </span>
          </h1>
          <p className="text-neutral-600">Here's your quotation overview and recent activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="animate-slideUp animation-delay-0">
            <StatsCard
              icon={FileText}
              label="Total Quotations"
              value={stats.totalQuotations}
              color="from-blue-100 to-blue-50 text-blue-600"
            />
          </div>
          <div className="animate-slideUp animation-delay-100">
            <StatsCard
              icon={CheckCircle}
              label="Approved"
              value={stats.approvedQuotations}
              color="from-green-100 to-green-50 text-green-600"
            />
          </div>
          <div className="animate-slideUp animation-delay-200">
            <StatsCard
              icon={Clock}
              label="Pending"
              value={stats.pendingQuotations}
              color="from-yellow-100 to-yellow-50 text-yellow-600"
            />
          </div>
          <div className="animate-slideUp animation-delay-300">
            <StatsCard
              icon={DollarSign}
              label="Total Quotation Value"
              value={`₱${stats.totalSpent.toLocaleString()}`}
              color="from-red-100 to-orange-100 text-red-600"
            />
          </div>
        </div>

        {/* Quotations Section */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-lg overflow-hidden animate-fadeInUp">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">My Quotations</h2>
              <p className="text-sm text-neutral-600 mt-1">Manage and track all your quotations</p>
            </div>
            <button
              onClick={() => (window.location.href = "/dashboard/quotations/create")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition duration-300 font-semibold hover:scale-105"
            >
              <Plus size={20} />
              Create New
            </button>
          </div>
          <div className="p-6">
            <QuotationList />
          </div>
        </div>
      </main>
    </div>
  )
}
