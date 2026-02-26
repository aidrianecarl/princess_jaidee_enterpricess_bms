"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, X, Briefcase, AlertCircle, ChevronRight, Check } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { DesignRequirement } from "./requirements/design-requirement"
import { TeamRosterRequirement } from "./requirements/team-roster-requirement"
import { SizeSpecificationRequirement } from "./requirements/size-specification-requirement"
import { TarpaulinSizeRequirement } from "./requirements/tarpaulin-size-requirement"

interface Service {
  id: number
  name: string
  description: string
  base_price: number
  image_url?: string
  category?: string
  requires_design?: boolean
  requires_team?: boolean
  requires_size?: boolean
  specifications?: string | Record<string, any>
}

interface TeamMember {
  id: string
  name: string
  number: string | number
  size?: string
}

interface SizeSpecs {
  top?: string
  bottom?: string
  width?: number
  height?: number
  totalSqft?: number
  totalPrice?: number
}

interface ServiceData {
  designFile: File | null
  designPreview: string
  designImageUrl?: string
  teamRoster: TeamMember[]
  sizeSpecifications: SizeSpecs
  designConsultation?: {
    needed: boolean
    notes: string
    price: number
  }
}

interface ServiceSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (service: Service, serviceData: ServiceData) => void
}

export function ServiceSelectorModal({ isOpen, onClose, onSelect }: ServiceSelectorModalProps) {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [serviceData, setServiceData] = useState<ServiceData>({
    designFile: null,
    designPreview: "",
    teamRoster: [],
    sizeSpecifications: {},
    designConsultation: undefined,
  })
  const [showDesignConsultationModal, setShowDesignConsultationModal] = useState(false)
  const [designConsultationNotes, setDesignConsultationNotes] = useState("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        const filtered = services.filter(
          (s) =>
            s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredServices(filtered)
      } else {
        setFilteredServices(services)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, services])

  const isTarpaulinService = (service: Service | null): boolean => {
    if (!service) return false
    const specs = typeof service.specifications === "string"
      ? JSON.parse(service.specifications)
      : service.specifications
    return specs?.size_type === "tarpaulin"
  }

  const steps = useMemo(() => {
    if (!selectedService) return ["Service"]
    const s: string[] = ["Service"]
    if (selectedService.requires_design) s.push("Design")
    if (selectedService.requires_team) s.push("Team Roster & Sizes")
    if (selectedService.requires_size && !selectedService.requires_team)
      s.push(isTarpaulinService(selectedService) ? "Tarpaulin Size" : "Sizes")
    return s
  }, [selectedService])

  const getTotalSteps = () => steps.length

  const getServiceImageUrl = (url?: string) => {
    if (!url) return "/placeholder.svg"
    if (url.startsWith("http") || url.startsWith("https")) return url
    return `${process.env.NEXT_PUBLIC_API_URL}/storage/${url}`
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    if (getTotalSteps() === 1) {
      onSelect(service, serviceData)
      handleClose()
    } else {
      setCurrentStep(2)
    }
  }

  const handleNextStep = () => {
    if (currentStep < getTotalSteps()) {
      setCurrentStep(currentStep + 1)
    } else if (selectedService) {
      if (selectedService.requires_design && !serviceData.designPreview) {
        setShowDesignConsultationModal(true)
      } else {
        onSelect(selectedService, serviceData)
        handleClose()
      }
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
    if (currentStep === 2) setSelectedService(null)
  }

  const handleClose = () => {
    setCurrentStep(1)
    setSelectedService(null)
    setSearchQuery("")
    setDesignConsultationNotes("")
    setShowDesignConsultationModal(false)
    setServiceData({
      designFile: null,
      designPreview: "",
      teamRoster: [],
      sizeSpecifications: {},
      designConsultation: undefined,
    })
    onClose()
  }

  const handleDesignConsultationYes = () => {
    const consultationPrice = 500
    const updatedData = {
      ...serviceData,
      designConsultation: {
        needed: true,
        notes: designConsultationNotes,
        price: consultationPrice,
      },
    }
    setServiceData(updatedData)
    onSelect(selectedService!, updatedData)
    handleClose()
  }

  const handleDesignConsultationNo = () => {
    onSelect(selectedService!, serviceData)
    handleClose()
  }

  useEffect(() => {
    if (isOpen) fetchServices()
  }, [isOpen])

  const fetchServices = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services?status=active`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      const servicesList = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      setServices(servicesList)
      setFilteredServices(servicesList)
      if (servicesList.length === 0) setError("No services found. Please create services first.")
    } catch (err) {
      console.error(err)
      setError("Failed to load services. Please try again.")
      setServices([])
      setFilteredServices([])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Step Indicator */}
        {selectedService && (
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-center gap-2">
              {steps.map((label, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      idx + 1 < currentStep
                        ? "bg-green-500 text-white"
                        : idx + 1 === currentStep
                        ? "bg-gradient-to-r from-red-600 to-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {idx + 1 < currentStep ? <Check size={16} /> : idx + 1}
                  </div>
                  <span className={`text-sm font-medium ${idx + 1 <= currentStep ? "text-gray-900" : "text-gray-500"}`}>
                    {label}
                  </span>
                  {idx < steps.length - 1 && <div className="w-6 h-0.5 bg-gray-300 mx-1" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-red-50 to-orange-50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            {selectedService ? steps[currentStep - 1] : "Select Services"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition p-1 hover:bg-red-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedService ? (
            <>
              {/* Search Bar */}
              <div className="mb-4 relative">
                <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-red-200 focus:border-red-600 rounded-lg outline-none transition"
                />
              </div>

              {/* Services Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="border-2 border-gray-200 rounded-xl p-4 space-y-3">
                      <Skeleton className="h-40 w-full rounded-lg bg-gradient-to-br from-red-100 to-orange-100" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <AlertCircle size={48} className="text-red-400 mb-3" />
                  <p className="text-red-600 text-lg font-semibold">{error}</p>
                  <button
                    onClick={fetchServices}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-red-500 hover:shadow-lg hover:bg-red-50/30 transition-all group"
                    >
                      {service.image_url ? (
                        <img
                          src={getServiceImageUrl(service.image_url)}
                          alt={service.name}
                          className="w-full h-40 object-cover rounded-lg mb-3 group-hover:scale-105 transition"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg mb-3 flex items-center justify-center">
                          <Briefcase size={32} className="text-gray-400" />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 line-clamp-2">{service.name}</p>
                          <p className="text-sm text-gray-600 line-clamp-1 mb-2">{service.description}</p>
                        </div>
                      </div>

                      {service.category && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block ${
                            service.category.toLowerCase().includes("sublimation")
                              ? "bg-blue-100 text-blue-700"
                              : service.category.toLowerCase().includes("tarpaulin")
                              ? "bg-purple-100 text-purple-700"
                              : service.category.toLowerCase().includes("embroidery")
                              ? "bg-pink-100 text-pink-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {service.category}
                        </span>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <p className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                          ₱ {(service.base_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <button className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-2 rounded-lg hover:scale-110 transition">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <Briefcase size={48} className="text-gray-300 mb-3" />
                  <p className="text-gray-500 text-lg">No services found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try a different search term or create services in the admin panel
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {selectedService.requires_design && currentStep === steps.indexOf("Design") + 1 && (
                <DesignRequirement
                  isRequired={true}
                  onDesignFileSelect={(file, preview, dataUrl) =>
                    setServiceData({ ...serviceData, designFile: file, designPreview: preview, designImageUrl: dataUrl })
                  }
                />
              )}

              {selectedService.requires_team &&
                currentStep === steps.indexOf("Team Roster & Sizes") + 1 && (
                  <TeamRosterRequirement
                    isRequired={true}
                    onTeamRosterChange={(roster) => setServiceData({ ...serviceData, teamRoster: roster })}
                    requiresSize={true}
                  />
                )}

              {selectedService.requires_size &&
                !selectedService.requires_team &&
                currentStep === steps.indexOf("Sizes") + 1 &&
                !isTarpaulinService(selectedService) && (
                  <SizeSpecificationRequirement
                    isRequired={true}
                    onSizeSpecChange={(specs) => setServiceData({ ...serviceData, sizeSpecifications: specs })}
                  />
                )}

              {selectedService.requires_size &&
                currentStep === steps.indexOf("Tarpaulin Size") + 1 &&
                isTarpaulinService(selectedService) && (
                  <TarpaulinSizeRequirement
                    isRequired={true}
                    onSizeSpecChange={(specs) => setServiceData({ ...serviceData, sizeSpecifications: specs })}
                  />
                )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 flex justify-between items-center">
          <button
            onClick={selectedService ? handlePrevStep : handleClose}
            className="px-6 py-2 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            {selectedService ? "Back" : "Cancel"}
          </button>
          <button
            onClick={handleNextStep}
            className="px-8 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg hover:shadow-lg transition font-semibold flex items-center gap-2"
          >
            {selectedService && currentStep === getTotalSteps() ? "Confirm & Add" : "Next"}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Design Consultation Modal */}
      {showDesignConsultationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-xl font-bold text-gray-900">Design Consultation</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                You haven't provided a design file. Would you like us to create a design for you?
              </p>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Design Details & Requirements
                </label>
                <textarea
                  value={designConsultationNotes}
                  onChange={(e) => setDesignConsultationNotes(e.target.value)}
                  placeholder="Describe the design you want (colors, style, text, etc.)..."
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 outline-none resize-none"
                  rows={4}
                />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Design Consultation Fee: <span className="text-lg font-bold text-blue-600">₱500</span>
                </p>
                <p className="text-xs text-blue-700 mt-1">This will be added to your quotation</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleDesignConsultationNo}
                className="flex-1 px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                No, Skip
              </button>
              <button
                onClick={handleDesignConsultationYes}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-lg hover:shadow-lg transition font-semibold"
              >
                Yes, Add Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
