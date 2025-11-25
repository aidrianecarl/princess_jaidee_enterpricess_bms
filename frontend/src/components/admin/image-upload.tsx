"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  value: string | File | null
  onChange: (value: File | null) => void
  onImageUrlChange: (url: string) => void
  previewUrl?: string
}

export function ImageUpload({ value, onChange, onImageUrlChange, previewUrl }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string>(previewUrl || "")

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      onChange(file)
    }
  }

  const handleClear = () => {
    setPreview("")
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      onChange(file)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center cursor-pointer hover:border-red-400 dark:hover:border-red-600 transition-colors"
      >
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

        {preview ? (
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div onClick={() => fileInputRef.current?.click()} className="space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Upload className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">Click to upload or drag and drop</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">PNG, JPG, GIF (Max 5MB)</p>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition font-medium text-sm"
          >
            Change Image
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition font-medium text-sm flex items-center justify-center gap-2"
          >
            <X size={16} />
            Remove
          </button>
        </div>
      )}
    </div>
  )
}
