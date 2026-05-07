'use client';

import { fetchCityById } from "@/services/city/cityService";
import { getTrips } from "@/services/trip/tripService";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import TripSkeleton from "@/modules/feed/components/TripSkeleton";
import CitySearch from "./CitySearch";
import FilterBar from "./FilterBar";
import { SearchData } from "../types/search";
import { TripFilters } from "@/models/trip";
import { City } from "@/models/city";
import TripList from "@/modules/feed/components/TripList";
import { Toast } from "@/components/ux/Toast";

export default function Results() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);

  // Inicializamos desde URL
  const originParam = searchParams.get("origin");
  const destinationParam = searchParams.get("destination");
  const departureDateParam = searchParams.get("departureDate");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const orderByRatingParam = searchParams.get("orderByDriverRating");

  // Ciudades seleccionadas
  const [originCityId, setOriginCityId] = useState<number | null>(originParam ? Number(originParam) : null);
  const [destinationCityId, setDestinationCityId] = useState<number | null>(destinationParam ? Number(destinationParam) : null);

  // Feed
  const [feed, setFeed] = useState<SearchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [originCity, setOriginCity] = useState<City | null>();
  const [destinationCity, setDestinationCity] = useState<City | null>();

  // Filtros
  const [departureDate, setDepartureDate] = useState<string | undefined>(departureDateParam ?? undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(minPriceParam ? Number(minPriceParam) : undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(maxPriceParam ? Number(maxPriceParam) : undefined);
  const maxSeatPrice = feed.length > 0
    ? Math.max(...feed.map(item => item.seatPrice))
    : 10000;
  const [orderByDriverRating, setOrderByDriverRating] = useState(orderByRatingParam === "true");

  const LIMIT = 10;
  const skipRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  
  const fetchTrips = useCallback(async (reset = false) => {
    if (!originCityId || !destinationCityId) return;
    if (!hasMoreRef.current && !reset) return;

    try {
      loadingRef.current = true;
      setLoading(true)

      const currentSkip = reset ? 0 : skipRef.current;
      if (reset) {
        skipRef.current = 0;
        hasMoreRef.current = true;
      }

      const filters: TripFilters = {
        originCityId,
        destinationCityId,
      };
      if (departureDate) filters.departureDate = departureDate;
      if (minPrice !== undefined) filters.minPrice = minPrice;
      if (maxPrice !== undefined) filters.maxPrice = maxPrice;
      if (orderByDriverRating) filters.orderByDriverRating = orderByDriverRating;

      const res = await getTrips(filters, currentSkip);

      if (reset) {
        const responseOriginCity = await fetchCityById(originCityId);
        const responseDestinationCity = await fetchCityById(destinationCityId);
        setOriginCity(responseOriginCity.data);
        setDestinationCity(responseDestinationCity.data);
      }

      const newTrips = res.data ?? [];

      if (reset) {
        setFeed(newTrips);
      } else {
        setFeed(prev => [...(prev ?? []), ...newTrips]);
      }
      if (newTrips.length < LIMIT) {
        hasMoreRef.current = false;
      } else {
        skipRef.current = currentSkip + LIMIT;
      }

    } catch (error) {
      hasMoreRef.current = false;
      if (error instanceof Error) {
        setToast({message: error.message, type: 'error'})
        setFeed([])
      } else {
        setToast({message: 'Ocurrió un error inesperado', type: 'error'})
        setFeed([])
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [
    originCityId,
    destinationCityId,
    departureDate,
    minPrice,
    maxPrice,
    orderByDriverRating,
  ]);

  // --- Cada vez que cambien filtros o ciudades ---
  useEffect(() => {
    if (!originCityId || !destinationCityId) return;

    setFeed([])
    fetchTrips(true);

    const queryParams = new URLSearchParams();
    queryParams.set("origin", originCityId.toString());
    queryParams.set("destination", destinationCityId.toString());
    if (departureDate) queryParams.set("departureDate", departureDate);
    if (minPrice !== undefined) queryParams.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined) queryParams.set("maxPrice", maxPrice.toString());
    if (orderByDriverRating) queryParams.set("orderByDriverRating", orderByDriverRating.toString());

    router.replace(`/search/results?${queryParams.toString()}`);
  }, [originCityId, destinationCityId, departureDate, minPrice, maxPrice, orderByDriverRating, router, fetchTrips]);


  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingRef.current && hasMoreRef.current) {
        fetchTrips();
      }
    });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchTrips]);

  // --- Limpiar filtros ---
  const clearFilters = () => {
    setDepartureDate(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setOrderByDriverRating(false);

    const queryParams = new URLSearchParams();
    if (originCityId) queryParams.set("origin", originCityId.toString());
    if (destinationCityId) queryParams.set("destination", destinationCityId.toString());

    router.replace(`/search/results?${queryParams.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <CitySearch
          originCity={originCityId}
          destinationCity={destinationCityId}
          setOriginCity={setOriginCityId}
          setDestinationCity={setDestinationCityId}
        />
      </div>

      <FilterBar
        selectedDate={departureDate}
        onDateChange={(date) => {
          if (!date) { setDepartureDate(undefined); return; }
          const normalized = new Date(date);
          normalized.setHours(0, 0, 0, 0);
          setDepartureDate(normalized.toISOString().slice(0, 10));
        }}
        minPrice={minPrice}
        maxPrice={maxPrice}
        maxSeatPrice={maxSeatPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        sortByRating={orderByDriverRating}
        setSortByRating={setOrderByDriverRating}
        onClearFilters={clearFilters}
      />

      {feed.length === 0 && loading && (
        <>
          {Array.from({ length: 2 }).map((_, i) => <TripSkeleton key={i} />)}
        </>
      )}

      <TripList feed={feed} originSearch={originCity} destinationSearch={destinationCity} loading={loading} />

      {feed.length > 0 && loading && <TripSkeleton />}

      <div ref={loaderRef} className="h-1" />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
