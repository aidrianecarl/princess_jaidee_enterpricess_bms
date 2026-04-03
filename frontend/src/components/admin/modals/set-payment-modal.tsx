"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DollarSign, Loader2, AlertCircle } from "lucide-react"

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
  employees: Array<{ id: number; first_name: string; last_name: string; email: string; user_type: string }>
  onConfirm: (paymentType: "downpayment" | "fullpayment", employeeId: number, formData: any) => Promise<void>
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
  const [downPaymentInput, setDownPaymentInput] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [dueDate, setDueDate] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    setError("")

    if (!selectedEmployeeId) {
      setError("Please select an employee")
      return
    }

    if (!startDate) {
      setError("Please set a start date")
      return
    }

    if (!dueDate) {
      setError("Please set a due date")
      return
    }

    if (new Date(startDate) >= new Date(dueDate)) {
      setError("Due date must be after start date")
      return
    }

    if (paymentType === "downpayment" && !downPaymentInput) {
      setError("Please enter down payment amount")
      return
    }

    const downPaymentAmount = paymentType === "downpayment" 
      ? parseFloat(downPaymentInput) 
      : quotation!.total

    if (downPaymentAmount <= 0 || downPaymentAmount > quotation!.total) {
      setError("Invalid payment amount")
      return
    }

    try {
      await onConfirm(paymentType, selectedEmployeeId, {
        downPaymentInput,
        startDate,
        dueDate,
        notes,
      })
      onOpenChange(false)
      setPaymentType("downpayment")
      setSelectedEmployeeId(null)
      setDownPaymentInput("")
      setStartDate("")
      setDueDate("")
      setNotes("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save order")
    }
  }

  if (!quotation) return null

  const calculatedDownPayment = quotation.total * 0.3
  const effectiveDownPayment = downPaymentInput ? parseFloat(downPaymentInput) : calculatedDownPayment
  const remainingBalance = quotation.total - effectiveDownPayment

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700" aria-describedby="payment-modal-description">
        <DialogHeader>
          <DialogTitle id="payment-modal-description" className="text-2xl font-bold text-neutral-900 dark:text-white">
            Set Payment & Schedule Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quotation Summary */}
          <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <div className="space-y-2">
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                Quotation: <span className="font-bold text-neutral-900 dark:text-white">{quotation.quotation_number}</span>
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                Customer: <span className="font-bold text-neutral-900 dark:text-white">{quotation.customer?.name}</span>
              </p>
              <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                Total: ₱{quotation.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  (30% = ₱{calculatedDownPayment.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
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
                  ₱{quotation.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </button>
            </div>
          </div>

          {/* Down Payment Input - Only show when down payment is selected */}
          {paymentType === "downpayment" && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-900 dark:text-white">
                Down Payment Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-neutral-600 dark:text-neutral-400 font-semibold">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={quotation.total}
                  value={downPaymentInput}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value) {
                      const numValue = parseFloat(value)
                      // Auto-cap to total amount if it exceeds
                      const cappedValue = numValue > quotation.total ? quotation.total : numValue
                      setDownPaymentInput(cappedValue.toString())
                    } else {
                      setDownPaymentInput(value)
                    }
                  }}
                  placeholder={`Min: 0, Max: ${quotation.total.toLocaleString('en-PH')}`}
                  className="w-full pl-8 pr-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white transition"
                />
              </div>
              {downPaymentInput && (
                <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                  <p>Down Payment: ₱{parseFloat(downPaymentInput).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="font-semibold text-orange-600 dark:text-orange-400">
                    Remaining Balance: ₱{remainingBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Payment Summary - Full Payment Selected */}
          {paymentType === "fullpayment" && (
            <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                Full amount paid: ₱{quotation.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </Card>
          )}

          {/* Employee Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white">
              Assign to Employee
            </label>
            <select
              value={selectedEmployeeId || ""}
              onChange={(e) => setSelectedEmployeeId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white transition"
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.user_type})
                </option>
              ))}
            </select>
            {selectedEmployeeId && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ {`${employees.find(e => e.id === selectedEmployeeId)?.first_name} ${employees.find(e => e.id === selectedEmployeeId)?.last_name}`} selected
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white transition"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white transition"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes for this job order..."
              rows={3}
              className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white transition resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-2">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
                Scheduling...
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
