'use client'

import { getNewUsers } from "@/services/admin/stats/adminStatsService"
import { useEffect, useState } from "react"
import { AdminStatSimpleDTO } from "../../types/dto/adminStatSimpleResponse"

export function useNewUsersChart(
  fromDate: string,
  toDate: string,
  groupBy: string,
) {
  const [data, setData] = useState<AdminStatSimpleDTO | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)

    try {
      
      const res = await getNewUsers(fromDate, toDate, groupBy)

      if (
        res.state === "ERROR" 
      ) {
        setError(
          res.messages?.[0] ||
          "Error al obtener estadísticas"
        )
        return
      }

      setData(res.data ?? null)
    } catch {
      setError("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fromDate && toDate) {
      fetchAll()
    }
  }, [
    fromDate,
    toDate,
    groupBy
  ])

  return {
    data,
    loading,
    error,
    refetch: fetchAll,
  }
}