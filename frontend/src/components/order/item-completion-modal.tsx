'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ItemCompletionModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  onConfirm: () => Promise<void>
}

export function ItemCompletionModal({
  isOpen,
  onOpenChange,
  itemName,
  onConfirm,
}: ItemCompletionModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white">
            Complete Item?
          </DialogTitle>
          <DialogDescription className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to mark &quot;{itemName}&quot; as completed?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            This action will update the item status to <span className="font-semibold text-green-600 dark:text-green-400">completed</span> and update the order progress.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-neutral-300 dark:border-neutral-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? 'Confirming...' : 'Yes, Complete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
