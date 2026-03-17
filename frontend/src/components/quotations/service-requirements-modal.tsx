"use client"

import React, { useState, useMemo } from "react"
import { X, ChevronRight, ChevronLeft } from "lucide-react"
import type { Service } from "@/types/service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DesignRequirement } from "./requirements/design-requirement"
import { TeamRosterRequirement } from "./requirements/team-roster-requirement"
import { SizeSpecificationRequirement } from "./requirements/size-specification-requirement"

interface ServiceRequirementsModalProps {
  service: Service
  quantity: number
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: {
    quantity: number
    designFileUrl?: string
    designImageUrl?: string
    designNotes?: string
    teamRoster?: Array<{ name: string; number: string | number; size?: string }>
    teamRosterNotes?: string
    sizeSpecifications?: { top?: string; bottom?: string }
    sizeNotes?: string
    additionalNotes?: string
  }) => void
}

export function ServiceRequirementsModal({
  service,
  quantity: initialQuantity,
  isOpen,
  onClose,
  onConfirm,
}: ServiceRequirementsModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [quantity, setQuantity] = useState(initialQuantity)
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [designFileName, setDesignFileName] = useState("")
  const [designImageUrl, setDesignImageUrl] = useState("")
  const [designNotes, setDesignNotes] = useState("")
  const [teamRoster, setTeamRoster] = useState<
    Array<{ id: string; name: string; number: string | number; size?: string }>
  >([])
  const [teamRosterNotes, setTeamRosterNotes] = useState("")
  const [sizeSpecs, setSizeSpecs] = useState({ top: "", bottom: "" })
  const [sizeNotes, setSizeNotes] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Build steps dynamically based on service requirements
  const steps = useMemo(() => {
    const allSteps = [
      {
        id: "quantity",
        title: "Quantity",
        description: "How many items do you need?",
        icon: "📦",
      },
    ]

    if (service.requires_design) {
      allSteps.push({
        id: "design",
        title: "Design",
        description: "Upload your design file",
        icon: "🎨",
      })
    }

    if (service.requires_team) {
      allSteps.push({
        id: "roster",
        title: "Team Roster",
        description: "Add team members and sizes",
        icon: "👥",
      })
    }

    if (service.requires_size) {
      allSteps.push({
        id: "sizes",
        title: "Size Specifications",
        description: "Specify apparel sizes",
        icon: "📏",
      })
    }

    // Add additional notes step if service doesn't have other requirements
    const hasOtherRequirements = service.requires_design || service.requires_team || service.requires_size
    if (!hasOtherRequirements) {
      allSteps.push({
        id: "additional",
        title: "Special Requirements",
        description: "Add any additional notes (optional)",
        icon: "📝",
      })
    }

    return allSteps
  }, [service])

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0
  const hasOtherRequirements = service.requires_design || service.requires_team || service.requires_size

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStepData.id === "quantity") {
      if (quantity < 1) {
        newErrors.quantity = "Quantity must be at least 1"
      }
    } else if (currentStepData.id === "design") {
      if (service.requires_design && !designFileName) {
        newErrors.design = "Design file is required"
      }
    } else if (currentStepData.id === "roster") {
      const filledMembers = teamRoster.filter((m) => m.name.trim())
      if (service.requires_team && filledMembers.length === 0) {
        newErrors.roster = "At least one team member is required"
      }
    } else if (currentStepData.id === "sizes") {
      if (service.requires_size && (!sizeSpecs.top || !sizeSpecs.bottom)) {
        newErrors.sizes = "Both top and bottom sizes are required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        handleConfirm()
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleConfirm = () => {
    if (validateCurrentStep()) {
      const confirmData = {
        quantity,
        designFileUrl: designFileName || undefined,
        designImageUrl: designImageUrl || undefined,
        designNotes: designNotes || undefined,
        teamRoster:
          teamRoster.length > 0
            ? teamRoster
                .filter((m) => m.name.trim())
                .map((m) => ({
                  name: m.name,
                  number: m.number,
                  size: m.size,
                }))
            : undefined,
        teamRosterNotes: teamRosterNotes || undefined,
        sizeSpecifications:
          sizeSpecs.top || sizeSpecs.bottom ? sizeSpecs : undefined,
        sizeNotes: sizeNotes || undefined,
        additionalNotes: additionalNotes || undefined,
      }
      onConfirm(confirmData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">{service.name}</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Step {currentStep + 1} of {steps.length}: {currentStepData.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded-lg transition"
          >
            <X size={24} className="text-neutral-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-neutral-50">
          <div className="flex gap-1">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-1 rounded-full transition-all ${
                  index < currentStep
                    ? "bg-green-500"
                    : index === currentStep
                      ? "bg-blue-500"
                      : "bg-neutral-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Quantity Step */}
          {currentStepData.id === "quantity" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 text-sm">
                  {currentStepData.icon} {currentStepData.description}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-900">
                  Quantity *
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number.parseInt(e.target.value)))
                    }
                    className={`flex-1 ${
                      errors.quantity ? "border-red-500" : ""
                    }`}
                  />
                  <span className="text-sm text-neutral-600 min-w-fit">
                    {quantity} item{quantity !== 1 ? "s" : ""}
                  </span>
                </div>
                {errors.quantity && (
                  <p className="text-xs text-red-600">{errors.quantity}</p>
                )}
              </div>
            </div>
          )}

          {/* Design Step */}
          {currentStepData.id === "design" && service.requires_design && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 text-sm">
                  {currentStepData.icon} {currentStepData.description}
                </p>
              </div>

              <DesignRequirement
                onDesignFileSelect={(file, preview, dataUrl) => {
                  setDesignFile(file)
                  setDesignFileName(preview)
                  if (dataUrl) setDesignImageUrl(dataUrl)
                }}
                onDesignNotesChange={setDesignNotes}
                initialFile={designFileName}
                initialNotes={designNotes}
                isRequired={true}
              />

              {errors.design && (
                <p className="text-sm text-red-600 p-3 bg-red-50 rounded">
                  {errors.design}
                </p>
              )}
            </div>
          )}

          {/* Team Roster Step */}
          {currentStepData.id === "roster" && service.requires_team && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 text-sm">
                  {currentStepData.icon} {currentStepData.description}
                </p>
              </div>

              <TeamRosterRequirement
                onTeamRosterChange={setTeamRoster}
                onTeamNotesChange={setTeamRosterNotes}
                onSizeChange={(size) => setSizeSpecs(size)}
                initialRoster={teamRoster}
                initialNotes={teamRosterNotes}
                initialSize={sizeSpecs}
                isRequired={true}
                includeGenericSizes={service.requires_size}
              />

              {errors.roster && (
                <p className="text-sm text-red-600 p-3 bg-red-50 rounded">
                  {errors.roster}
                </p>
              )}
            </div>
          )}

          {/* Size Specifications Step */}
          {currentStepData.id === "sizes" && service.requires_size && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 text-sm">
                  {currentStepData.icon} {currentStepData.description}
                </p>
              </div>

              <SizeSpecificationRequirement
                onSizeSpecChange={setSizeSpecs}
                onSizeNotesChange={setSizeNotes}
                initialSpecs={sizeSpecs}
                initialNotes={sizeNotes}
                isRequired={true}
              />

              {errors.sizes && (
                <p className="text-sm text-red-600 p-3 bg-red-50 rounded">
                  {errors.sizes}
                </p>
              )}
            </div>
          )}

          {/* Additional Notes Step (for services without other requirements) */}
          {currentStepData.id === "additional" && !hasOtherRequirements && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 text-sm">
                  {currentStepData.icon} {currentStepData.description}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-900">
                  Additional Notes
                </label>
                <Textarea
                  placeholder="Add any specific requirements or notes for this service..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="h-32"
                />
              </div>
            </div>
          )}

          {/* Final Notes Step (always shown at the end) */}
          {isLastStep && hasOtherRequirements && currentStepData.id !== "additional" && (
            <div className="space-y-4 mt-6 pt-6 border-t border-neutral-200">
              <h3 className="font-semibold text-neutral-900">Additional Notes</h3>
              <Textarea
                placeholder="Add any final remarks or special requirements..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="h-20"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-neutral-200 bg-neutral-50">
          <Button
            onClick={handlePrevious}
            disabled={isFirstStep}
            variant="outline"
            className="gap-2 bg-transparent"
          >
            <ChevronLeft size={18} />
            Previous
          </Button>
          <Button onClick={() => onClose()} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isLastStep ? (
              <>Confirm & Add to Quotation</>
            ) : (
              <>
                Next
                <ChevronRight size={18} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
