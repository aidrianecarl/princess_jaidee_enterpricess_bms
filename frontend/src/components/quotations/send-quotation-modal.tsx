"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Loader2, CheckCircle2, MapPin, Phone, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Branch {
  id: number
  name: string
  location: string
  address: string
  phone_number: string
  email: string
  is_main_branch: boolean
}

interface SendQuotationModalProps {
  isOpen: boolean
  onClose: () => void
  quotationId: number
  onSendSuccess?: (data: any) => void
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"

export function SendQuotationModal({ isOpen, onClose, quotationId, onSendSuccess }: SendQuotationModalProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { toast } = useToast()

  // Fetch branches when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBranches()
    }
  }, [isOpen])

  // Update selected branch when selection changes
  useEffect(() => {
    if (selectedBranchId) {
      const branch = branches.find((b) => b.id.toString() === selectedBranchId)
      setSelectedBranch(branch || null)
    } else {
      setSelectedBranch(null)
    }
  }, [selectedBranchId, branches])

  const fetchBranches = async () => {
    setIsLoadingBranches(true)
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/quotations/active-branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches || [])
        
        // Auto-select main branch if available
        const mainBranch = data.branches?.find((b: Branch) => b.is_main_branch)
        if (mainBranch) {
          setSelectedBranchId(mainBranch.id.toString())
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch branches",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching branches:", error)
      toast({
        title: "Error",
        description: "Failed to fetch branches. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingBranches(false)
    }
  }

  const handleSend = async () => {
    if (!selectedBranchId || !selectedBranch) {
      toast({
        title: "Error",
        description: "Please select a branch",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/quotations/${quotationId}/send-to-branch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branch_id: selectedBranchId,
          send_via: "both", // Can be customized based on user preference
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success!",
          description: `Quotation sent to ${selectedBranch.name} successfully`,
        })
        
        if (onSendSuccess) {
          onSendSuccess(data)
        }
        
        setShowConfirmation(false)
        onClose()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to send quotation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error sending quotation:", error)
      toast({
        title: "Error",
        description: "Failed to send quotation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Send Quotation</DialogTitle>
            <DialogDescription className="text-gray-600">
              Select a branch to send this quotation to
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Branch Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Select Branch</label>
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId} disabled={isLoadingBranches}>
                <SelectTrigger className="w-full h-11 border-2 border-gray-300 rounded-lg hover:border-orange-400 transition-colors">
                  {isLoadingBranches ? (
                    <span className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading branches...
                    </span>
                  ) : (
                    <SelectValue placeholder="Choose a branch..." />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      <div className="flex items-center gap-2">
                        {branch.is_main_branch && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Main</span>}
                        <span className="font-medium">{branch.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Branch Details */}
            {selectedBranch && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{selectedBranch.name}</h3>
                    <p className="text-sm text-gray-600">{selectedBranch.location}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{selectedBranch.address}</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  {selectedBranch.phone_number && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="truncate">{selectedBranch.phone_number}</span>
                    </div>
                  )}
                  {selectedBranch.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="truncate">{selectedBranch.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info Message */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> This quotation will be marked as sent and recorded in the system.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSending || isLoadingBranches}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={!selectedBranch || isSending || isLoadingBranches}
              className="px-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Quotation"
              )}
            </Button>
          </DialogFooter>
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
                <AlertDialogDescription className="text-gray-600 mt-1">
                  Are you sure you want to send this quotation to {selectedBranch?.name} of Princess Jaidee Enterprises?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Branch:</span> {selectedBranch?.name}
              {selectedBranch?.location && <span className="text-gray-500"> • {selectedBranch.location}</span>}
            </p>
          </div>

          <DialogFooter className="flex gap-3">
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
          </DialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
