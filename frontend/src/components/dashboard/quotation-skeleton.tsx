export function QuotationSkeleton() {
  return (
    <div className="flex items-center justify-between p-6 bg-white rounded-xl border border-red-100 animate-pulse">
      <div className="flex-1">
        <div className="h-5 bg-gradient-to-r from-red-200 to-orange-200 rounded-lg w-32 mb-3" />
        <div className="h-4 bg-neutral-200 rounded w-24" />
      </div>
      <div className="flex gap-4 items-center">
        <div className="text-right">
          <div className="h-5 bg-gradient-to-r from-red-200 to-orange-200 rounded-lg w-32 mb-3" />
          <div className="h-4 bg-neutral-200 rounded w-20" />
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-9 h-9 bg-gradient-to-br from-red-200 to-orange-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
