"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { QuotationDocument } from "@/components/quotations/quotation-document"
import { DashboardHeader } from "@/components/dashboard/header"
import { Toaster } from "@/components/ui/toaster"

export default function CreateQuotationPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user")

      if (!token || !userData) {
        router.push("/")
        return
      }

      setUser(JSON.parse(userData))
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return null // QuotationDocumentV2 has its own skeleton loading
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DashboardHeader user={user} />
      <QuotationDocument />
      <Toaster />
    </div>
  )
}
