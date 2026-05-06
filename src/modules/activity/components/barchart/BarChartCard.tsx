'use client'

import { ErrorAlert } from "@/components/ux/admin/ErrorAlert"
import { EmptyAlertY } from "@/components/ux/EmptyAlert"
import { formatPrice } from "@/shared/utils/number"
import { ChartColumnDecreasing, LucideIcon, OctagonX } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatFilterLabel } from "../../helpers/stats"
import { Stat } from "../../types/Stat"
import ChartHeader from "../ChartHeader"
import ChartFilters from "../ChartFilters"
import { BarChartSkeleton } from "./BarChartSkeleton"
import CustomTooltip from "./CustomTooltip"

interface BarChartCardProps {
  title: string
  desc?: React.ReactNode
  icon: LucideIcon
  data: Stat[]
  totalFiltered: number
  loading: boolean
  error: string | null
  filter: string
  onFilterChange: (value: string) => void
  customRange?: DateRange
  onCustomRangeChange: (range: DateRange | undefined) => void
  unit?: string
}

export default function BarChartCard({ 
  title, 
  desc, 
  icon: Icon, 
  data, 
  totalFiltered,
  loading,
  error,
  filter, 
  onFilterChange,
  customRange,
  onCustomRangeChange,
  unit = 'viajes', 
}: BarChartCardProps) {

  const isSingleBar = data.length === 1

  return (
    <div className="bg-gray-8 border border-gray-2/50 rounded-2xl h-full flex flex-col">
      
        <ChartHeader
          title={title}
          desc={desc}
          icon={Icon}
        />

        <div className="mt-4">
          <ChartFilters
            selected={filter}
            onChange={onFilterChange}
            range={customRange}
            onRangeChange={onCustomRangeChange}
          />
        </div>

        <div className="h-60  py-2 px-5 mt-4 transition-all duration-300 [&_*:focus]:outline-none [&_*:focus]:ring-0">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <BarChartSkeleton />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <ErrorAlert
                icon={<OctagonX size={32} />}
                title="Ocurrió un error"
                description={error}
                variant="Y"
              />
            </div>
          ) : data.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <EmptyAlertY
                icon={<ChartColumnDecreasing size={32} />}
                title="No hay datos para mostrar"
                description={`No se encontraron estadísticas para 
                  ${filter === '7d' ? 'los ' : 'el '}${formatFilterLabel(filter)}.`
                }
              />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                key={filter}
                data={data}
                margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                barCategoryGap="15%"
              >
                <XAxis
                  dataKey="label"
                  stroke="#c9c9c9"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  padding={{
                    left: isSingleBar ? 80 : 0,
                    right: isSingleBar ? 80 : 0,
                  }}
                />

                <YAxis
                  stroke="#c9c9c9"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.05)]}
                />

                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  content={<CustomTooltip unit={unit} />}
                />

                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  fill="#ffffff"
                  barSize={isSingleBar ? 80 : undefined}
                  isAnimationActive
                  animationDuration={450}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          )} 
        </div>
        <div className="mt-2 px-5 text-center flex items-center justify-between mb-2">
          <p className="text-sm text-gray-11">
            Total {filter === '7d' ? 'en los ' : 'en el '}{formatFilterLabel(filter)}
          </p>
  
            {unit === 'pesos' ? 
              <p className="font-semibold text-white">
                ${formatPrice(totalFiltered)} <span className="text-sm">ARS</span>
              </p>
            :
              <p className="font-semibold text-white">
                {Number.isInteger(totalFiltered)
                ? totalFiltered
                : totalFiltered.toFixed(2)} {unit}
              </p>
            }
        </div>
    </div>
  )
}