"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DollarSign, Loader2 } from "lucide-react"

interface SetPaymentModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  quotation: {
    id: number
    quotation_number: string
    total: number
    customer?: {
      name: string
      email: string
      phone: string
    }
  } | null
  employees: Array<{ id: number; name: string; email: string }>
  onConfirm: (paymentType: "downpayment" | "fullpayment", employeeId: number) => Promise<void>
  isSaving?: boolean
}

export function SetPaymentModal({
  isOpen,
  onOpenChange,
  quotation,
  employees,
  onConfirm,
  isSaving = false,
}: SetPaymentModalProps) {
  const [paymentType, setPaymentType] = useState<"downpayment" | "fullpayment">("downpayment")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    setError("")

    if (!selectedEmployeeId) {
      setError("Please select an employee")
      return
    }

    try {
      await onConfirm(paymentType, selectedEmployeeId)
      onOpenChange(false)
      setPaymentType("downpayment")
      setSelectedEmployeeId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save order")
    }
  }

  if (!quotation) return null

  const downPaymentAmount = quotation.total * 0.3
  const fullPaymentAmount = quotation.total

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
            Set Payment & Assign Employee
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quotation Summary */}
          <Card className="p-4 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <div className="space-y-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Quotation: <span className="font-semibold text-neutral-900 dark:text-white">{quotation.quotation_number}</span>
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Customer: <span className="font-semibold text-neutral-900 dark:text-white">{quotation.customer?.name}</span>
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Amount: <span className="font-bold text-xl text-orange-600">₱{quotation.total.toLocaleString()}</span>
              </p>
            </div>
          </Card>

          {/* Payment Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white">
              Payment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Down Payment Option */}
              <button
                onClick={() => setPaymentType("downpayment")}
                className={`p-4 rounded-lg border-2 transition text-center ${
                  paymentType === "downpayment"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                    : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600"
                }`}
              >
                <DollarSign
                  size={24}
                  className={`mx-auto mb-2 ${
                    paymentType === "downpayment"
                      ? "text-orange-600"
                      : "text-neutral-400 dark:text-neutral-500"
                  }`}
                />
                <p className={`font-semibold text-sm ${
                  paymentType === "downpayment"
                    ? "text-orange-700 dark:text-orange-400"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}>
                  Down Payment
                </p>
                <p className={`text-xs mt-1 ${
                  paymentType === "downpayment"
                    ? "text-orange-600"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}>
                  ₱{downPaymentAmount.toLocaleString()}
                </p>
              </button>

              {/* Full Payment Option */}
              <button
                onClick={() => setPaymentType("fullpayment")}
                className={`p-4 rounded-lg border-2 transition text-center ${
                  paymentType === "fullpayment"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600"
                }`}
              >
                <DollarSign
                  size={24}
                  className={`mx-auto mb-2 ${
                    paymentType === "fullpayment"
                      ? "text-green-600"
                      : "text-neutral-400 dark:text-neutral-500"
                  }`}
                />
                <p className={`font-semibold text-sm ${
                  paymentType === "fullpayment"
                    ? "text-green-700 dark:text-green-400"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}>
                  Full Payment
                </p>
                <p className={`text-xs mt-1 ${
                  paymentType === "fullpayment"
                    ? "text-green-600"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}>
                  ₱{fullPaymentAmount.toLocaleString()}
                </p>
              </button>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white">
              Assign to Employee
            </label>
            <select
              value={selectedEmployeeId || ""}
              onChange={(e) => setSelectedEmployeeId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white transition"
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSaving}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Confirm & Schedule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
