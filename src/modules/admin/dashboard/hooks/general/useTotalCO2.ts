'use client'

import { getTotalCO2Saved } from "@/services/admin/stats/adminStatsService";
import { useEffect, useState } from "react";
import { AdminCO2StatDTO } from "../../types/dto/adminCO2Response";


export function useTotalCO2() {
  const [data, setData] = useState<AdminCO2StatDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalCO2Saved = async () => {
    setLoading(true);
    setError(null);

    const res = await getTotalCO2Saved();

    if (res.state === "ERROR") {
      setError(res.messages?.[0] || "Error inesperado");
      setData(null);
    } else {
      setData(res.data ?? null);
    }

    setLoading(false);
  };

  
  useEffect(() => {
    fetchTotalCO2Saved();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchTotalCO2Saved
  };
}