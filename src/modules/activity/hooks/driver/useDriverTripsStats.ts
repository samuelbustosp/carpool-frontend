'use client'

import { useEffect, useState } from "react";
import { PassengerStat } from "../../types/PassengerStat";
import { getDriverTripsStats } from "@/services/stats/driverStatsService";

export function useDriverTripsStats(
  fromDate: string,
  toDate: string,
  orderBy: string
) {
  const [data, setData] = useState<PassengerStat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    const res = await getDriverTripsStats(fromDate, toDate, orderBy);

    if (res.state === "ERROR") {
      setError(res.messages?.[0] || "Error");
      setData(null);
    } else {
      setData(res.data ?? null);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (fromDate && toDate) {
      fetchStats();
    }
  }, [fromDate, toDate, orderBy]);

  return {
    data,
    loading,
    error,
    refetch: fetchStats,
  };
}