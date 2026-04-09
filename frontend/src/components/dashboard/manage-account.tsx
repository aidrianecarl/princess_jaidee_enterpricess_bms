"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, ArrowLeft, Mail, Phone, MapPin, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PasswordChangeModal } from "./password-change-modal"

interface ManageAccountContentProps {
  user: any
}

export function ManageAccountContent({ user }: ManageAccountContentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    address: user?.address || "",
    zip_code: user?.zip_code || "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        const updatedUser = { ...user, ...formData }
        localStorage.setItem("user", JSON.stringify(updatedUser))

        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "default",
        })
        setIsEditing(false)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="w-full px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4 max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="p-2 hover:bg-red-50 rounded-lg transition">
          <ArrowLeft size={20} className="text-neutral-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Manage Account</h1>
          <p className="text-neutral-600 mt-1">Update your profile information and security settings</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Profile Information</h2>
                  <p className="text-sm text-neutral-600">Update your personal details</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isEditing
                        ? "border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-neutral-200 bg-neutral-50"
                    } outline-none transition disabled:opacity-75`}
                    placeholder="John"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isEditing
                        ? "border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-neutral-200 bg-neutral-50"
                    } outline-none transition disabled:opacity-75`}
                    placeholder="Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3.5 text-neutral-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                        isEditing
                          ? "border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          : "border-neutral-200 bg-neutral-50"
                      } outline-none transition disabled:opacity-75`}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3.5 text-neutral-400" />
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                        isEditing
                          ? "border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          : "border-neutral-200 bg-neutral-50"
                      } outline-none transition disabled:opacity-75`}
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3.5 text-neutral-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                        isEditing
                          ? "border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          : "border-neutral-200 bg-neutral-50"
                      } outline-none transition disabled:opacity-75`}
                      placeholder="123 Street Name"
                    />
                  </div>
                </div>

                {/* Zip Code */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Zip Code</label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isEditing
                        ? "border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-neutral-200 bg-neutral-50"
                    } outline-none transition disabled:opacity-75`}
                    placeholder="1234"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                {isEditing && (
                  <button
                    onClick={() => {
                      setFormData({
                        first_name: user?.first_name || "",
                        last_name: user?.last_name || "",
                        email: user?.email || "",
                        phone_number: user?.phone_number || "",
                        address: user?.address || "",
                        zip_code: user?.zip_code || "",
                      })
                      setIsEditing(false)
                    }}
                    className="px-6 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition font-medium"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    isEditing
                      ? "bg-gradient-to-r from-red-600 to-orange-500 text-white hover:shadow-lg"
                      : "bg-gradient-to-r from-red-600 to-orange-500 text-white hover:shadow-lg"
                  } disabled:opacity-50`}
                >
                  {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Security */}
        <div className="space-y-6">
          {/* Password Card */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center">
                  <Lock size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">Security</h3>
                  <p className="text-xs text-neutral-600">Manage your password</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 transition font-semibold group"
              >
                <Key size={18} className="group-hover:rotate-12 transition-transform" />
                Change Password
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">Security Tip</p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Use a strong, unique password</li>
                  <li>Never share your password</li>
                  <li>Change regularly for better security</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-lg p-6">
            <h3 className="font-bold text-neutral-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-700">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <span className="text-sm font-medium text-neutral-700">Account Type</span>
                <span className="text-xs font-semibold text-neutral-600 capitalize">{user?.user_type || "Client"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} user={user} />
    </main>
  )
}
