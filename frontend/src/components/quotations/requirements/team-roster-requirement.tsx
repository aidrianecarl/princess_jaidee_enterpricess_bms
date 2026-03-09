"use client"

import React, { useState } from "react"
import { Plus, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TeamMember {
  id: string
  name: string
  number: string | number
  sizeTop?: string
  sizeBottom?: string
}

interface TeamRosterRequirementProps {
  onTeamRosterChange: (roster: TeamMember[]) => void
  onTeamNotesChange?: (notes: string) => void
  initialRoster?: TeamMember[]
  initialNotes?: string
  isRequired?: boolean
  requiresSize?: boolean
  isLastStep?: boolean
}

export function TeamRosterRequirement({
  onTeamRosterChange,
  onTeamNotesChange,
  initialRoster = [],
  initialNotes = "",
  isRequired = true,
  requiresSize = false,
  isLastStep = false,
}: TeamRosterRequirementProps) {
  const [members, setMembers] = useState<TeamMember[]>(
    initialRoster.length > 0
      ? initialRoster
      : [{ id: Date.now().toString(), name: "", number: "", sizeTop: "", sizeBottom: "" }]
  )
  const [teamNotes, setTeamNotes] = useState(initialNotes)

  const addMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: "",
      number: "",
      sizeTop: "",
      sizeBottom: "",
    }
    const updated = [...members, newMember]
    setMembers(updated)
    onTeamRosterChange(updated)
  }

  const removeMember = (id: string) => {
    if (members.length > 1) {
      const updated = members.filter((m) => m.id !== id)
      setMembers(updated)
      onTeamRosterChange(updated)
    }
  }

  const updateMember = (
    id: string,
    field: keyof TeamMember,
    value: string | number
  ) => {
    const updated = members.map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    )
    setMembers(updated)
    onTeamRosterChange(updated)
  }

  const filledMembers = members.filter((m) => m.name.trim())

  const handleNotesChange = (notes: string) => {
    setTeamNotes(notes)
    onTeamNotesChange?.(notes)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Team Roster {isRequired && <span className="text-red-500">*</span>}
          </h3>
        </div>
        <Button
          type="button"
          onClick={addMember}
          variant="outline"
          size="sm"
          className="gap-1 bg-transparent"
        >
          <Plus size={16} />
          Add Player
        </Button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto p-2">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="flex flex-col gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  placeholder="Player name"
                  value={member.name}
                  onChange={(e) =>
                    updateMember(member.id, "name", e.target.value)
                  }
                  className="h-9 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Number
                </label>
                <Input
                  type="text"
                  placeholder="Jersey #"
                  value={member.number}
                  onChange={(e) =>
                    updateMember(member.id, "number", e.target.value)
                  }
                  className="h-9 text-sm"
                />
              </div>

              {requiresSize && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Top Size
                    </label>
                    <select
                      value={member.sizeTop || ""}
                      onChange={(e) =>
                        updateMember(member.id, "sizeTop", e.target.value)
                      }
                      className="h-9 px-2 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="2XL">2XL</option>
                      <option value="3XL">3XL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Bottom Size
                    </label>
                    <select
                      value={member.sizeBottom || ""}
                      onChange={(e) =>
                        updateMember(member.id, "sizeBottom", e.target.value)
                      }
                      className="h-9 px-2 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="2XL">2XL</option>
                      <option value="3XL">3XL</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {members.length > 1 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => removeMember(member.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  <X size={18} />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">{filledMembers.length}</span> player(s)
          added to roster
        </p>
      </div>

      {!isLastStep && (
        <div className="space-y-2 pt-4 border-t border-neutral-200">
          <label className="block text-sm font-medium text-neutral-900">
            Jersey Customization Notes <span className="text-neutral-500 text-xs">(Optional)</span>
          </label>
          <textarea
            placeholder="Add any jersey customization requirements, special printing, embroidery, or other specific details..."
            value={teamNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={3}
          />
        </div>
      )}
    </div>
  )
}
