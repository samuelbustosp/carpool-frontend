'use client'

import { ErrorAlert } from "@/components/ux/admin/ErrorAlert"
import { capitalizeWords } from "@/shared/utils/string"
import { LucideIcon, OctagonX, TrendingUp, Trophy } from "lucide-react"
import { TopCityStat } from "../../types/topCity"
import TopCitySkeleton from "../skeletons/TopCitySkeleton"
import { LIMIT_OPTIONS } from "@/constants/stats"

interface TopCityCardProps {
  title: string
  desc: string
  cities: TopCityStat[]
  loading: boolean
  error: string | null
  icon: LucideIcon
  limit?: number
  onLimitChange?: (limit: number) => void
}

export function TopCityCard({
  title,
  desc,
  cities,
  loading,
  error,
  icon: Icon,
  limit = 5,
  onLimitChange,
}: TopCityCardProps) {
  const visibleCities = cities.slice(0, limit)
  const maxReservations = visibleCities[0]?.reservationCount || 1
  const ghostCount = Math.max(0, limit - visibleCities.length)

  return (
    <div className="bg-gray-8 rounded-2xl overflow-hidden h-93.5 border border-gray-9/20 flex flex-col">
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-2/40">
          <div className="p-2.5 bg-gray-10/60 border border-gray-9/20 rounded-xl">
            <Icon size={18} className="text-gray-11" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base leading-tight">{title}</h2>
            {!loading && !error && cities.length > 0 && (
              <p className="text-xs text-gray-11 mt-0.5">{desc}</p>
            )}
          </div>

          {/* Limit selector */}
          {onLimitChange && (
            <div className="flex items-center gap-1 shrink-0">
              <Trophy size={14} className="mr-1 text-amber-400/80" />
              <p className="text-xs mr-1">TOP</p>
              {LIMIT_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => onLimitChange(option)}
                  className={`
                    h-6 w-7 cursor-pointer rounded-md text-xs font-medium transition-all duration-150
                    ${
                      limit === option
                        ? "bg-gray-10 text-amber-400/80 border border-gray-9/40"
                        : "text-gray-11 hover:text-gray-12 hover:bg-gray-10/50"
                    }
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className={`px-5 py-4 flex flex-col justify-start flex-1`}>
          {loading ? (
            <TopCitySkeleton limit={limit}/>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <ErrorAlert
                icon={<OctagonX size={32} />}
                title="Ocurrió un error"
                description={error}
                variant="Y"
              />
            </div>
          ) : visibleCities.length === 0 ? (
            <p className="text-sm text-gray-11">No hay datos disponibles</p>
          ) : (
            <div className="space-y-4">
              {/* Real rows */}
              {visibleCities.map((city, index) => {
                const percentage = Math.round(
                  (city.reservationCount / maxReservations) * 100
                )
                const isTop = index === 0

                return (
                  <div key={`${city.cityName}-${index}`} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-xs font-mono shrink-0 w-4 text-right ${
                            isTop ? "text-white" : "text-gray-11"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <p
                          className={`text-sm truncate ${
                            isTop ? "text-white font-semibold" : "text-gray-12 font-medium"
                          }`}
                        >
                          {capitalizeWords(city.cityName)}
                        </p>
                        {isTop && (
                          <TrendingUp size={12} className="text-green-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-11 shrink-0 tabular-nums">
                        {city.reservationCount.toLocaleString()} viajes
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-4 shrink-0" />
                      <div className="flex-1 h-1.5 bg-gray-10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            isTop ? "bg-white" : "bg-gray-11/60"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-11/60 w-8 text-right tabular-nums">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Ghost rows */}
              {[...Array(ghostCount)].map((_, i) => {
                const ghostIndex = visibleCities.length + i
                // Widths decrecientes para que parezcan naturales
                const ghostWidth = Math.max(10, 45 - ghostIndex * 12)

                return (
                  <div key={`ghost-${i}`} className="space-y-4 opacity-25">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono shrink-0 w-4 text-right text-gray-11">
                          {ghostIndex + 1}
                        </span>
                        <div className="h-3 bg-gray-9/50 rounded w-24" />
                      </div>
                     
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-4 shrink-0" />
                      <div className="flex-1 h-1.5 bg-gray-10 rounded-full overflow-hidden">
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
          )}
        </div>
      </div>
    </div>
  )
}