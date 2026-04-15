'use client'

import { useEffect, useState } from 'react'

export interface OrderProgressProps {
  items: Array<{ id: number; status: string }>
}

export function OrderProgressBar({ items }: OrderProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!items || items.length === 0) {
      setProgress(0)
      return
    }

    const completedCount = items.filter(item => item.status === 'completed').length
    const percentage = (completedCount / items.length) * 100
    setProgress(percentage)
  }, [items])

  const getStatusLabel = () => {
    if (progress === 0) return 'Pending'
    if (progress === 100) return 'Completed'
    return 'In Production'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">
          Order Progress
        </h3>
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {getStatusLabel()} ({Math.round(progress)}%)
        </span>
      </div>
      
      <div className="relative h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-500">
        <span>Pending</span>
        <span>In Production</span>
        <span>Completed</span>
      </div>
    </div>
  )
}
