'use client'

import { Toast } from "@/components/ux/Toast";
import { TripDriverDTO } from "@/modules/driver-trips/types/tripDriver";
import { getHistoryTripUser, getMyTrips } from "@/services/trip/tripService";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { TripHistoryUserDTO } from "../types/TripHistoryUserDTO";
import { TripDriverList } from "./driver/TripDriverList";
import { TripPassengerList } from "./passenger/TripPassengerList";
import RoleSelectorHeader from "@/components/ux/RoleSelectorHeader";
import { TripDriverCardSkeleton } from "./driver/TripDriverCardSkeleton";

export default function TripHistory() { 
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const role = searchParams.get("role") ?? "passenger";

  const [driverTrips, setDriverTrips] = useState<TripDriverDTO[]>([]);

  const [passengerTrips, setPassengerTrips]=useState<TripHistoryUserDTO[]>([])

  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'success', cancel?:boolean } | null>(null);

  const skipRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 10;
  const loadingRef = useRef(false);

  const handleChangeRole = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", value);
    // Resetear equipaje al cambiar de tab si quisieras (opcional), sino lo dejas
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const fetchTrips = useCallback(async (reset = false) => {
    if (!hasMoreRef.current && !reset) return;
    if (loadingRef.current) return; 
    try {
      loadingRef.current = true;
      if (reset) {
        setInitialLoading(true); 
      } else {
        setLoadingMore(true);
      }
      const currentSkip = reset ? 0 : skipRef.current;
      if (reset) {
        skipRef.current = 0;
        hasMoreRef.current = true;
      }
      if (role === 'driver') {
        const response = await getMyTrips(currentSkip, ["CREATED", "CLOSED", "FINISHED"]);
        if (response.state === 'OK') {
          const newTrips = response.data?.trips ?? [];
          if (reset) {
            setDriverTrips(newTrips);
          } else {
            setDriverTrips(prev => [...prev, ...newTrips]);
          }
          if (newTrips.length < LIMIT) {
            hasMoreRef.current = false;
          } else {
            skipRef.current = currentSkip + LIMIT;
          }
        } else {
          hasMoreRef.current = false;
          setToast({ message: response.messages[0] ?? 'No se han podido recuperar los viajes del chofer.', type: 'error' });
          if (reset) setDriverTrips([]);
        }
      }

      if (role === 'passenger') {
        const response = await getHistoryTripUser(currentSkip, ["COMPLETED"]);
        if (response.state === 'OK') {
          const newTrips = response.data?.trips ?? [];
          if (reset) {
            setPassengerTrips(newTrips);
          } else {
            setPassengerTrips(prev => [...prev, ...newTrips]);
          }
          if (newTrips.length < LIMIT) {
            hasMoreRef.current = false;
          } else {
            skipRef.current = currentSkip + LIMIT;
          }
        } else {
          hasMoreRef.current = false;
          setToast({ message: response.messages[0] ?? 'No se han podido recuperar los viajes del pasajero.', type: 'error' });
          if (reset) setPassengerTrips([]);
        }
      }
    } catch (error) {
      hasMoreRef.current = false;
      const message = error instanceof Error ? error.message : "Error desconocido";
      setToast({ message, type: 'error' })
      console.error('Error al obtener viajes:', error);
    } finally {
      loadingRef.current = false;
      setInitialLoading(false);
      setLoadingMore(false);
    }
  },[role])

  useEffect(() => {
    setDriverTrips([]);
    setPassengerTrips([]);
    fetchTrips(true);
  }, [role]);
  
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingRef.current && hasMoreRef.current) {
        fetchTrips();
      }
    });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchTrips, loadingMore, initialLoading]);

  return(
    <div className="w-full">
      <RoleSelectorHeader
        title="Historial de viajes"
        description= {
          role == 'driver' ? 
            "Acá podés ver tus viajes realizados y los que están por comenzar." 
          : 
            "Acá podés ver tus viajes realizados."}
        role={role}
        onChangeRole={handleChangeRole}
      />

    {initialLoading &&
    Array.from({ length: 3 }).map((_, index) => (
      <TripDriverCardSkeleton key={index} />
    ))
    }

  {role === 'driver' && !initialLoading && (
    <TripDriverList
      trips={driverTrips}
      onError={(message) => setToast({ message, type: 'error' })}
      onSuccess={(message) => {
        setToast({ message, type: 'success', cancel: true })
      }}
    />
  )}

  {role === 'passenger' && !initialLoading && (
    <TripPassengerList
      trips={passengerTrips}
      onError={(message) => setToast({ message, type: 'error' })}
      onSuccess={(message) => setToast({ message, type: 'success' })}
    />
  )}

  {/* Skeleton al cargar más — abajo, junto al loader */}
  {loadingMore && <TripDriverCardSkeleton />}

  <div ref={loaderRef} className="h-1" />

    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => {
          setToast(null);

          if (toast.cancel) {
            fetchTrips(true); 
          }
        }}
      />
    )}
    </div>
  );
}