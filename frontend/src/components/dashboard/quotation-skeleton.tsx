export function QuotationSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-neutral-100 rounded-lg animate-pulse">
      <div className="flex-1">
        <div className="h-4 bg-neutral-300 rounded w-32 mb-2" />
        <div className="h-3 bg-neutral-300 rounded w-24" />
      </div>
      <div className="flex gap-4 items-center">
        <div className="text-right">
          <div className="h-4 bg-neutral-300 rounded w-32 mb-2" />
          <div className="h-3 bg-neutral-300 rounded w-20" />
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-neutral-300 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
