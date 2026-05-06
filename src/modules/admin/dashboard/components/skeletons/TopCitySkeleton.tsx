
interface TopCitySkeletonProps{
  limit: number
}

export default function TopCitySkeleton({limit}:TopCitySkeletonProps) {
  return(
    <div className="space-y-4">
      {[...Array(limit)].map((_, i) => {
        const ghostWidth = Math.max(10, 45 - i * 12)

        return (
          <div key={i} className="space-y-3 animate-pulse">
            
            {/* Top row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                
                {/* ranking */}
                <span className="text-xs font-mono shrink-0 w-4 text-right text-gray-11">
                  {i + 1}
                </span>

                {/* city name */}
                <div className="h-3 bg-gray-9/50 rounded w-24" />
              </div>
            </div>

            {/* progress */}
            <div className="flex items-center gap-2">
              <span className="w-4 shrink-0" />

              <div className="flex-1 h-2 bg-gray-10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gray-11/30"
                  style={{ width: `${ghostWidth}%` }}
                />
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}