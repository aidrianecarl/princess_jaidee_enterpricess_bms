'use client'

import { useEffect, useState } from 'react'

export interface OrderProgressProps {
  items: Array<{ id: number; status: string }>
}

export function OrderProgressBar({ items }: OrderProgressProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<'pending' | 'inProduction' | 'completed'>('pending')

  useEffect(() => {
    if (!items || items.length === 0) {
      setProgress(0)
      setCurrentStep('pending')
      return
    }

    const completedCount = items.filter(item => item.status === 'completed').length
    const percentage = (completedCount / items.length) * 100
    setProgress(percentage)

    // Determine current step
    if (percentage === 0) {
      setCurrentStep('pending')
    } else if (percentage === 100) {
      setCurrentStep('completed')
    } else {
      setCurrentStep('inProduction')
    }
  }, [items])

  const getStatusLabel = () => {
    if (progress === 0) return 'Pending'
    if (progress === 100) return 'Completed'
    return 'In Production'
  }

  const getStepClass = (step: 'pending' | 'inProduction' | 'completed') => {
    const baseClass = 'flex flex-col items-center relative z-10'
    
    if (step === 'pending') {
      return baseClass // Always active as it's the start
    }
    
    if (step === 'inProduction') {
      return progress > 0 ? baseClass : `${baseClass} opacity-50`
    }
    
    if (step === 'completed') {
      return progress === 100 ? baseClass : `${baseClass} opacity-50`
    }
    
    return baseClass
  }

  const getCircleClass = (step: 'pending' | 'inProduction' | 'completed') => {
    const baseClass = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300'
    
    if (step === 'pending') {
      if (progress === 0) {
        return `${baseClass} bg-yellow-500 text-white ring-4 ring-yellow-200 dark:ring-yellow-900/50`
      }
      return `${baseClass} bg-green-500 text-white`
    }
    
    if (step === 'inProduction') {
      if (progress > 0 && progress < 100) {
        return `${baseClass} bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900/50`
      }
      if (progress === 100) {
        return `${baseClass} bg-green-500 text-white`
      }
      return `${baseClass} bg-neutral-300 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400`
    }
    
    if (step === 'completed') {
      if (progress === 100) {
        return `${baseClass} bg-green-500 text-white ring-4 ring-green-200 dark:ring-green-900/50`
      }
      return `${baseClass} bg-neutral-300 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400`
    }
    
    return baseClass
  }

  const getProgressBarWidth = () => {
    // Progress bar starts from Pending and goes to Completed
    // 0% = at Pending, 50% = at InProduction, 100% = at Completed
    if (progress === 0) return '0%'
    if (progress === 100) return '100%'
    // For any progress between 0 and 100, show it proportionally
    // Map progress to position: 0-100% progress maps to 0-100% bar width
    return `${progress}%`
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">
          Order Progress
        </h3>
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {getStatusLabel()} ({Math.round(progress)}%)
        </span>
      </div>
      
      {/* Progress Steps */}
      <div className="relative w-full px-0">
        {/* Background Line */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-neutral-200 dark:bg-neutral-700" />
        
        {/* Progress Line */}
        <div 
          className="absolute top-4 left-4 h-1 bg-gradient-to-r from-yellow-500 via-blue-500 to-green-500 transition-all duration-500 ease-out"
          style={{ width: `calc(${getProgressBarWidth()})` }}
        />
        
        {/* Steps */}
        <div className="relative flex justify-between w-full px-4">
          {/* Pending Step */}
          <div className={getStepClass('pending')}>
            <div className={getCircleClass('pending')}>
              {progress > 0 ? '✓' : '1'}
            </div>
            <span className="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Pending
            </span>
          </div>
          
          {/* In Production Step */}
          <div className={getStepClass('inProduction')}>
            <div className={getCircleClass('inProduction')}>
              {progress === 100 ? '✓' : '2'}
            </div>
            <span className="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              In Production
            </span>
          </div>
          
          {/* Completed Step */}
          <div className={getStepClass('completed')}>
            <div className={getCircleClass('completed')}>
              {progress === 100 ? '✓' : '3'}
            </div>
            <span className="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* Items Progress Bar */}
      <div className="mt-4 w-full">
        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-500 mb-1">
          <span>Items Completed</span>
          <span>{items.filter(i => i.status === 'completed').length} / {items.length}</span>
        </div>
        <div className="relative h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden w-full">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
