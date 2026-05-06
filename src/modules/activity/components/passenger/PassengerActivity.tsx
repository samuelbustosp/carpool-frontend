'use client'

import { Car, Route } from "lucide-react";
import { useState } from "react";
import BarChartCard from "../barchart/BarChartCard";
import SavedCO2 from "../SavedCO2Card";
import { DateRange } from "react-day-picker";
import { formatChartData, getDynamicGroupBy, getRangeForFilter, GroupByType, mapFilterToOrderBy } from "../../helpers/stats";
import { useCO2Stats } from "../../hooks/passenger/useCO2Stats";
import { useKmStats } from "../../hooks/passenger/useKmStats";
import { useTripsStats } from "../../hooks/passenger/useTripsStats";
import { formatLocalDate } from "@/shared/utils/date";

export default function PassengerActivity() {
  const [tripFilter, setTripFilter] = useState("month");
  const [tripCustomRange, setTripCustomRange] = useState<DateRange>()

  const [kmFilter, setKmFilter] = useState("month");
  const [kmCustomRange, setKmCustomRange] = useState<DateRange>()

  const { from: tripFrom, to: tripTo } =
  tripFilter === "custom" && tripCustomRange?.from && tripCustomRange?.to
    ? {
        from: tripCustomRange.from,
        to: tripCustomRange.to,
      }
    : getRangeForFilter(tripFilter)

  const tripGroupBy =
    tripFilter === "custom"
      ? getDynamicGroupBy(tripFrom, tripTo)
      : mapFilterToOrderBy(tripFilter)

  const { from: kmFrom, to: kmTo } =
    kmFilter === "custom" && kmCustomRange?.from && kmCustomRange?.to
      ? {
          from: kmCustomRange.from,
          to: kmCustomRange.to,
        }
      : getRangeForFilter(kmFilter)

  const kmGroupBy =
    kmFilter === "custom"
      ? getDynamicGroupBy(kmFrom, kmTo)
      : mapFilterToOrderBy(kmFilter)
 
  const { data: tripData, loading: loadingTrip, error: errorTrip } = useTripsStats(
    formatLocalDate(tripFrom),  
    formatLocalDate(tripTo), 
    tripGroupBy.toUpperCase()
  );

  const { data: kmData, loading: loadingKm, error: errorKm } = useKmStats(
    formatLocalDate(kmFrom),  
    formatLocalDate(kmTo), 
    kmGroupBy.toUpperCase()
  );

  const {data: CO2Data, loading: loadingCO2, error: errorCO2} = useCO2Stats()

  const formattedTrips = formatChartData(
    tripData?.historialByPeriod,
    tripGroupBy as GroupByType
  )
 

  const formattedKm = formatChartData(
    kmData?.historialByPeriod,
    kmGroupBy as GroupByType
  )

  return (
    <div className="space-y-6">
      <SavedCO2 
        totalSaved={Number(CO2Data?.totalCo2Saved) ?? 0}
        loading={loadingCO2}
        error={errorCO2}
      />

      <BarChartCard
        title="Viajes realizados"
        desc={
          <>
            Fuiste pasajero en {" "}
            <span className="font-semibold">
              {tripData?.historialTotal} viajes
            </span>{" "}
          </>
        }
        icon={Car}
        data={formattedTrips ?? []}
        totalFiltered={tripData?.totalFiltered ?? 0}
        loading={loadingTrip}
        error={errorTrip}
        filter={tripFilter}
        onFilterChange={setTripFilter}
        customRange={tripCustomRange}
        onCustomRangeChange={setTripCustomRange}
        unit="viajes"
      />

      <BarChartCard
        title="Kilómetros recorridos"
        desc={
          <>
            Recorriste un total de{" "}
            <span className="font-semibold">
              {(kmData?.historialTotal)?.toFixed(2)} kilómetros
            </span>{" "}
          </>
        }
        icon={Route}
        data={formattedKm ?? []}
        totalFiltered={kmData?.totalFiltered ?? 0}
        loading={loadingKm}
        error={errorKm}
        filter={kmFilter}
        onFilterChange={setKmFilter}
        customRange={kmCustomRange}
        onCustomRangeChange={setKmCustomRange}
        unit="km"
      />
    </div>
  );
}