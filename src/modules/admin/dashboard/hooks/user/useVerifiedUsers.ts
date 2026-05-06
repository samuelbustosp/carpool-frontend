'use client'

import { getVerifiedUsers } from "@/services/admin/stats/adminStatsService";
import { useEffect, useState } from "react";
import { VerifiedUserDTO } from "../../types/dto/verifiedUsersResponse";


export function useVerifiedUsers() {
  const [data, setData] = useState<VerifiedUserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerifiedUsers = async () => {
    setLoading(true);
    setError(null);

    const res = await getVerifiedUsers();

    if (res.state === "ERROR") {
      setError(res.messages?.[0] || "Error inesperado");
      setData(null);
    } else {
      setData(res.data ?? null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchVerifiedUsers();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchVerifiedUsers
  };
}