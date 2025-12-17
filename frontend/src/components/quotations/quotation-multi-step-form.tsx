"use client"

import { useState } from "react"
import { ChevronRight, ChevronLeft, Check, AlertCircle } from "lucide-react"
import Step1SelectProducts from "./step1-select-services"
import Step2Configure from "./step2-configure"
import Step3CustomerInfo from "./step3-customer-info"
import Step4Summary from "./step4-summary"

interface QuotationFormData {
  items: any[]
  customizations: Record<string, any>
  customer: any
  discountPercent: number
}

export function QuotationMultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<QuotationFormData>({
    items: [],
    customizations: {},
    customer: null,
    discountPercent: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const totalSteps = 4

  const handleNext = () => {
    if (currentStep === 1 && formData.items.length === 0) {
      setError("Please select at least one service")
      return
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      setError("")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError("")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      const payload = {
        customer_name: formData.customer.name || user.first_name,
        customer_email: formData.customer.email || user.email,
        customer_phone: formData.customer.phone,
        customer_address: formData.customer.address,
        customer_city: formData.customer.city,
        customer_province: formData.customer.province,
        customer_zip_code: formData.customer.zip_code,
        items: formData.items.map((item) => ({
          product_id: item.type === "product" ? item.id : null,
          service_id: item.type === "service" ? item.id : null,
          quantity: item.quantity,
          unit_price: item.base_price,
          customization: formData.customizations[item.id]?.notes || null,
          design_cost: formData.customizations[item.id]?.design_cost || 0,
          size_specifications: formData.customizations[item.id]?.sizes || null,
          team_roster: formData.customizations[item.id]?.team_roster || null,
          has_image_upload: formData.customizations[item.id]?.has_image_upload || false,
        })),
        discount: formData.discountPercent,
        notes: formData.customizations.notes || "",
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const result = await response.json()
        localStorage.setItem("last_quotation", JSON.stringify(result.quotation))
        window.location.href = "/dashboard"
      } else {
        const errorData = await response.json()
        setError(errorData.errors?.items?.[0] || "Failed to create quotation")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-orange-50/20">
      {/* Header with Modern Gradient */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">Create Quotation</h1>
          <p className="text-red-100 text-sm sm:text-base">
            Step {currentStep} of {totalSteps}:{" "}
            {currentStep === 1
              ? "Select Services"
              : currentStep === 2
                ? "Configure"
                : currentStep === 3
                  ? "Information"
                  : "Review"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-red-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all transform ${
                    step < currentStep
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white scale-100"
                      : step === currentStep
                        ? "bg-gradient-to-r from-red-600 to-orange-500 text-white scale-110 shadow-lg shadow-red-500/30"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step < currentStep ? <Check size={20} /> : step}
                </div>

                {index < 3 && (
                  <div
                    className={`flex-1 h-1 mx-1 sm:mx-3 rounded transition-all ${step < currentStep ? "bg-green-500" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm font-semibold text-center">
            <div className={currentStep >= 1 ? "text-red-600" : "text-gray-600"}>Select</div>
            <div className={currentStep >= 2 ? "text-red-600" : "text-gray-600"}>Configure</div>
            <div className={currentStep >= 3 ? "text-red-600" : "text-gray-600"}>Info</div>
            <div className={currentStep >= 4 ? "text-red-600" : "text-gray-600"}>Review</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3 animate-in">
            <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            <p className="text-red-800 text-sm sm:text-base">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-red-200 shadow-xl overflow-hidden min-h-96">
          <div className="p-4 sm:p-8">
            {currentStep === 1 && <Step1SelectProducts formData={formData} setFormData={setFormData} />}
            {currentStep === 2 && <Step2Configure formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && <Step3CustomerInfo formData={formData} setFormData={setFormData} />}
            {currentStep === 4 && <Step4Summary formData={formData} setFormData={setFormData} />}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              currentStep === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 hover:shadow-md"
            }`}
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="text-sm text-gray-600 font-medium">
            Step {currentStep} of {totalSteps}
          </div>

          {currentStep === totalSteps ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 transition-all duration-200 hover:scale-105"
            >
              {isLoading ? "Submitting..." : "Send Quotation"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 hover:scale-105"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
