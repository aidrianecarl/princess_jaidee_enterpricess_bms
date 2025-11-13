import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  color: string
}

export function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
        <Icon size={24} />
      </div>
      <p className="text-sm text-neutral-600 mb-2">{label}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  )
}
