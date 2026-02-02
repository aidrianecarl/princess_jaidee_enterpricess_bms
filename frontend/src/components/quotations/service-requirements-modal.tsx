"use client"

import React from "react"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import type { Service } from "@/types/service"
import type { TeamMember, SizeSpecs } from "@/types/quotation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ServiceRequirementsModalProps {
  service: Service
  quantity: number
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: {
    quantity: number
    designFileUrl?: string
    teamRoster?: TeamMember[]
    sizeSpecifications?: SizeSpecs
  }) => void
}

export function ServiceRequirementsModal({
  service,
  quantity: initialQuantity,
  isOpen,
  onClose,
  onConfirm,
}: ServiceRequirementsModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [designFileName, setDesignFileName] = useState("")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: "", position: "", size: "" },
  ])
  const [sizeSpecs, setSizeSpecs] = useState<SizeSpecs>({
    top: "",
    bottom: "",
  })

  const handleDesignFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDesignFile(file)
      setDesignFileName(file.name)
    }
  }

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", position: "", size: "" }])
  }

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  const updateTeamMember = (
    index: number,
    field: keyof TeamMember,
    value: string,
  ) => {
    const updated = [...teamMembers]
    updated[index][field] = value
    setTeamMembers(updated)
  }

  const handleSubmit = async () => {
    // TODO: Upload design file to backend if provided
    let designFileUrl: string | undefined

    if (designFile) {
      const formData = new FormData()
      formData.append("file", designFile)
      // TODO: Upload to backend and get URL
      designFileUrl = designFileName
    }

    const filteredTeamRoster = service.requires_team
      ? teamMembers.filter((m) => m.name.trim())
      : undefined
    const filledSizeSpecs = service.requires_size
      ? { ...sizeSpecs }
      : undefined

    onConfirm({
      quantity,
      designFileUrl,
      teamRoster: filteredTeamRoster,
      sizeSpecifications: filledSizeSpecs,
    })

    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {service.name}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Complete requirements for this service
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-900">
              Quantity
            </label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
              className="w-full"
            />
          </div>

          {/* Design File */}
          {service.requires_design && (
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900">
                Design File *
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.ai,.psd,.cdr"
                  onChange={handleDesignFileChange}
                  className="flex-1"
                />
                {designFileName && (
                  <span className="text-sm text-neutral-600">
                    {designFileName}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Accepted: PDF, PNG, JPG, AI, PSD, CDR
              </p>
            </div>
          )}

          {/* Team Roster */}
          {service.requires_team && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-neutral-900">
                  Team Roster *
                </label>
                <button
                  onClick={addTeamMember}
                  className="text-sm bg-primary/10 text-primary px-3 py-1 rounded hover:bg-primary/20 transition"
                >
                  + Add Member
                </button>
              </div>
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) =>
                        updateTeamMember(index, "name", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Position"
                      value={member.position}
                      onChange={(e) =>
                        updateTeamMember(index, "position", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Size"
                      value={member.size || ""}
                      onChange={(e) =>
                        updateTeamMember(index, "size", e.target.value)
                      }
                      className="w-24"
                    />
                    {teamMembers.length > 1 && (
                      <button
                        onClick={() => removeTeamMember(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size Specifications */}
          {service.requires_size && (
            <div>
              <label className="block text-sm font-medium mb-3 text-neutral-900">
                Size Specifications *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-600 mb-1 block">
                    Top Size
                  </label>
                  <Input
                    placeholder="e.g., Large"
                    value={sizeSpecs.top || ""}
                    onChange={(e) =>
                      setSizeSpecs({ ...sizeSpecs, top: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-600 mb-1 block">
                    Bottom Size
                  </label>
                  <Input
                    placeholder="e.g., Medium"
                    value={sizeSpecs.bottom || ""}
                    onChange={(e) =>
                      setSizeSpecs({ ...sizeSpecs, bottom: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition font-medium text-neutral-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
          >
            Confirm & Add to Quotation
          </button>
        </div>
      </div>
    </div>
  )
}
