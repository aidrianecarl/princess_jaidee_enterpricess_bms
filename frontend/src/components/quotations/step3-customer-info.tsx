"use client"

import { useEffect } from "react"

interface Step3Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step3CustomerInfo({ formData, setFormData }: Step3Props) {
  useEffect(() => {
    // Load user info on mount
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!formData.customer || !formData.customer.name) {
      setFormData({
        ...formData,
        customer: {
          name: user.first_name || "",
          email: user.email || "",
          phone: user.phone_number || "",
          address: "",
          city: "",
          province: "",
          zip_code: "",
        },
      })
    }
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      customer: {
        ...formData.customer,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 3: Your Information</h2>
        <p className="text-gray-600">Your details have been pre-filled. Please update if needed.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Auto-filled from your profile</p>
        <p>You can edit any information below</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
          <input
            type="text"
            value={formData.customer?.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
          <input
            type="email"
            value={formData.customer?.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.customer?.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
          <input
            type="text"
            value={formData.customer?.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
          <input
            type="text"
            value={formData.customer?.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Province */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Province</label>
          <input
            type="text"
            value={formData.customer?.province || ""}
            onChange={(e) => handleChange("province", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Zip Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Zip Code</label>
          <input
            type="text"
            value={formData.customer?.zip_code || ""}
            onChange={(e) => handleChange("zip_code", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Address Verification */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Please verify your address</p>
        <p>Ensure all information is correct. This will be used for delivery and official quotation records.</p>
      </div>
    </div>
  )
}
