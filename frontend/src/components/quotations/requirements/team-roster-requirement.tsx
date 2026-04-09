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
  lengthTopInches?: string
  sizeBottom?: string
  lengthBottomInches?: string
}

interface TeamRosterRequirementProps {
  onTeamRosterChange: (roster: TeamMember[]) => void
  onTeamNotesChange?: (notes: string) => void
  initialRoster?: TeamMember[]
  initialNotes?: string
  isRequired?: boolean
  requiresSize?: boolean
}

export function TeamRosterRequirement({
  onTeamRosterChange,
  onTeamNotesChange,
  initialRoster = [],
  initialNotes = "",
  isRequired = true,
  requiresSize = false,
}: TeamRosterRequirementProps) {
  const [members, setMembers] = useState<TeamMember[]>(
    initialRoster.length > 0
      ? initialRoster
      : [{ id: Date.now().toString(), name: "", number: "", sizeTop: "", lengthTopInches: "", sizeBottom: "", lengthBottomInches: "" }]
  )
  const [teamNotes, setTeamNotes] = useState(initialNotes)

  const addMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: "",
      number: "",
      sizeTop: "",
      lengthTopInches: "",
      sizeBottom: "",
      lengthBottomInches: "",
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
        
      </div>

      {/* Sizing Guide Tables */}
      {requiresSize && (
        <div className="space-y-4 bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-lg border-2 border-amber-200">
          <div>
            <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">!</span>
              Size Specifications Guide - SANDO & T-SHIRT
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-200">
                    <th rowSpan={2} className="border border-amber-300 px-2 py-1 font-bold text-amber-900">SIZE</th>
                    <th colSpan={2} className="border border-amber-300 px-2 py-1 font-bold text-amber-900">SANDO</th>
                    <th colSpan={2} className="border border-amber-300 px-2 py-1 font-bold text-amber-900">T-SHIRT</th>
                  </tr>
                  <tr className="bg-amber-200">
                    <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">WIDTH</th>
                    <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">LENGTH</th>
                    <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">WIDTH</th>
                    <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">LENGTH</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: '5TS', sandoW: 26, sandoL: 18, tshirtW: 26, tshirtL: 17 },
                    { size: '4TS', sandoW: 28, sandoL: 20, tshirtW: 28, tshirtL: 19 },
                    { size: '3TS', sandoW: 30, sandoL: 24, tshirtW: 30, tshirtL: 23 },
                    { size: '2TS', sandoW: 32, sandoL: 25, tshirtW: 32, tshirtL: 24 },
                    { size: 'TS', sandoW: 34, sandoL: 26, tshirtW: 34, tshirtL: 25 },
                    { size: 'XS', sandoW: 36, sandoL: 27, tshirtW: 36, tshirtL: 26 },
                    { size: 'S', sandoW: 38, sandoL: 28, tshirtW: 38, tshirtL: 27 },
                    { size: 'M', sandoW: 40, sandoL: 29, tshirtW: 40, tshirtL: 28 },
                    { size: 'L', sandoW: 42, sandoL: 30, tshirtW: 42, tshirtL: 29 },
                    { size: 'XL', sandoW: 44, sandoL: 30, tshirtW: 44, tshirtL: 30 },
                    { size: '2XL', sandoW: 46, sandoL: 31, tshirtW: 46, tshirtL: 31 },
                    { size: '3XL', sandoW: 48, sandoL: 31, tshirtW: 48, tshirtL: 31 },
                    { size: '4XL', sandoW: 50, sandoL: 32, tshirtW: 50, tshirtL: 31 },
                    { size: '5XL', sandoW: 52, sandoL: 32, tshirtW: 52, tshirtL: 32 },
                  ].map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                      <td className="border border-amber-200 px-2 py-1 font-semibold text-amber-900">{row.size}</td>
                      <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.sandoW}</td>
                      <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.sandoL}</td>
                      <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.tshirtW}</td>
                      <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.tshirtL}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-amber-200">
            <h4 className="text-sm font-bold text-amber-900 mb-3">SHORT & SPECIALIZED ITEMS SIZE GUIDE</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-orange-200">
                    <th rowSpan={2} className="border border-orange-300 px-2 py-1 font-bold text-orange-900">SIZE</th>
                    <th colSpan={2} className="border border-orange-300 px-2 py-1 font-bold text-orange-900">SHORT (FINISH)</th>
                    <th colSpan={2} className="border border-orange-300 px-2 py-1 font-bold text-orange-900">SHORT (CUT SIZE)</th>
                  </tr>
                  <tr className="bg-orange-200">
                    <th className="border border-orange-300 px-2 py-1 font-bold text-orange-900">WIDTH</th>
                    <th className="border border-orange-300 px-2 py-1 font-bold text-orange-900">LENGTH</th>
                    <th className="border border-orange-300 px-2 py-1 font-bold text-orange-900">WIDTH</th>
                    <th className="border border-orange-300 px-2 py-1 font-bold text-orange-900">LENGTH</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: '5TS', shortW: 26, shortL: 13, cutW: 22, cutL: 17.5 },
                    { size: '4TS', shortW: 28, shortL: 13, cutW: 23, cutL: 17.5 },
                    { size: '3TS', shortW: 30, shortL: 14, cutW: 24, cutL: 18.5 },
                    { size: '2TS', shortW: 32, shortL: 15, cutW: 25, cutL: 19.5 },
                    { size: 'TS', shortW: 34, shortL: 17, cutW: 26, cutL: 21.5 },
                    { size: 'XS', shortW: 36, shortL: 18, cutW: 27, cutL: 22.5 },
                    { size: 'S', shortW: 38, shortL: 19, cutW: 28, cutL: 23.5 },
                    { size: 'M', shortW: 40, shortL: 20, cutW: 29, cutL: 24.5 },
                    { size: 'L', shortW: 42, shortL: 21, cutW: 30, cutL: 25.5 },
                    { size: 'XL', shortW: 44, shortL: 21, cutW: 31, cutL: 25.5 },
                  ].map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                      <td className="border border-orange-200 px-2 py-1 font-semibold text-orange-900">{row.size}</td>
                      <td className="border border-orange-200 px-2 py-1 text-center text-orange-800">{row.shortW}</td>
                      <td className="border border-orange-200 px-2 py-1 text-center text-orange-800">{row.shortL}</td>
                      <td className="border border-orange-200 px-2 py-1 text-center text-orange-800">{row.cutW}</td>
                      <td className="border border-orange-200 px-2 py-1 text-center text-orange-800">{row.cutL}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-amber-800 bg-white p-2 rounded border border-amber-200 mt-3">
            <strong>Note:</strong> All measurements are in inches. Please refer to these specifications when selecting sizes for your team members. Contact us if you need custom sizing.
          </p>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto p-2">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="flex flex-col gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
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
                  Jersey #
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
                      <option value="None">None</option>
                      <option value="5TS">5TS</option>
                      <option value="4TS">4TS</option>
                      <option value="3TS">3TS</option>
                      <option value="2TS">2TS</option>
                      <option value="TS">TS</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="2XL">2XL</option>
                      <option value="3XL">3XL</option>
                      <option value="4XL">4XL</option>
                      <option value="5XL">5XL</option>
                      <option value="6XL">6XL</option>
                      <option value="7XL">7XL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Top Length (in)
                    </label>
                    <Input
                      type="number"
                      placeholder="Length in inches"
                      value={member.lengthTopInches || ""}
                      onChange={(e) =>
                        updateMember(member.id, "lengthTopInches", e.target.value)
                      }
                      className="h-9 text-sm"
                    />
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
                      <option value="None">None</option>
                      <option value="5TS">5TS</option>
                      <option value="4TS">4TS</option>
                      <option value="3TS">3TS</option>
                      <option value="2TS">2TS</option>
                      <option value="TS">TS</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="2XL">2XL</option>
                      <option value="3XL">3XL</option>
                      <option value="4XL">4XL</option>
                      <option value="5XL">5XL</option>
                      <option value="6XL">6XL</option>
                      <option value="7XL">7XL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Bottom Length (in)
                    </label>
                    <Input
                      type="number"
                      placeholder="Length in inches"
                      value={member.lengthBottomInches || ""}
                      onChange={(e) =>
                        updateMember(member.id, "lengthBottomInches", e.target.value)
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                </>
              )}
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
    </div>
  )
}
