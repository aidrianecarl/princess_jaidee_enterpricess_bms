"use client"

import { useState } from "react"
import { Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: number
}

export function RatingModal({ isOpen, onClose, customerId }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://api.princessjaideeenterprises.com/api"}/ratings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            star_rating: rating,
            message: message || null,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to submit rating")
      }

      toast({
        title: "Thank You!",
        description: "Your rating has been submitted successfully.",
        variant: "default",
      })

      handleClose()
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast({
        title: "Error",
        description: "Failed to submit your rating. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setMessage("")
    setHoveredRating(0)
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
          <div className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
              How was your experience?
            </h2>
            <p className="text-neutral-600">
              How is your first time using the Website of Princess Jaidee?
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-all duration-200 transform hover:scale-125 focus:outline-none"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  size={40}
                  className={`transition-all duration-200 ${
                    (hoveredRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-neutral-300"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Message Box */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Message (Optional)
            </label>
            <Textarea
              placeholder="Share your thoughts about our service..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-28 resize-none border-neutral-200 focus:border-red-500 focus:ring-red-500"
            />
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
