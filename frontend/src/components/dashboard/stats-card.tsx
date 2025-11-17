import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  color: string
}

export function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl border border-red-100 p-6 shadow-lg hover:shadow-xl hover:border-red-300 transition duration-300 hover:scale-105 overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-orange-50/0 group-hover:from-red-50/50 group-hover:to-orange-50/50 transition duration-300" />
      
      <div className="relative">
        <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300 shadow-md`}>
          <Icon size={28} className="group-hover:rotate-12 transition duration-300" />
        </div>
        <p className="text-sm font-medium text-neutral-600 mb-2 group-hover:text-neutral-700 transition">{label}</p>
        <p className="text-3xl font-bold text-neutral-900 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">{value}</p>
      </div>
    </div>
  )
}
