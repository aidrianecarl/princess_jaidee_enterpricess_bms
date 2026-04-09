"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, MapPin, Phone, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Branch {
  id: number
  name: string
  location?: string
  address?: string
  phone_number?: string
  email?: string
  is_main_branch?: boolean
}

interface SendQuotationModalProps {
  isOpen: boolean
  onClose: () => void
  quotationId: number
  onSendSuccess?: (data: any) => void
}

export function SendQuotationModal({
  isOpen,
  onClose,
  quotationId,
  onSendSuccess,
}: SendQuotationModalProps) {
  const { toast } = useToast()
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Fetch branches on mount
  useEffect(() => {
    if (isOpen && quotationId > 0) {
      fetchBranches()
    }
  }, [isOpen, quotationId])

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/quotations/active-branches", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch branches")
      }

      const data = await response.json()
      setBranches(data.branches || [])

      // Auto-select main branch if available
      const mainBranch = data.branches?.find((b: Branch) => b.is_main_branch)
      if (mainBranch) {
        setSelectedBranch(mainBranch)
      } else if (data.branches && data.branches.length > 0) {
        setSelectedBranch(data.branches[0])
      }
    } catch (error) {
      console.error("[v0] Error fetching branches:", error)
      toast({
        title: "Error",
        description: "Failed to load branches. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!selectedBranch) {
      toast({
        title: "Error",
        description: "Please select a branch",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)
      const response = await fetch(`/api/quotations/${quotationId}/send-to-branch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          branch_id: selectedBranch.id,
          send_via: "both",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send quotation")
      }

      const data = await response.json()
      toast({
        title: "Success!",
        description: `Quotation sent to ${selectedBranch.name}`,
      })

      if (onSendSuccess) {
        onSendSuccess(data)
      }

      setShowConfirmation(false)
      onClose()
    } catch (error) {
      console.error("[v0] Error sending quotation:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send quotation",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Send Quotation to Branch</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-600">No branches available</p>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-900">
                Select Princess Jaidee Branch:
              </label>
              <select
                value={selectedBranch?.id || ""}
                onChange={(e) => {
                  const branch = branches.find((b) => b.id === Number(e.target.value))
                  setSelectedBranch(branch || null)
                }}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-600 focus:outline-none font-medium text-gray-900"
              >
                <option value="">-- Select a branch --</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                    {branch.is_main_branch ? " (Main)" : ""}
                  </option>
                ))}
              </select>

              {selectedBranch && (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-200 space-y-2">
                  <p className="font-bold text-orange-900">Branch Details:</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{selectedBranch.name}</span>
                    {selectedBranch.is_main_branch && <span className="ml-2 text-xs bg-orange-600 text-white px-2 py-1 rounded">Main Branch</span>}
                  </p>
                  {selectedBranch.location && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin size={16} className="text-orange-600" />
                      {selectedBranch.location}
                    </p>
                  )}
                  {selectedBranch.address && (
                    <p className="text-sm text-gray-600">{selectedBranch.address}</p>
                  )}
                  {selectedBranch.phone_number && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={16} className="text-orange-600" />
                      {selectedBranch.phone_number}
                    </p>
                  )}
                  {selectedBranch.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail size={16} className="text-orange-600" />
                      {selectedBranch.email}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowConfirmation(true)}
                disabled={!selectedBranch || isSending}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Quotation"
                )}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl">Confirm Send</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-700 mt-2 font-medium">
                  Are you sure you want to send quotation <span className="text-orange-600 font-bold">#{quotationId}</span> to <span className="text-orange-600 font-bold">{selectedBranch?.name}</span> of Princess Jaidee Enterprises?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 my-4 border border-orange-200">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold block mb-1">Branch Details:</span>
              <span className="text-orange-700 font-bold">{selectedBranch?.name}</span>
              {selectedBranch?.location && <span className="text-gray-600 text-xs block mt-1">📍 {selectedBranch.location}</span>}
              {selectedBranch?.address && <span className="text-gray-600 text-xs block">🏢 {selectedBranch.address}</span>}
            </p>
          </div>

          <AlertDialogHeader className="flex gap-3 flex-row justify-end">
            <AlertDialogCancel
              disabled={isSending}
              className="px-6"
            >
              No, Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSend}
              disabled={isSending}
              className="px-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Sending...
                </>
              ) : (
                "Yes, Send Now"
              )}
            </AlertDialogAction>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
