'use client'

import { getCO2Stats } from "@/services/stats/passengerStatsService";
import { useEffect, useState } from "react";
import { CO2Stat } from "../../types/CO2Stat";

export function useCO2Stats() {
  const [data, setData] = useState<CO2Stat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    
    setLoading(true);
    setError(null);

    const res = await getCO2Stats();

    if (res.state === "ERROR") {
      setError(res.messages?.[0] || "Error");
      setData(null);
    } else {
      setData(res.data ?? null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchStats,
  };
}