'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Leaf, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface SavedCO2Props {
  totalSaved: number
  loading: boolean
  error: string | null
}

export default function SavedCO2({
  totalSaved,
  loading,
  error
}: SavedCO2Props) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (loading || error) {
      setDisplayValue(0)
      return
    }

    let start = 0
    const duration = 1500
    const steps = 60
    const increment = totalSaved / steps
    const intervalTime = duration / steps

    const interval = setInterval(() => {
      start += increment

      if (start >= totalSaved) {
        setDisplayValue(totalSaved)
        clearInterval(interval)
      } else {
        setDisplayValue(start)
      }
    }, intervalTime)

    return () => clearInterval(interval)
  }, [totalSaved, loading, error])

  return (
    <Card className="bg-gray-8 border-gray-2/50 rounded-3xl">
      <CardContent className="px-8 py-4 min-h-33">
        <div className="flex items-center gap-2 text-success/85 mb-3">
          <Leaf size={20} />
          
          <span className="text-sm uppercase tracking-[0.2em] text-gray-11">
            Impacto Ambiental
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
              {displayValue.toFixed(2)}{" "}
              <span className="text-2xl md:text-3xl">kg</span>
            </h1>

            <p className="text-gray-11 mt-2 text-sm">
              Total estimado CO₂ ahorrado por compartir viajes.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}