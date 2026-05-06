export default function DashboardSeparator({
  title,
  desc
}: {
  title: string
  desc?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2 w-full">
        <h2 className="text-sm text-gray-1 whitespace-nowrap">
          {title}
        </h2>

        <div className="flex-1 h-px bg-linear-to-r from-gray-2/80 to-transparent" />
      </div>
    

      {desc && 
        <p className="text-xs font-light text-gray-11/80">
          {desc}
        </p>
      }
    </div>
  )
}