"use client"

import React, { useRef, useState } from "react"
import { Upload, X, File, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DesignRequirementProps {
  onDesignFileSelect: (file: File | null, preview: string, dataUrl?: string) => void
  initialFile?: string
  isRequired?: boolean
}

export function DesignRequirement({
  onDesignFileSelect,
  initialFile,
  isRequired = true,
}: DesignRequirementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState(initialFile || "")
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const acceptedFormats = [
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".ai",
    ".psd",
    ".cdr",
    ".svg",
  ]
  const maxFileSize = 50 * 1024 * 1024 // 50MB

  const validateFile = (file: File): boolean => {
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`

    if (!acceptedFormats.includes(fileExtension)) {
      setError(`Invalid file format. Accepted: ${acceptedFormats.join(", ")}`)
      return false
    }

    if (file.size > maxFileSize) {
      setError(`File size must be less than 50MB`)
      return false
    }

    setError(null)
    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      setFileName(file.name)
      
      // Create preview for image files
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`
      const isImageFile = [".png", ".jpg", ".jpeg", ".svg"].includes(fileExtension)
      
      if (isImageFile) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const dataUrl = reader.result as string
          setImagePreview(dataUrl)
          onDesignFileSelect(file, file.name, dataUrl)
        }
        reader.readAsDataURL(file)
      } else {
        setImagePreview("")
        onDesignFileSelect(file, file.name, "")
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setFileName("")
    onDesignFileSelect(null, "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-neutral-900">
          Design File {isRequired && <span className="text-red-500">*</span>}
        </h3>
      </div>

      {!fileName ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-neutral-300 hover:border-primary/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleInputChange}
            accept={acceptedFormats.join(",")}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Upload size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-neutral-900 mb-1">
                Drag and drop your design file here
              </p>
              <p className="text-sm text-neutral-600 mb-3">
                or click to browse
              </p>
            </div>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
            >
              Browse Files
            </Button>
            <p className="text-xs text-neutral-500 mt-2">
              Accepted formats: {acceptedFormats.join(", ")}
            </p>
            <p className="text-xs text-neutral-500">
              Maximum file size: 50MB
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File size={20} className="text-green-600" />
              <div>
                <p className="font-medium text-green-900">{fileName}</p>
                <p className="text-xs text-green-700">File selected</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:bg-red-50"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Image Preview for Image Files */}
          {imagePreview && (
            <div className="border-2 border-green-300 rounded-lg overflow-hidden bg-white p-3">
              <p className="text-xs font-semibold text-green-700 mb-3">Design Preview</p>
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Design preview"
                className="max-h-64 max-w-full mx-auto object-contain rounded-md border border-green-200"
              />
              <p className="text-xs text-green-600 mt-2 text-center">Ready to proceed to next step</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
