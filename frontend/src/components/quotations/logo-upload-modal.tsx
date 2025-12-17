"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X } from "lucide-react"

interface LogoUploadModalProps {
  onClose: () => void
  onUpload: (logoUrl: string) => void
}

export function LogoUploadModal({ onClose, onUpload }: LogoUploadModalProps) {
  const [preview, setPreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setPreview(result)
      setError("")
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!preview) {
      setError("Please select a logo")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const formData = new FormData()

      // Convert data URL to blob
      const response = await fetch(preview)
      const blob = await response.blob()
      formData.append("logo", blob, "logo.png")

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations/upload-logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload logo")
      }

      const data = await uploadResponse.json()
      onUpload(data.logo_url)
    } catch (err: any) {
      setError(err.message || "Failed to upload logo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeInScale">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Upload Logo</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

          <label className="block">
            <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50/50 transition-colors">
              {preview ? (
                <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-contain p-2" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm font-medium text-gray-700">Choose your logo</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF (Max 2MB)</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!preview || loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Uploading..." : "Upload Logo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
