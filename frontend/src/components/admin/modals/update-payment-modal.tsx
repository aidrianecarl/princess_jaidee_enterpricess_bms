"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DollarSign, Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface UpdatePaymentModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id: number
    order_number: string
    total: number
    remaining_balance?: number
  } | null
  onConfirm: (paymentStatus: "paid", remainingBalance: number) => Promise<void>
  isSaving?: boolean
}

export function UpdatePaymentModal({
  isOpen,
  onOpenChange,
  order,
  onConfirm,
  isSaving = false,
}: UpdatePaymentModalProps) {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setError("")
      setSuccess(false)
    }
  }, [isOpen])

  const handleConfirm = async () => {
    setError("")
    setSuccess(false)

    try {
      await onConfirm("paid", 0)
      setSuccess(true)
      
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment status")
    }
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700" aria-describedby="update-payment-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
            Update Payment Status
          </DialogTitle>
          <p id="update-payment-description" className="sr-only">
            Mark this partial payment order as fully paid
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Summary */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="space-y-2">
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                Order: <span className="font-bold text-neutral-900 dark:text-white">{order.order_number}</span>
              </p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                Total Amount: ₱{order.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              {order.remaining_balance !== undefined && order.remaining_balance > 0 && (
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  Remaining Balance: ₱{order.remaining_balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </Card>

          {/* Confirmation Message */}
          {!success && (
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Marking this order as fully paid will set the remaining balance to ₱0.00. This action cannot be undone.
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex gap-3 items-start">
              <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-green-700 dark:text-green-300">
                Payment status updated successfully! The order is now marked as fully paid.
              </p>
            </div>
          )}

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
            disabled={isSaving || success}
            className="border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSaving || success}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Updating...
              </>
            ) : success ? (
              <>
                <CheckCircle size={16} className="mr-2" />
                Updated
              </>
            ) : (
              "Confirm & Mark as Paid"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
