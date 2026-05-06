'use client'

import { formatLocalDate } from "@/shared/utils/date";
import { Car, DollarSign, Route } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { formatChartData, getDynamicGroupBy, getRangeForFilter, GroupByType, mapFilterToOrderBy } from "../../helpers/stats";
import { useDriverCO2Stats } from "../../hooks/driver/useDriverCO2Stats";
import { useDriverKmStats } from "../../hooks/driver/useDriverKmStats";
import { useDriverTripsStats } from "../../hooks/driver/useDriverTripsStats";
import BarChartCard from "../barchart/BarChartCard";
import SavedCO2 from "../SavedCO2Card";
import { useDriverEarningsStats } from "../../hooks/driver/useDriverEarningsStats";
import { formatPrice } from "@/shared/utils/number";
import EarningsCard from "./EarningsCard";

export default function DriverActivity() {
  const [tripFilter, setTripFilter] = useState("month");
  const [tripCustomRange, setTripCustomRange] = useState<DateRange>()

  const [kmFilter, setKmFilter] = useState("month");
  const [kmCustomRange, setKmCustomRange] = useState<DateRange>()

  const [earningFilter, setEarningFilter] = useState("month");
  const [earningCustomRange, setEarningCustomRange] = useState<DateRange>()

  const [activeCard, setActiveCard] = useState(0)

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

  const { from: earningFrom, to: earningTo } =
  earningFilter === "custom" && earningCustomRange?.from && earningCustomRange?.to
    ? {
        from: earningCustomRange.from,
        to: earningCustomRange.to,
      }
    : getRangeForFilter(earningFilter)

  const earningGroupBy =
    earningFilter === "custom"
      ? getDynamicGroupBy(earningFrom, earningTo)
      : mapFilterToOrderBy(earningFilter)
 
  const { data: tripData, loading: loadingTrip, error: errorTrip } = useDriverTripsStats(
    formatLocalDate(tripFrom),  
    formatLocalDate(tripTo), 
    tripGroupBy.toUpperCase()
  );

  const { data: kmData, loading: loadingKm, error: errorKm } = useDriverKmStats(
    formatLocalDate(kmFrom),  
    formatLocalDate(kmTo), 
    kmGroupBy.toUpperCase()
  );

  const { data: earningData, loading: loadingEarning, error: errorEarning } = useDriverEarningsStats(
    formatLocalDate(earningFrom),  
    formatLocalDate(earningTo), 
    earningGroupBy.toUpperCase()
  );

  const {data: CO2Data, loading: loadingCO2, error: errorC02} = useDriverCO2Stats()

  const formattedTrips = formatChartData(
    tripData?.historialByPeriod,
    tripGroupBy as GroupByType
  )

  const formattedKm = formatChartData(
    kmData?.historialByPeriod,
    kmGroupBy as GroupByType
  )

  const formattedEarnings = formatChartData(
    earningData?.historialByPeriod,
    earningGroupBy as GroupByType
  )

  const cards = [
    <SavedCO2
      key="co2"
      totalSaved={Number(CO2Data?.totalCo2Saved) ?? 0}
      loading={loadingCO2}
      error={errorC02}
    />,
    <EarningsCard
      key="earnings"
      total={earningData?.historialTotal ?? 0}
      loading={loadingEarning}
      error={errorEarning}
    />
  ]

  const handleNext = () => {
    setActiveCard((prev) => (prev + 1) % cards.length)
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Card principal */}
        <div className="relative z-10">
          <button
            onClick={handleNext}
            className="w-full text-left cursor-pointer"
          >
            {cards[activeCard]}
          </button>
        </div>

        {/* Preview de la siguiente */}
        <div className="absolute top-3 left-0 right-0 z-0 scale-[0.98] opacity-40 pointer-events-none">
          {cards[(activeCard + 1) % cards.length]}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveCard(index)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                activeCard === index
                  ? "bg-white"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      <BarChartCard
        title="Ganancias obtenidas"
        desc={
          <>
            Generaste {" "}
            <span className="font-semibold">
              ${formatPrice(earningData?.historialTotal ?? 0)}
            </span>{" "}
            como conductor
          </>
        }
        icon={DollarSign}
        data={formattedEarnings ?? []}
        totalFiltered={earningData?.totalFiltered ?? 0}
        loading={loadingEarning}
        error={errorEarning}
        filter={earningFilter}
        onFilterChange={setEarningFilter}
        customRange={earningCustomRange}
        onCustomRangeChange={setEarningCustomRange}
        unit="pesos"
      />

      <BarChartCard
        title="Viajes realizados"
        desc={
          <>
            Fuiste conductor en {" "}
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