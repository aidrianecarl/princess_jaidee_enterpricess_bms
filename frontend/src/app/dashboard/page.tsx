"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { QuotationList } from "@/components/dashboard/quotation-list"
import { StatsCard } from "@/components/dashboard/stats-card"
import { TermsConditionsModal } from "@/components/dashboard/terms-modal"
import { EmojiRatingModal } from "@/components/dashboard/emoji-rating-modal"
import { QuotationSkeleton } from "@/components/dashboard/quotation-skeleton"
import { FileText, CheckCircle, Clock, DollarSign, Plus } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"

function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalQuotations: 0,
    approvedQuotations: 0,
    pendingQuotations: 0,
    draftQuotations: 0,
    totalOrders: 0,
  })

  const [showTerms, setShowTerms] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        const userData = localStorage.getItem("user")

        if (!token || !userData) {
          router.push("/")
          return
        }

        // ✅ SAFE JSON PARSE
        let parsedUser = null
        try {
          parsedUser = JSON.parse(userData)
        } catch (e) {
          console.error("Invalid user data")
          router.push("/")
          return
        }

        setUser(parsedUser)

        const seenTerms = localStorage.getItem("terms_accepted")
        if (!seenTerms) {
          setShowTerms(true)
        }

        const fromQuotation = searchParams?.get("from") === "quotation"
        const hasRated = localStorage.getItem(`has_rated_${parsedUser.id}`)

        if (fromQuotation && !hasRated) {
          setShowRating(true)
        }

        await fetchStats(token)
      } catch (error) {
        console.error("Auth error:", error)
      } finally {
        // ✅ ALWAYS STOP LOADING
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, searchParams])

  const fetchStats = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) return

      const response = await fetch(`${apiUrl}/quotations`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const quotations = Array.isArray(data) ? data : data.data || []

        const approved = quotations.filter((q: any) => q.status === "approved").length
        const pending = quotations.filter((q: any) => q.status === "pending").length
        const draft = quotations.filter((q: any) => q.status === "draft").length

        const totalOrders = quotations.reduce((sum: number, q: any) => {
          const itemsCount = Array.isArray(q.items) ? q.items.length : 0
          return sum + itemsCount
        }, 0)

        setStats({
          totalQuotations: quotations.length,
          approvedQuotations: approved,
          pendingQuotations: pending,
          draftQuotations: draft,
          totalOrders: totalOrders,
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
        <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
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

      {user && (
        <EmojiRatingModal
          isOpen={showRating}
          onClose={() => {
            setShowRating(false)
            localStorage.setItem(`has_rated_${user.id}`, "true")
          }}
          customerId={user.id}
        />
      )}

      <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12 animate-fadeInUp flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                {user?.first_name}
              </span>
            </h1>
            <p className="text-neutral-600">
              Here's your quotation overview and recent activity
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/dashboard/quotations/create")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition duration-300 font-semibold hover:scale-[1.02] group whitespace-nowrap"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Create Quotation</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="animate-slideUp animation-delay-0">
            <StatsCard icon={FileText} label="Total Quotations" value={stats.totalQuotations} color="from-blue-100 to-blue-50 text-blue-600" />
          </div>
          <div className="animate-slideUp animation-delay-100">
            <StatsCard icon={CheckCircle} label="Approved" value={stats.approvedQuotations} color="from-green-100 to-green-50 text-green-600" />
          </div>
          <div className="animate-slideUp animation-delay-200">
            <StatsCard icon={Clock} label="Pending Review" value={stats.pendingQuotations} color="from-yellow-100 to-yellow-50 text-yellow-600" />
          </div>
          <div className="animate-slideUp animation-delay-300">
            <StatsCard icon={DollarSign} label="Total Orders" value={stats.totalOrders} color="from-red-100 to-orange-100 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 shadow-lg overflow-hidden animate-fadeInUp">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">My Quotations</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Manage and track all your quotations
              </p>
            </div>
          </div>
          <div className="p-6">
            <QuotationList />
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}

// ✅ REQUIRED FOR BUILD (NO UI CHANGE)
export default function PageWrapper() {
  return (
    <Suspense fallback={<div />}>
      <DashboardPage />
    </Suspense>
  )
}
