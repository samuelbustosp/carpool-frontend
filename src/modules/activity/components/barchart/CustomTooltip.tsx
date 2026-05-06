import { formatPrice } from "@/shared/utils/number"
import { TooltipProps } from "recharts"

type TooltipPayloadData = {
  label: string
  tooltipLabel: string
  value: number
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  unit: string
  payload?: Array<{
    payload: TooltipPayloadData
  }>
}

export default function CustomTooltip({
  active,
  payload,
  unit,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const item = payload[0].payload

  return (
    <div className="bg-gray-8/98 border border-gray-7 rounded-xl p-3">
      <p className="text-xs text-gray-11">
        {item.tooltipLabel}
      </p>

      {unit === 'pesos' ? 
        <p className="text-sm font-medium text-white">
          ${formatPrice(item.value)} <span className="text-xs">ARS</span>
        </p>
      :
        <p className="text-sm font-medium text-white">
          {Number.isInteger(item.value)
            ? item.value
            : item.value.toFixed(2)}{" "}
          {unit}
        </p>
      }
      
    </div>
  )
}