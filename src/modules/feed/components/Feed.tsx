'use client'
import { useCallback, useEffect, useRef, useState } from "react"
import TripList from "./TripList";
import { getInitialFeed } from "@/services/trip/tripService";
import TripSkeleton from "./TripSkeleton";
import { useAuth } from "@/contexts/authContext";
import { useGeocode } from "../hooks/useGeocode";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { City } from "@/models/city";
import { SearchData } from "@/modules/search/types/search";
import { Toast } from "@/components/ux/Toast";

export default function Feed() {
  const { user } = useAuth()
  const { city, detectUserCity } = useGeocode();
  const { requestPermission } = useNotifications();
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [feed, setFeed] = useState<SearchData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const LIMIT = 10;
  const skipRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const loadingRef = useRef(false);
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    const initNotifications = async () => {

      if (typeof window === "undefined" || !("Notification" in window)) return;

      try {
        if (Notification.permission === 'default') {
          await requestPermission();
        }
      } catch (error) {
        console.warn('No se pudieron registrar las notificaciones:', error);
      }
    };
    initNotifications();
  }, [requestPermission]);

  useEffect(() => {
    if (!user) return;
    detectUserCity();
  }, [user]);

  useEffect(() => {
    if (!city) return;
    setCurrentCity(city);
    loadFeed(true);
  }, [city]);

  const loadFeed = useCallback(async (reset = false) => {
    try{
      if (!hasMoreRef.current && !reset) return;
      loadingRef.current = true;
      setLoading(true);
  
      const currentSkip = reset ? 0 : skipRef.current;
      if (reset) {
        skipRef.current = 0;
        hasMoreRef.current = true;
      }
  
      const response = await getInitialFeed(currentSkip, city?.id);
      const newTrips = response.data ?? [];
  
      if (reset) {
        setFeed(newTrips);
      } else {
        setFeed(prev => [...(prev ?? []), ...newTrips]);
      }
  
      if (newTrips.length < LIMIT) {
        hasMoreRef.current = false;
      } else {
        skipRef.current += LIMIT;
      }
    }catch(error:unknown){
      hasMoreRef.current = false;
      if (error instanceof Error) {
        setToast({message: error.message, type: 'error'})
      } else {
        setToast({message: 'Ocurrió un error inesperado', type: 'error'})
      }
    }finally{
      loadingRef.current = false;
      setLoading(false);
      setInitialized(true);
    }

  }, [city]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingRef.current && hasMoreRef.current) {
        loadFeed();
      }
    });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadFeed]);

  if (!user || !initialized) {
    return (
      <div className="w-full">
        {Array.from({ length: 3 }).map((_, i) => <TripSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Skeleton inicial: antes de cualquier carga */}
      {!initialized && loading &&
        Array.from({ length: 3 }).map((_, i) => <TripSkeleton key={i} />)
      }

      {/* Lista: solo cuando ya inicializó */}
      {initialized && (
        <TripList feed={feed ?? []} currentCity={currentCity?.name} loading={loading} />
      )}

      {/* Skeleton de paginación */}
      {initialized && feed !== null && feed.length > 0 && loading && <TripSkeleton />}

      <div ref={loaderRef} className="h-1" />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}