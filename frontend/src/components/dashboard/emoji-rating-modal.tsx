"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface EmojiRatingModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: number
}

export function EmojiRatingModal({ isOpen, onClose, customerId }: EmojiRatingModalProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<"bad" | "average" | "happy" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const feedbackOptions = [
    {
      type: "bad",
      emoji: "😞",
      label: "Bad",
      description: "Not satisfied",
    },
    {
      type: "average",
      emoji: "😐",
      label: "Average",
      description: "It's okay",
    },
    {
      type: "happy",
      emoji: "😊",
      label: "Happy",
      description: "Very satisfied",
    },
  ]

  const handleSubmit = async () => {
    if (!selectedFeedback) {
      toast({
        title: "Required",
        description: "Please select a feedback option before submitting.",
        variant: "default",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"}/ratings`
      const authToken = localStorage.getItem("auth_token")

      const requestBody = {
        feedback_type: selectedFeedback,
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to submit rating - Status: ${response.status}`)
      }

      const data = await response.json()

      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully.",
        variant: "default",
      })

      handleClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedFeedback(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full animate-in fade-in scale-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-red-50 rounded-lg transition duration-200 z-10"
          aria-label="Close"
        >
          <X size={20} className="text-neutral-500 hover:text-red-600" />
        </button>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
              How was your experience?
            </h2>
            <p className="text-neutral-600">
              Share your feedback with us using an emoji
            </p>
          </div>

          {/* Emoji Feedback Options */}
          <div className="flex justify-around gap-4 mb-8">
            {feedbackOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setSelectedFeedback(option.type as "bad" | "average" | "happy")}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-200 transform hover:scale-110 focus:outline-none ${
                  selectedFeedback === option.type
                    ? "bg-red-100 border-2 border-red-600 scale-105"
                    : "bg-neutral-100 border-2 border-transparent hover:bg-neutral-200"
                }`}
                aria-label={`Select ${option.label}`}
              >
                <span className="text-5xl mb-2">{option.emoji}</span>
                <span className="text-sm font-semibold text-neutral-900">{option.label}</span>
                <span className="text-xs text-neutral-600">{option.description}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 rounded-lg border-neutral-200 hover:bg-neutral-50 text-neutral-700"
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold disabled:opacity-50 transition-all duration-200"
              disabled={isSubmitting || !selectedFeedback}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
