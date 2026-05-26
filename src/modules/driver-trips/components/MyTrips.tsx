'use client'
import { useCallback, useEffect, useRef, useState } from "react";

import { getMyTrips } from "@/services/trip/tripService";

import TripSkeleton from "@/modules/feed/components/TripSkeleton";
import { BiError } from "react-icons/bi";
import { TripDriverDTO } from "../types/tripDriver";
import MyTripsList from "./MyTripsList";

const LIMIT = 10;

export default function MyTrips() {
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null)
    const [myTrips, setMyTrips] = useState<TripDriverDTO[]>([]);

    const skipRef = useRef(0);
    const hasMoreRef = useRef(true);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    const fetchMyTrips = useCallback(async (reset = false) => {
        if (!hasMoreRef.current && !reset) return;


        try{
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

            const response = await getMyTrips(currentSkip, ['CREATED', 'CLOSED']);

            if (response.state === "ERROR") {
                hasMoreRef.current = false;
                setError(response.messages[0]);
                return;
            }

            const newTrips = response.data?.trips ?? [];

            if (reset) {
                setMyTrips(newTrips);
            } else {
                setMyTrips(prev => [...prev, ...newTrips]);
            }

            if (newTrips.length < LIMIT) {
                hasMoreRef.current = false;
            } else {
                skipRef.current = currentSkip + LIMIT;
            }
            
        }catch(error){
            hasMoreRef.current = false;
            setError('Hubo un error inesperado al obtener los viajes.')
            console.error("Error cargando tus viajes:", error);
        }finally{
            setInitialLoading(false);
            setLoadingMore(false);
        }
    },[]);

    useEffect(() => {
        fetchMyTrips(true);
    }, []);

    useEffect(() => {
        if (!loaderRef.current) return;
        const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !loadingMore && !initialLoading && hasMoreRef.current) {
            fetchMyTrips();
        }
        });
        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [fetchMyTrips, loadingMore, initialLoading]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 gap-4">
        <div className="bg-dark-1 rounded-lg p-3">
          <BiError size={32} />
        </div>
        <div className="border border-gray-6 h-12"></div>
        <div>
          <p className="text-lg font-medium leading-tight">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {initialLoading ? (
        <div className="animate-pulse mb-6">
          <div className="h-6 w-72 bg-gray-2 rounded-md mb-2" />
          <div className="h-4 w-76 bg-gray-2 rounded" />
        </div>
      ) : (
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Administrá tus reservas</h1>
          <p className="font-inter text-sm">Seleccioná un viaje para ver sus solicitudes.</p>
        </div>
      )}

      {initialLoading &&
        Array.from({ length: 2 }).map((_, i) => <TripSkeleton key={i} />)
      }

      {!initialLoading && <MyTripsList myTrips={myTrips} />}

      {loadingMore && <TripSkeleton />}

      <div ref={loaderRef} className="h-1" />
    </div>
  )
}