'use client'

import { AlertCircle } from "lucide-react"
import { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: ReactNode
  variant?: "default" | "increase" | "decrease" | "custom" | "new"
  error: string | null
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = "default",
  error,
}: StatCardProps) {
  return (
    <div className="bg-gray-8 rounded-2xl min-h-26">
      <div className="px-6 py-3 h-full flex flex-col justify-between gap-1">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base text-gray-11">
            {title}
          </h3>

          {!error && icon && (
            <div
              className={
                variant === "increase" || variant === "new"
                  ? "text-green-300"
                  : variant === "decrease"
                  ? "text-red-300"
                  : "text-gray-11/60"
              }
            >
              {icon}
            </div>
          )}
        </div>

        {/* Content */}
        {error ? (
          <div className="flex flex-1 items-center gap-2 text-sm text-red-400">
            <AlertCircle size={18} />
            <span>
              Ocurrió un error al traer las estadísticas
            </span>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {value}
            </div>

            {(description || trend) && (
              <div className="flex items-center justify-between text-xs text-gray-11 gap-2">
                <span className="truncate">
                  {description}
                </span>

                {trend && (
                  <div
                    className={
                      variant === "increase" || variant === "new"
                        ? "text-green-400 truncate"
                        : variant === "decrease"
                        ? "text-red-400 truncate"
                        : "text-gray-11 truncate"
                    }
                  >
                    {trend}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}