'use client'

import { getTopDestinationCities, getTopOriginCities } from "@/services/admin/stats/adminStatsService";
import { useEffect, useState } from "react";
import { TopCityStatResponseDTO } from "../../types/dto/topCityStatResponse";


export function useTopOrigin(limitOrigin:number, limitDestination:number) {
  const [topOrigin, setTopOrigin] = useState<TopCityStatResponseDTO | null>();
  const [topDestination, setTopDestination] = useState<TopCityStatResponseDTO | null>();
  const [originLoading, setOriginLoading] = useState(true);
  const [destinationLoading, setdestinationLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopOrigin = async () => {
    setOriginLoading(true);
    setError(null);

    const res = await getTopOriginCities(limitOrigin);

    if (res.state === "ERROR") {
      setError(res.messages?.[0] || "Error inesperado");
      setTopOrigin(null);
    } else {
      setTopOrigin(res.data ?? null);
    }

    setOriginLoading(false);
  };

  const fetchTopDestination = async () => {
    setdestinationLoading(true);
    setError(null);

    const res = await getTopDestinationCities(limitDestination);

    if (res.state === "ERROR") {
      setError(res.messages?.[0] || "Error inesperado");
      setTopDestination(null);
    } else {
      setTopDestination(res.data ?? null);
    }

    setdestinationLoading(false);
  };

  
  useEffect(() => {
    fetchTopOrigin();
  }, [limitOrigin]);

  useEffect(() => {
    fetchTopDestination();
  }, [limitDestination]);

  return {
    topOrigin,
    topDestination,
    originLoading,
    destinationLoading,
    error,
    refetch: fetchTopOrigin
  };
}