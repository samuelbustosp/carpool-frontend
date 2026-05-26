import { useCallback, useEffect, useState } from "react";
import { getReservations } from "@/services/reservation/reservationService";
import { ReservationDTO } from "@/modules/reservation/create/types/reservation";

interface UseTripReservationsProps {
  id?: string | string[];
  nameState: string;
  hasBaggage?: boolean;
  size?: number;
}

export function useTripReservations({
  id,
  nameState,
  hasBaggage,
  size = 5,
}: UseTripReservationsProps) {
  const [page, setPage] = useState(0);
  const [refetchCount, setRefetchCount] = useState(0);
  const [reservationsList, setReservationsList] = useState<
    ReservationDTO[]
  >([]);



  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Reset cuando cambian filtros
  useEffect(() => {
    setPage(0);
    setReservationsList([]);
    setHasMore(true);
    setInitialLoading(true);
  }, [id, nameState, hasBaggage]);

  const fetchTripReservations = useCallback(async () => {
    if (!id) return;

    try {
      if (page === 0) setInitialLoading(true);
      else setFetchingMore(true);

      const response = await getReservations(
        {
          idTrip: Number(id),
          nameState,
          baggage: hasBaggage,
        },
        size,
        page
      );

      if (response.state === "ERROR") {
        setError(response.messages[0]);
        return;
      }

      if (response.state === "OK" && response.data) {
        const newReservations =
          response.data.reservation || [];

        setHasMore(newReservations.length >= size);

        setReservationsList(prev =>
          page === 0
            ? newReservations
            : [...prev, ...newReservations]
        );
      }
    } catch (error) {
      console.error(
        "Error cargando las reservaciones:",
        error
      );

      setError(
        "Error de conexión al cargar reservas."
      );
    } finally {
      setInitialLoading(false);
      setFetchingMore(false);
    }
  }, [
    id,
    nameState,
    hasBaggage,
    size,
    page,
    refetchCount,
  ]);

  useEffect(() => {
    fetchTripReservations();
  }, [fetchTripReservations]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || fetchingMore || initialLoading) return;

    setPage(prev => prev + 1);
  }, [hasMore, fetchingMore, initialLoading]);


  const refetch = useCallback(() => {
    setInitialLoading(true);
    setReservationsList([]);
    setHasMore(true);
    setPage(0);
    setRefetchCount(prev => prev + 1);
  }, []);

  return {
    reservationsList,
    initialLoading,
    fetchingMore,
    hasMore,
    error,
    handleLoadMore,
    refetch,
  };
}