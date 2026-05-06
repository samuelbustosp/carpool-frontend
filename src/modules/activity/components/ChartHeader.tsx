import {LucideIcon } from "lucide-react"

export interface ChartHeaderProps {
  title: string
  desc?: React.ReactNode | string
  icon: LucideIcon
}
export default function ChartHeader({
  title,
  desc,
  icon: Icon,
}: ChartHeaderProps) {
  return(
    <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-9/20">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gray-10/60 border border-gray-9/20 rounded-xl">
          <Icon size={18} />
        </div>
        <div className="">
          <h2 className="font-semibold text-base leading-tight">
            {title}
          </h2>
          {desc && 
            <p className="text-xs text-gray-11 ">
              {desc}
            </p>}
        </div>
      </div>
    </div>
  )
}