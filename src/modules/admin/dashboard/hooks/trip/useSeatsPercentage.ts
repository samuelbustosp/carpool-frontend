'use client'

import { getSeatsPercentage } from "@/services/admin/stats/adminStatsService";
import { useEffect, useState } from "react";
import { TakenSeatsStatResponseDTO } from "../../types/dto/takenSeatsStatResponse";

export function useSeatsPercentage(
  fromDate: string,
  toDate: string,
  previousFromDate: string,
  previousToDate: string
) {
  const [filtered, setFiltered] = useState<TakenSeatsStatResponseDTO | null>(null);
  const [previousPeriod, setPreviousPeriod] = useState<TakenSeatsStatResponseDTO | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const [filteredRes, previousRes] = await Promise.all([
        getSeatsPercentage(fromDate, toDate),
        getSeatsPercentage(previousFromDate, previousToDate),
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
      ? filtered.takenPercentageFiltered - previousPeriod.takenPercentageFiltered
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