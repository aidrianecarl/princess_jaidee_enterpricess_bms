"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PrintQuotationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const quotationData = searchParams.get("quotation")
    
    if (quotationData) {
      try {
        const quotation = JSON.parse(decodeURIComponent(quotationData))
        const { generateQuotationHTML } = require("@/lib/html-print-generator")
        
        const htmlContent = generateQuotationHTML(quotation)
        
        // Open print dialog
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(htmlContent)
          printWindow.document.close()
          
          // Set print options to disable headers and footers
          printWindow.onload = () => {
            // Small delay to ensure styles are loaded
            setTimeout(() => {
              printWindow.print()
              
              // Close window after print
              printWindow.onafterprint = () => {
                printWindow.close()
                router.back()
              }
            }, 250)
          }
        }
      } catch (error) {
        console.error("[v0] Error printing quotation:", error)
        router.back()
      }
    } else {
      router.back()
    }
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Opening print preview...</p>
      </div>
    </div>
  )
}
