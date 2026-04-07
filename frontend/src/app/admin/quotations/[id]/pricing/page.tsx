"use client"

import { AdminQuotationPricing } from "@/components/admin/admin-quotation-pricing"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminQuotationPricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <AdminLayout>
        <AdminQuotationPricing />
      </AdminLayout>
    </div>
  )
}
