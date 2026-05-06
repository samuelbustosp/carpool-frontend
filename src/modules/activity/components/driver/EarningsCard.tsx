'use client'

import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/shared/utils/number"
import { AlertCircle, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"

interface EarningsProps {
  total: number
  loading: boolean
  error: string | null
}

export default function EarningsCard({
  total,
  loading,
  error
}: EarningsProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (loading) {
      setDisplayValue(0)
      return
    }

    let start = 0
    const duration = 1500
    const steps = 60
    const increment = total / steps
    const intervalTime = duration / steps

    const interval = setInterval(() => {
      start += increment

      if (start >= total) {
        setDisplayValue(total)
        clearInterval(interval)
      } else {
        setDisplayValue(start)
      }
    }, intervalTime)

    return () => clearInterval(interval)
  }, [total, loading])

  return (
    <Card className="bg-gray-8 border-gray-2/50 rounded-3xl">
      <CardContent className="px-8 py-4">
        <div className="flex items-center gap-2 text-success/85 mb-3">
          <DollarSign size={20} />
          <span className="text-sm uppercase tracking-[0.2em] text-gray-11">
            Ganancias Acumuladas
          </span>
        </div>

        {error ? (
          <div className="">
            <h1 className="flex items-center gap-2 text-lg font-semibold text-white/95">
              <span className="text-gray-11 flex items-center">
                <AlertCircle size={16} />
              </span>
              Lo sentimos, no se pudo cargar
            </h1>

            <p className="text-sm text-gray-11 mt-2">
              {error}
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
              ${formatPrice(displayValue)} <span className="text-2xl md:text-3xl">ARS</span>
            </h1>

            <p className="text-gray-11 mt-2 text-sm">
              Total generado por compartir viajes como conductor
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}