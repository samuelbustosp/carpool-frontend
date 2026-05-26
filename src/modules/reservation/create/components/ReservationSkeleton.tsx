import Separator from "@/components/ux/Separator";

export function ReservationSkeleton({
  variant,
}: {
  variant?: "DRIVER" | "PASSENGER"
}) {
  return (
    <div className="mb-4 p-4 border border-gray-2 rounded-xl shadow-sm animate-pulse">
      {/* Header */}
      <div className="flex items-start w-full justify-between">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gray-7" />

          <div className="flex flex-col gap-1">
            {variant === "PASSENGER" && (
              <div className="h-2 w-16 rounded bg-gray-7" />
            )}

            <div className="h-4.5 w-36 rounded bg-gray-7" />

            <div className="h-4 w-14 rounded bg-gray-7" />
          </div>
        </div>

        <div className="h-6 w-24 rounded-xl bg-gray-7" />
      </div>

      {/* Trip info */}
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <div className="h-3 w-10 rounded bg-gray-7" />
            <div className="h-4 w-24 rounded bg-gray-7" />
          </div>

          <div className="w-6 h-6 rounded-full bg-gray-7" />

          <div className="flex flex-col gap-1">
            <div className="h-3 w-10 rounded bg-gray-7" />
            <div className="h-4 w-24 rounded bg-gray-7" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-7" />
          <div className="h-4 w-24 rounded bg-gray-7" />
        </div>
      </div>

      {/* Actions */}
      <div>
        <Separator color="bg-gray-2" marginY="my-2" />

        <div className="flex justify-end gap-4">
          {variant === "DRIVER" ? (
            <>
              <div className="h-7 w-24 rounded-lg bg-gray-7" />
              <div className="h-7 w-24 rounded-lg bg-gray-7" />
            </>
          ) : (
            <div className="h-7 w-32 rounded-lg bg-gray-7" />
          )}
        </div>
      </div>
    </div>
  )
}