import { formatFilterLabel, formatFilterLabelPrevious, getPreviousRangeForFilter, getRangeForFilter } from "@/modules/activity/helpers/stats";
import { formatLocalDate } from "@/shared/utils/date";
import { formatPrice } from "@/shared/utils/number";
import { capitalize } from "@/shared/utils/string";
import { CircleDashed, Leaf, TrendingDown, TrendingUp } from "lucide-react";
import { DateRange } from "react-day-picker";
import { formatFixedDouble, formatPercentageDelta, getStatusDelta } from "../../helpers/stats";
import { useAppEarnings } from "../../hooks/general/useAppEarnings";
import { useTotalCO2 } from "../../hooks/general/useTotalCO2";
import { useTotalTransacted } from "../../hooks/general/useTotalTransacted";
import { StatCardSkeleton } from "../skeletons/StatCardSkeleton";
import StatCard from "../StatCard";

export interface SectionProps {
  filter: string
  customRange?: DateRange
}

export default function GeneralSection({filter, customRange}:SectionProps) {
  const { from: fromDate, to: toDate } =
    filter === "custom" && customRange?.from && customRange?.to
      ? {
          from: customRange.from,
          to: customRange.to,
        }
      : getRangeForFilter(filter)
  
  const {
    from: previousFromDate,
    to: previousToDate,
  } = getPreviousRangeForFilter(
    filter,
    fromDate,
    toDate
  )

  const {
    filtered: earningsFiltered,
    previousPeriod: earningsPreviousPeriod,
    delta: earningsDelta, 
    error: earningsError, 
    loading: earnignsLoading
  } = useAppEarnings(
    formatLocalDate(fromDate),
    formatLocalDate(toDate),
    formatLocalDate(previousFromDate),
    formatLocalDate(previousToDate),
  )

  const {
    filtered: transactedFiltered,
    previousPeriod: transactedPreviousPeriod,
    delta: transactedDelta, 
    error: transactedError, 
    loading: transactedLoading
  } = useTotalTransacted(
    formatLocalDate(fromDate),
    formatLocalDate(toDate),
    formatLocalDate(previousFromDate),
    formatLocalDate(previousToDate),
  )

  const {
    data: CO2Data, 
    error: CO2Error, 
    loading: CO2Loading
  } = useTotalCO2()

  const globalLoading = transactedLoading || earnignsLoading || CO2Loading

  if (globalLoading) {
    return(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCardSkeleton/>
        <StatCardSkeleton/>
        <StatCardSkeleton/>
      </div>
    )
  }

  const earningsStatus =  getStatusDelta(
    earningsDelta ?? 0, 
    earningsPreviousPeriod?.totalFiltered ?? 0
  ) 
  const earningsDeltaPercentage = formatPercentageDelta(
    earningsDelta ?? 0, 
    earningsPreviousPeriod?.totalFiltered ?? 0
  ) 
  
  const transactedStatus = getStatusDelta(
    transactedDelta ?? 0, 
    transactedPreviousPeriod?.totalFiltered ?? 0
  ) 
  const transactedDeltaPercentage = formatPercentageDelta(
    transactedDelta ?? 0, 
    transactedPreviousPeriod?.totalFiltered ?? 0
  ) 
  
  return (
    <div className="space-y-4 "> 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Ganancias recaudadas"
          value={`$${formatPrice(earningsFiltered?.totalFiltered ?? 0)} ARS`}
          description={capitalize(formatFilterLabel(filter))}
          icon={ 
            earningsStatus === 'increase' || 
            earningsStatus === 'new' ? (
              <TrendingUp size={18} />
            ) : earningsStatus === 'decrease' ? (
              <TrendingDown size={18} />
            ) : (
              <CircleDashed size={14} />
            )
          }
          trend={
            <span>
              <span className="font-medium">
                {earningsStatus === 'increase' || earningsStatus === 'new' ? '+' :  ''}
                {earningsStatus === 'new' ? 
                  `$${formatPrice(earningsDeltaPercentage)}` : 
                  `${earningsDeltaPercentage}%`}
              </span>
              {' '}
              {!globalLoading && formatFilterLabelPrevious(filter)}
            </span>
          }
          variant={earningsStatus}
          error={earningsError}
        />
        <StatCard
          title="Monto transaccionado"
          value={`$${formatPrice(transactedFiltered?.totalFiltered ?? 0)} ARS`}
          description={capitalize(formatFilterLabel(filter))}
          icon={
            transactedStatus === 'increase' || transactedStatus === 'new' ? (
              <TrendingUp size={18} />
            ) : transactedStatus === 'decrease' ? (
              <TrendingDown size={18} />
            ) : (
              <CircleDashed size={14} />
            )
          }
          trend={
            <span>
              <span className="font-medium">
                {transactedStatus === 'increase' || transactedStatus === 'new' ? '+' :  ''}
                {transactedStatus === 'new' ? 
                  `$${formatPrice(transactedDeltaPercentage)}` : 
                  `${transactedDeltaPercentage}%`}
              </span>
              {' '}
              {formatFilterLabelPrevious(filter)}
            </span>
          }
          variant={transactedStatus}
          error={transactedError}
        />
        <StatCard
          title="Impacto ambiental"
          value={`${formatFixedDouble(CO2Data?.totalC02Saved ?? 0)} kg`}
          description="Total estimado de CO₂ ahorrado"
          icon={<Leaf size={14} />}
          variant={'increase'}
          error={CO2Error}
        />
      </div>
    </div>
  )
}