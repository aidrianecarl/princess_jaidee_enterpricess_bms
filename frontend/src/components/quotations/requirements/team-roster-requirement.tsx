"use client"

import React, { useState, useRef } from "react"
import { Plus, X, Users, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as XLSX from "xlsx"

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const templateData = [
      {
        Name: "Sample Player",
        "Jersey #": "1",
        "Top Size": "M",
        "Top Length (in)": "25",
        "Bottom Size": "L",
        "Bottom Length (in)": "20",
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Team Roster")

    // Set column widths
    const columnWidths = [
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
    ]
    worksheet["!cols"] = columnWidths

    XLSX.writeFile(workbook, "team_roster_template.xlsx")
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = event.target?.result as ArrayBuffer
        const workbook = XLSX.read(data, { type: "array" })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const importedMembers: TeamMember[] = jsonData.map((row: any, index: number) => ({
          id: Date.now().toString() + index,
          name: row["Name"] || row["name"] || "",
          number: row["Jersey #"] || row["Jersey #"] || row["jersey"] || "",
          sizeTop: row["Top Size"] || row["top_size"] || "",
          lengthTopInches: String(row["Top Length (in)"] || row["top_length"] || ""),
          sizeBottom: row["Bottom Size"] || row["bottom_size"] || "",
          lengthBottomInches: String(row["Bottom Length (in)"] || row["bottom_length"] || ""),
        }))

        const updated = importedMembers.filter((m) => m.name.trim())
        if (updated.length > 0) {
          setMembers(updated)
          onTeamRosterChange(updated)
        }
      } catch (error) {
        console.error("Error importing file:", error)
        alert("Error importing file. Please check the format and try again.")
      }
    }
    reader.readAsArrayBuffer(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

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

          {/* Short Sizes Guide */}
          <div>
            <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">!</span>
              Size Specifications Guide - SHORTS
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-200">
                    <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">SIZE</th>
                    <th colSpan={2} className="border border-amber-300 px-2 py-1 font-bold text-amber-900">FINISH</th>
                    <th colSpan={2} className="border border-amber-300 px-2 py-1 font-bold text-amber-900">BOX TYPE</th>
                  </tr>
                  <tr className="bg-amber-200">
                    <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900"></th>
                    <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">WIDTH</th>
                    <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">LENGTH</th>
                    <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">WIDTH</th>
                    <th className="border border-amber-300 px-2 py-1 font-bold text-amber-900">LENGTH</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: '5TS', finishW: 26, finishL: 13, boxW: 22, boxL: 17.5 },
                    { size: '4TS', finishW: 28, finishL: 13, boxW: 23, boxL: 17.5 },
                    { size: '3TS', finishW: 30, finishL: 14, boxW: 24, boxL: 18.5 },
                    { size: '2TS', finishW: 32, finishL: 15, boxW: 25, boxL: 19.5 },
                    { size: 'TS', finishW: 34, finishL: 17, boxW: 26, boxL: 21.5 },
                    { size: 'XS', finishW: 36, finishL: 18, boxW: 27, boxL: 22.5 },
                    { size: 'S', finishW: 38, finishL: 19, boxW: 28, boxL: 23.5 },
                    { size: 'M', finishW: 40, finishL: 20, boxW: 29, boxL: 24.5 },
                    { size: 'L', finishW: 42, finishL: 21, boxW: 30, boxL: 25.5 },
                    { size: 'XL', finishW: 44, finishL: 21, boxW: 31, boxL: 25.5 },
                    { size: '2XL', finishW: 46, finishL: 21, boxW: 32, boxL: 25.5 },
                    { size: '3XL', finishW: 48, finishL: 22, boxW: 33, boxL: 26.5 },
                    { size: '4XL', finishW: 50, finishL: 22, boxW: 34, boxL: 26.5 },
                    { size: '5XL', finishW: 52, finishL: 22, boxW: 35, boxL: 26.5 },
                    { size: '6XL', finishW: 54, finishL: 22, boxW: 36, boxL: 26.5 },
                    { size: 'XL', finishW: 58, finishL: 22, boxW: 37, boxL: 26.5 },
                  ].map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                      <td className="border border-amber-200 px-2 py-1 font-semibold text-amber-900">{row.size}</td>
                      <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.finishW}</td>
                      <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.finishL}</td>
                      <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.boxW}</td>
                      <td className="border border-amber-200 px-2 py-1 text-center text-amber-800">{row.boxL}</td>
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

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Team Roster {isRequired && <span className="text-red-500">*</span>}
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={downloadTemplate}
            variant="outline"
            size="sm"
            className="gap-1 bg-transparent text-blue-600 hover:bg-blue-50"
          >
            <Download size={16} />
            Download Template
          </Button>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="gap-1 bg-transparent text-green-600 hover:bg-green-50"
          >
            <Upload size={16} />
            Import Players
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileImport}
            className="hidden"
          />
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
      </div>

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
                    <select
                      value={member.lengthTopInches || ""}
                      onChange={(e) =>
                        updateMember(member.id, "lengthTopInches", e.target.value)
                      }
                      className="h-9 px-2 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select</option>
                      <option value="Standard">Standard</option>
                      {Array.from({ length: 21 }, (_, i) => 16 + i).map((len) => (
                        <option key={len} value={len}>{len}</option>
                      ))}
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
                    <select
                      value={member.lengthBottomInches || ""}
                      onChange={(e) =>
                        updateMember(member.id, "lengthBottomInches", e.target.value)
                      }
                      className="h-9 px-2 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select</option>
                      {Array.from({ length: 12 }, (_, i) => 12 + i).map((len) => (
                        <option key={len} value={len}>{len}</option>
                      ))}
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
