'use client'

import { Tab } from "@/components/ux/Tab";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { BiError } from "react-icons/bi";

import FilterBar from "./FilterBar";
import TripReservationList from "./TripReservationList";

import { RESERVATION_TABS } from "@/constants/tabs/reservation";
import { useState } from "react";
import { ReservationSkeleton } from "../../create/components/ReservationSkeleton";
import { useTripReservations } from "../hooks/useTripReservations";

export default function TripReservations() {

  const router = useRouter();
  const pathname = usePathname();

  const { id } = useParams();

  const searchParams = useSearchParams();

  const [hasFilters, setHasFilters] = useState<boolean>(false);

  const state =
    searchParams.get("state") ?? "PENDING";

  const baggageParam =
    searchParams.get("baggage");

  const hasBaggage =
    baggageParam === "true"
      ? true
      : baggageParam === "false"
      ? false
      : undefined;

  const {
    reservationsList,
    initialLoading,
    fetchingMore,
    hasMore,
    error,
    handleLoadMore,
    refetch,
  } = useTripReservations({
    id,
    nameState: state,
    hasBaggage,
  });

  const handleChangeState = (value: string) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("state", value);

    router.replace(
      `${pathname}?${params.toString()}`,
      { scroll: false }
    );
  };

  const handleBaggageChange = (
    value: boolean | undefined
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value === undefined) {
      setHasFilters(false);

      params.delete("baggage");
    } else {
      setHasFilters(true);

      params.set("baggage", String(value));
    }

    router.replace(
      `${pathname}?${params.toString()}`,
      { scroll: false }
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 gap-4">
        <div className="bg-dark-1 rounded-lg p-3">
          <BiError size={32} />
        </div>

        <div className="border border-gray-6 h-12"></div>

        <div>
          <p className="text-lg font-medium leading-tight">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">

      <div className="mb-3">

        <h1 className="text-xl font-semibold mb-1">
          Reservas
        </h1>

        {reservationsList.length === 0 ? (
          <p className="font-inter text-sm">
            {state === "PENDING"
              ? "Todavía no hay solicitudes para este viaje."
              : "Aún no hay pasajeros confirmados para este viaje."}
          </p>
        ) : state === "PENDING" ? (
          <p className="font-inter text-sm">
            ¡Tenés interesados! Revisá quién quiere sumarse a tu viaje.
          </p>
        ) : (
          <p className="font-inter text-sm">
            ¡Equipo armado! Estos son los pasajeros que viajan con vos.
          </p>
        )}

      </div>

      <Tab
        value={state}
        onChange={handleChangeState}
        tabs={RESERVATION_TABS}
      />

      {initialLoading ? (
        <div className="flex gap-2 my-4">
          <div className="h-6 w-22 bg-gray-2 rounded-lg animate-pulse" />
          <div className="h-6 w-24 bg-gray-2 rounded-lg animate-pulse" />
        </div>
      ) : (
        <div className="mb-4 mt-4">
          <FilterBar
            hasBaggage={hasBaggage}
            setHasBaggage={handleBaggageChange}
          />
        </div>
      )}

      {initialLoading ? (

        <div className="w-full">
          {Array.from({ length: 2 }).map((_, i) => (
            <ReservationSkeleton variant="DRIVER" key={i} />
          ))}
        </div>

      ) : (

        <TripReservationList
          tripReservations={reservationsList}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoadingMore={fetchingMore}
          hasFilters={hasFilters}
          refetch={refetch}
          initialLoading={initialLoading}
        />

      )}
    </div>
  );
}