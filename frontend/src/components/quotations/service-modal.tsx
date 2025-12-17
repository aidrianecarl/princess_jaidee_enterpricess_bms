"use client"

import { useState, useEffect } from "react"
import { Search, X, ImageIcon } from "lucide-react"

interface Service {
  id: number
  name: string
  description?: string
  image_url?: string
  base_price: number
  category?: string
}

interface ServiceModalProps {
  onClose: () => void
  onSelect: (service: Service) => void
}

export function ServiceModal({ onClose, onSelect }: ServiceModalProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredServices, setFilteredServices] = useState<Service[]>([])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        const serviceList = Array.isArray(data) ? data : data.data || []
        setServices(serviceList)
        setFilteredServices(serviceList)
      } catch (error) {
        console.error("Failed to fetch services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  useEffect(() => {
    const results = services.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredServices(results)
  }, [searchQuery, services])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-fadeInScale">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Select Service</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500">No services found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => onSelect(service)}
                  className="p-4 border border-gray-200 rounded-xl hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all text-left group"
                >
                  {service.image_url ? (
                    <img
                      src={service.image_url || "/placeholder.svg"}
                      alt={service.name}
                      className="w-full h-40 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <ImageIcon className="text-gray-400" size={32} />
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                  )}
                  <div className="flex justify-between items-end mt-3">
                    {service.category && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">{service.category}</span>
                    )}
                    <span className="text-lg font-bold text-red-600 ml-auto">
                      ₱
                      {Number.parseFloat(String(service.base_price)).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
