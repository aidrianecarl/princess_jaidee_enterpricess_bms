"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { DashboardHeader } from "@/components/dashboard/header"
import { QuotationList } from "@/components/dashboard/quotation-list"
import { StatsCard } from "@/components/dashboard/stats-card"
import { TermsConditionsModal } from "@/components/dashboard/terms-modal"
import { FileText, CheckCircle, Clock, DollarSign } from 'lucide-react'

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

      // Check if user needs to see terms
      const seenTerms = localStorage.getItem("terms_accepted")
      if (!seenTerms) {
        setShowTerms(true)
      }

      // Fetch dashboard stats
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
        const total = quotations.reduce((sum: number, q: any) => sum + q.total, 0)

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
      <div className="min-h-screen bg-neutral-50">
        <DashboardHeader user={user} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <DashboardHeader user={user} />

      {showTerms && <TermsConditionsModal onAccept={() => setShowTerms(false)} />}

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard
            icon={FileText}
            label="Total Quotations"
            value={stats.totalQuotations}
            color="bg-blue-50 text-blue-600"
          />
          <StatsCard
            icon={CheckCircle}
            label="Approved"
            value={stats.approvedQuotations}
            color="bg-green-50 text-green-600"
          />
          <StatsCard
            icon={Clock}
            label="Pending"
            value={stats.pendingQuotations}
            color="bg-yellow-50 text-yellow-600"
          />
          <StatsCard
            icon={DollarSign}
            label="Total Spent"
            value={`₱${stats.totalSpent.toLocaleString()}`}
            color="bg-primary/10 text-primary"
          />
        </div>

        {/* Quotations Section */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">My Quotations</h2>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
              Create New
            </button>
          </div>
          <QuotationList />
        </div>
      </main>
    </div>
  )
}
