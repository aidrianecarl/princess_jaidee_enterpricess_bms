"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronDown, ChevronUp, Send, Download, Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Service } from "@/types/service"
import type { QuotationItem } from "@/types/quotation"
import ServiceRequirementsModal from "@/components/quotations/service-requirements-modal"
import { quotationsApi, usersApi } from "@/lib/api"

interface QuotationBuilderProps {
  services: Service[]
}

interface BillToData {
  name: string
  street: string
  city: string
  state: string
  postal: string
  phone: string
  email: string
}

export function QuotationBuilder({ services }: QuotationBuilderProps) {
  const [items, setItems] = useState<QuotationItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState("")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showRequirementsModal, setShowRequirementsModal] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'draft' | 'pending'>('idle')
  const [showBillToModal, setShowBillToModal] = useState(false)
  const [billTo, setBillTo] = useState<BillToData>({
    name: '',
    street: '',
    city: '',
    state: '',
    postal: '',
    phone: '',
    email: '',
  })
  const router = useRouter()
  const { toast } = useToast()

  // Load user data on component mount
  useEffect(() => {
  const loadUserData = async () => {
    try {
      const response = await usersApi.getCurrentUser()

      console.log("[v0] API response:", response.data)

      if (response.data?.success && response.data?.data) {
        const user = response.data.data

        setBillTo({
          name: user.full_name || `${user.first_name} ${user.last_name}`,
          street: user.address || '',
          city: user.city || '',
          state: user.province || '',
          postal: user.zip_code || '',
          phone: user.phone_number || '',
          email: user.email || '',
        })
      }
    } catch (error) {
      console.warn("[v0] Failed to load current user:", error)
    }
  }

  loadUserData()
}, [])

  const handleServiceClick = (service: Service) => {
    if (service.requires_design || service.requires_team || service.requires_size) {
      setSelectedService(service)
      setShowRequirementsModal(true)
    } else {
      addItemDirectly(service)
    }
  }

  const addItemDirectly = (service: Service) => {
    const newItem: QuotationItem = {
      id: Math.random().toString(),
      serviceId: service.id,
      serviceName: service.name,
      quantity: 1,
      unitPrice: service.base_price,
      lineTotal: service.base_price * 1,
    }
    setItems([...items, newItem])
  }

  const handleRequirementsConfirm = (data: {
    quantity: number
    designFileUrl?: string
    designImageUrl?: string
    designNotes?: string
    teamRoster?: Array<{ name: string; number: string | number; size?: string }>
    teamRosterNotes?: string
    sizeSpecifications?: { top?: string; bottom?: string }
    sizeNotes?: string
    additionalNotes?: string
  }) => {
    if (!selectedService) return

    // Structure notes as JSON object
    const structuredNotes: Record<string, string> = {}
    
    if (data.designNotes) structuredNotes.designNotes = data.designNotes
    if (data.teamRosterNotes) structuredNotes.jerseyCustomizationNotes = data.teamRosterNotes
    if (data.sizeNotes) structuredNotes.sizeNotes = data.sizeNotes
    if (data.additionalNotes) structuredNotes.additionalNotes = data.additionalNotes

    const newItem: QuotationItem = {
      id: Math.random().toString(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      quantity: data.quantity,
      unitPrice: selectedService.base_price,
      lineTotal: selectedService.base_price * data.quantity,
      designFileUrl: data.designFileUrl,
      teamRoster: data.teamRoster,
      sizeSpecifications: data.sizeSpecifications,
      notes: Object.keys(structuredNotes).length > 0 ? structuredNotes : undefined,
      serviceRequirements: data.designImageUrl ? {
        designImageUrl: data.designImageUrl,
        designPreview: data.designFileUrl || '',
        teamRoster: data.teamRoster || [],
        sizeSpecifications: data.sizeSpecifications || {},
      } : undefined,
    }
    console.log("[v0] New item added with data:", newItem)
    setItems([...items, newItem])
    setSelectedService(null)
    setShowRequirementsModal(false)
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
              lineTotal: item.unitPrice * quantity,
            }
          : item,
      ),
    )
  }

  const updateUnitPrice = (id: string, unitPrice: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              unitPrice,
              lineTotal: unitPrice * item.quantity,
            }
          : item,
      ),
    )
  }

  const toggleItemExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const handleSave = async (status: 'draft' | 'pending') => {
    if (items.length === 0) {
      toast({ title: "Error", description: "Please add at least one item to the quotation", variant: "destructive" })
      return
    }

    setIsSaving(true)
    setSaveStatus(status)

    try {
      // Transform items for API
      const quotationItems = items.map((item) => ({
        service_id: item.serviceId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        design_file_url: item.designFileUrl,
        team_roster: item.teamRoster,
        size_specifications: item.sizeSpecifications,
        notes: item.notes, // This will be the structured notes object
      }))

      const payloadData = {
        customer_name: billTo.name || 'Guest Customer',
        customer_email: billTo.email,
        customer_phone: billTo.phone,
        customer_address: billTo.street,
        customer_city: billTo.city,
        customer_province: billTo.state,
        customer_zip_code: billTo.postal,
        bill_to_name: billTo.name,
        bill_to_street: billTo.street,
        bill_to_city: billTo.city,
        bill_to_state: billTo.state,
        bill_to_postal: billTo.postal,
        bill_to_phone: billTo.phone,
        bill_to_email: billTo.email,
        business_name: 'Princess Jaidee',
        business_address: '',
        business_city: '',
        business_state: '',
        business_postal: '',
        business_phone: '',
        business_email: '',
        items: quotationItems,
        discount: discount || 0,
        notes: notes,
        status: status,
      }

      console.log("[v0] Saving quotation with payload:", payloadData)

      const response = await quotationsApi.create(payloadData)
      
      toast({
        title: "Success",
        description: `Quotation saved as ${status === 'draft' ? 'draft' : 'pending'}`,
      })

      console.log("[v0] Quotation saved successfully:", response.data)

      // Redirect to dashboard after successful save
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error: any) {
      console.error("[v0] Error saving quotation:", error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save quotation'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setSaveStatus('idle')
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const total = subtotal - discount

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Selection Panel */}
      <div className="lg:col-span-2 space-y-8">
        {/* Bill To Section */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-neutral-900">Bill To</h2>
            <button
              onClick={() => setShowBillToModal(true)}
              className="text-xs px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2 text-sm text-neutral-700">
            <p className="font-semibold">{billTo.name || 'Not specified'}</p>
            <p>{billTo.street || 'No address'}</p>
            <p>{billTo.city ? `${billTo.city}, ${billTo.state} ${billTo.postal}` : 'No city/state'}</p>
            <p>{billTo.phone || 'No phone'}</p>
            <p>{billTo.email || 'No email'}</p>
          </div>
        </div>

        {/* Bill To Modal */}
        {showBillToModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Edit Bill To Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={billTo.name}
                    onChange={(e) => setBillTo({ ...billTo, name: e.target.value })}
                    placeholder="Client name"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <textarea
                    value={billTo.street}
                    onChange={(e) => setBillTo({ ...billTo, street: e.target.value })}
                    placeholder="Street address"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={billTo.city}
                      onChange={(e) => setBillTo({ ...billTo, city: e.target.value })}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      value={billTo.state}
                      onChange={(e) => setBillTo({ ...billTo, state: e.target.value })}
                      placeholder="State"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={billTo.postal}
                    onChange={(e) => setBillTo({ ...billTo, postal: e.target.value })}
                    placeholder="Postal code"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={billTo.phone}
                    onChange={(e) => setBillTo({ ...billTo, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={billTo.email}
                    onChange={(e) => setBillTo({ ...billTo, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBillToModal(false)}
                    className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setShowBillToModal(false)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-neutral-900">Available Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary/30 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{service.name}</p>
                  {service.requires_design && (
                    <p className="text-xs text-blue-600">📎 Requires Design</p>
                  )}
                  {service.requires_team && (
                    <p className="text-xs text-green-600">👥 Requires Team Roster</p>
                  )}
                  {service.requires_size && (
                    <p className="text-xs text-purple-600">📏 Requires Sizes</p>
                  )}
                </div>
                <button
                  onClick={() => handleServiceClick(service)}
                  className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition"
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-neutral-900">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes or special requests..."
            className="w-full h-24 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>

      {/* Summary Panel */}
      <div className="space-y-6">
        {/* Items */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold mb-4 text-neutral-900">
            Selected Items ({items.length})
          </h2>

          {items.length === 0 ? (
            <p className="text-neutral-600 text-sm">No items selected</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleItemExpand(item.id)}
                    className="w-full p-3 bg-neutral-50 hover:bg-neutral-100 transition flex justify-between items-center"
                  >
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm text-neutral-900">
                        {item.serviceName}
                      </p>
                      <p className="text-xs text-neutral-600">
                        ₱{item.unitPrice.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-neutral-900">
                        ₱{item.lineTotal.toLocaleString()}
                      </p>
                      {expandedItems.has(item.id) ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>
                  </button>

                  {expandedItems.has(item.id) && (
                    <div className="p-3 space-y-3 border-t border-neutral-200">
                      <div>
                        <label className="text-xs font-medium text-neutral-600">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateUnitPrice(item.id, Number.parseFloat(e.target.value))
                          }
                          className="w-full px-2 py-1 border border-neutral-300 rounded text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-neutral-600">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, Number.parseInt(e.target.value) || 1)
                          }
                          className="w-full px-2 py-1 border border-neutral-300 rounded text-sm mt-1"
                        />
                      </div>

                      {item.teamRoster && item.teamRoster.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-neutral-600 mb-2">
                            👥 Team Roster
                          </p>
                          <div className="space-y-1 bg-blue-50 p-2 rounded text-xs">
                            {item.teamRoster.map((member, idx) => (
                              <div key={idx} className="text-neutral-700">
                                {member.name} - {member.position}
                                {member.size && ` (Size: ${member.size})`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.sizeSpecifications && (
                        <div>
                          <p className="text-xs font-medium text-neutral-600 mb-2">
                            📏 Size Specifications
                          </p>
                          <div className="bg-purple-50 p-2 rounded text-xs text-neutral-700 space-y-1">
                            {item.sizeSpecifications.top && (
                              <div>Top: {item.sizeSpecifications.top}</div>
                            )}
                            {item.sizeSpecifications.bottom && (
                              <div>Bottom: {item.sizeSpecifications.bottom}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {item.designFileUrl && (
                        <div>
                          <p className="text-xs font-medium text-neutral-600">
                            📎 Design File
                          </p>
                          <p className="text-xs text-neutral-700">{item.designFileUrl}</p>
                        </div>
                      )}

                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-full py-1 text-red-600 hover:bg-red-50 rounded transition text-xs font-medium"
                      >
                        Remove Item
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal:</span>
            <span className="font-semibold">₱{subtotal.toLocaleString()}</span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discount</label>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Number.parseFloat(e.target.value)))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">₱{total.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleSave('draft')}
                disabled={isSaving || items.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving && saveStatus === 'draft' ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Saving Draft...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Save Draft
                  </>
                )}
              </button>
              <button
                onClick={() => handleSave('pending')}
                disabled={isSaving || items.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving && saveStatus === 'pending' ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Sending to Admin...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send to Admin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Service Requirements Modal */}
      {selectedService && (
        <ServiceRequirementsModal
          service={selectedService}
          quantity={1}
          isOpen={showRequirementsModal}
          onClose={() => {
            setShowRequirementsModal(false)
            setSelectedService(null)
          }}
          onConfirm={handleRequirementsConfirm}
        />
      )}
    </div>
  )
}
