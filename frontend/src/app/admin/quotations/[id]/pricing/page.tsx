"use client"

import { AdminQuotationPricing } from "@/components/admin/admin-quotation-pricing"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useParams } from "next/navigation"

export default function AdminQuotationPricingPage() {
  const params = useParams()
  const quotationId = parseInt(params.id as string, 10)

  return (
    <AdminLayout>
      <AdminQuotationPricing quotationId={quotationId} />
    </AdminLayout>
  )
}
