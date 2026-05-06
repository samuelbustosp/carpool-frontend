export function BarChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col justify-end gap-2 animate-pulse">
      <div className="flex items-end justify-between h-full gap-2 px-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-9/40 rounded-md"
            style={{
              height: `${Math.random() * 60 + 20}%`,
              width: "100%",
            }}
          />
        ))}
      </div>

      <div className="flex justify-between px-2 mt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-2 w-6 bg-gray-3/40 rounded" />
        ))}
      </div>
    </div>
  )
}