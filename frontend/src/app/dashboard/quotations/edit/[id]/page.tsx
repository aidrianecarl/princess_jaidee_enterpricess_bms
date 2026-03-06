"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { QuotationDocumentV2 } from "@/components/quotations/quotation-document-edit"
import { Loader2 } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/header"

export default function EditQuotationPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [quotation, setQuotation] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user")

      if (!token) {
        router.push("/")
        return
      }

      if (userData) {
        setUser(JSON.parse(userData))
      }

      fetchQuotation()
    }

    checkAuth()
  }, [params.id, router])

  const fetchQuotation = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.status === "draft") {
          setQuotation(data)
        } else {
          router.push("/dashboard")
        }
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Failed to fetch quotation:", error)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading quotation...</p>
        </div>
      </div>
    )
  }

  if (!quotation) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader user={user} />
      <QuotationDocumentV2 existingQuotation={quotation} />
    </div>
  )
}
