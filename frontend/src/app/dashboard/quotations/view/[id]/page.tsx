"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/header"

interface QuotationItem {
  id: number
  service_id: number
  quantity: number
  unit_price: number
  description: string
  service?: { id: number; name: string }
}

interface Quotation {
  id: number
  quotation_number: string
  business_name: string
  business_address: string
  business_city: string
  business_state: string
  business_postal: string
  business_phone: string
  business_email: string
  subtotal: number
  discount: number
  tax: number
  total: number
  notes: string
  status: string
  has_price: number
  created_at: string
  items: QuotationItem[]
}

export default function ViewQuotationPage() {
  const params = useParams()
  const router = useRouter()
  const quotationId = params.id

  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    if (quotationId) {
      fetchQuotation()
    }
  }, [quotationId])

  const fetchQuotation = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")

      if (!token) {
        router.push("/")
        return
      }

      const response = await fetch(`${apiUrl}/quotations/${quotationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch quotation")
      }

      const data = await response.json()
      setQuotation(data.data || data)
    } catch (err) {
      console.error("[v0] Error fetching quotation:", err)
      setError(err instanceof Error ? err.message : "Failed to load quotation")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <DashboardHeader user={user} />
        <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <DashboardHeader user={user} />
        <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button onClick={() => router.back()} variant="outline" className="gap-2">
              <ArrowLeft size={16} />
              Back
            </Button>
          </div>
          <Card className="p-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
            <p className="text-red-700 dark:text-red-400">{error || "Quotation not found"}</p>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <DashboardHeader user={user} />

      <main className="pt-14 sm:pt-16 md:ml-64 max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button onClick={() => router.back()} variant="outline" className="gap-2">
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
              {quotation.quotation_number}
            </h1>
            <Badge className={`${quotation.status === "sent" ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"}`}>
              {quotation.status === "sent" ? "Sent to Production" : quotation.status}
            </Badge>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Created {formatDate(quotation.created_at)}</p>
        </div>

        {/* Business Information */}
        <Card className="p-6 mb-6 border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Business Name</p>
              <p className="font-semibold text-neutral-900 dark:text-white">{quotation.business_name}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Email</p>
              <p className="font-semibold text-neutral-900 dark:text-white">{quotation.business_email}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Phone</p>
              <p className="font-semibold text-neutral-900 dark:text-white">{quotation.business_phone}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Address</p>
              <p className="font-semibold text-neutral-900 dark:text-white">
                {quotation.business_address}, {quotation.business_city}, {quotation.business_state} {quotation.business_postal}
              </p>
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card className="p-6 mb-6 border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Quotation Items</h2>
          {quotation.items && quotation.items.length > 0 ? (
            <div className="space-y-3">
              {quotation.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-white">{item.service?.name || item.description}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Qty: {item.quantity}</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(item.unit_price)}</p>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{formatCurrency(item.quantity * item.unit_price)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-600 dark:text-neutral-400 text-center py-4">No items in this quotation</p>
          )}
        </Card>

        {/* Summary */}
        <Card className="p-6 border-neutral-200 dark:border-neutral-800">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-neutral-600 dark:text-neutral-400">Subtotal</p>
              <p className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(quotation.subtotal)}</p>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-neutral-600 dark:text-neutral-400">Discount</p>
                <p className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(quotation.discount)}</p>
              </div>
            )}
            {quotation.tax > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-neutral-600 dark:text-neutral-400">Tax</p>
                <p className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(quotation.tax)}</p>
              </div>
            )}
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex justify-between items-center">
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">Total</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(quotation.total)}</p>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {quotation.notes && (
          <Card className="p-6 mt-6 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Notes</h3>
            <p className="text-neutral-700 dark:text-neutral-300">{quotation.notes}</p>
          </Card>
        )}
      </main>
    </div>
  )
}
