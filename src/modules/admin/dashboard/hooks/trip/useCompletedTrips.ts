'use client'

import { getCompletedTrips } from "@/services/admin/stats/adminStatsService";
import { useEffect, useState } from "react";
import { AdminStatSimpleDTO } from "../../types/dto/adminStatSimpleResponse";

export function useCompletedTrips(
  fromDate: string,
  toDate: string,
  previousFromDate: string,
  previousToDate: string
) {
  const [filtered, setFiltered] = useState<AdminStatSimpleDTO | null>(null);
  const [previousPeriod, setPreviousPeriod] = useState<AdminStatSimpleDTO | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const [filteredRes, previousRes] = await Promise.all([
        getCompletedTrips(fromDate, toDate),
        getCompletedTrips(previousFromDate, previousToDate),
      ]);

      if (
        filteredRes.state === 'ERROR' ||
        previousRes.state === 'ERROR'
      ) {
        setError(
          filteredRes.messages?.[0] ||
          previousRes.messages?.[0] ||
          "Error al obtener estadísticas"
        );
        return;
      }

      setFiltered(filteredRes.data ?? null);
      setPreviousPeriod(previousRes.data ?? null);
    } catch {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      fromDate &&
      toDate &&
      previousFromDate &&
      previousToDate
    ) {
      fetchAll();
    }
  }, [fromDate, toDate, previousFromDate, previousToDate]);

  const delta =
    filtered && previousPeriod
      ? filtered.totalFiltered - previousPeriod.totalFiltered
      : null;

  return {
    filtered,
    previousPeriod,
    delta,
    loading,
    error,
    refetch: fetchAll,
  };
}