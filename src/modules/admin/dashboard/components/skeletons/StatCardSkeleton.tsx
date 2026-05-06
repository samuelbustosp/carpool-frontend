export function StatCardSkeleton() {
  return (
    <div className="bg-gray-8 rounded-2xl">
      <div className="px-6 py-3 flex flex-col gap-3.5 animate-pulse">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-gray-9/25" />
        </div>

        {/* Value */}
        <div className="h-6 w-24 rounded bg-gray-9/25" />

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 w-28 rounded bg-gray-9/25" />
          <div className="h-3 w-20 rounded bg-gray-9/25" />
        </div>
      </div>
    </div>
  )
}