
export default function DriversPercentageSkeleton() {
  return(
    <div className="flex flex-col items-center gap-4 w-full animate-pulse">
      {/* Fake chart */}
      <div className="relative w-52 h-52 flex items-center justify-center">
        <div className="w-40 h-40 rounded-full border-20 border-gray-9/40" />
        <div className="absolute flex flex-col items-center">
          <div className="h-6 w-12 bg-gray-9/40 rounded mb-1" />
          <div className="h-3 w-16 bg-gray-9/40 rounded" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-9/40" />
            <div className="h-3 w-20 bg-gray-9/40 rounded" />
          </div>
        ))}
      </div>

      {/* Bottom stats */}
      <div className="w-full max-w-md mt-2 space-y-3">
        <div className="h-4 w-48 bg-gray-9/40 rounded" />

        <div className="flex gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center w-full rounded-2xl overflow-hidden bg-gray-2/40">
              
              {/* icon */}
              <div className="px-5 h-full bg-gray-9/30" />

              {/* content */}
              <div className="flex-1 px-2 py-2 space-y-1">
                <div className="h-3 w-16 bg-gray-9/40 rounded" />
                <div className="h-5 w-10 bg-gray-9/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}