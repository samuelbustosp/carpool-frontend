'use client'

import BarChartCard from "@/modules/activity/components/barchart/BarChartCard"
import { formatChartData, formatFilterLabel, formatFilterLabelPrevious, getDynamicGroupBy, getPreviousRangeForFilter, getRangeForFilter, GroupByType, mapFilterToOrderBy } from "@/modules/activity/helpers/stats"
import { formatLocalDate } from "@/shared/utils/date"
import { formatPrice } from "@/shared/utils/number"
import { capitalize } from "@/shared/utils/string"
import { BadgeCheck, CircleDashed, CircleUserRound, TrendingDown, TrendingUp, User, Users } from "lucide-react"
import { useState } from "react"
import { DateRange } from "react-day-picker"
import { formatPercentageDelta, getStatusDelta } from "../../helpers/stats"
import { useDriversPercentage } from "../../hooks/user/useDriversPercentage"
import { useNewUsers } from "../../hooks/user/useNewUsers"
import { useVerifiedUsers } from "../../hooks/user/useVerifiedUsers"
import DashboardSeparator from "../DashboardSeparator"
import { SectionProps } from "../generals/GeneralSection"
import { StatCardSkeleton } from "../skeletons/StatCardSkeleton"
import StatCard from "../StatCard"
import DriversPercentage from "./DriversPercentage"
import ChartHeader from "@/modules/activity/components/ChartHeader"

export default function UserSection({filter, customRange}:SectionProps) {
  const [newUsersFilter, setNewUsersFilter] = useState("month");
  const [newUsersCustomRange, setNewUsersCustomRange] = useState<DateRange>()

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
  
  const { from: newUsersFrom, to: newUsersTo } =
    newUsersFilter === "custom" && newUsersCustomRange?.from && newUsersCustomRange?.to
      ? {
          from: newUsersCustomRange.from,
          to: newUsersCustomRange.to,
        }
      : getRangeForFilter(newUsersFilter)
      
  const newUsersGroupBy =
    filter === "custom"
      ? getDynamicGroupBy(newUsersFrom, newUsersTo)
      : mapFilterToOrderBy(filter)

  const newUsersChartGroupBy =
    newUsersFilter === "custom"
      ? getDynamicGroupBy(newUsersFrom, newUsersTo)
      : mapFilterToOrderBy(newUsersFilter)

  const { 
    filtered: usersFiltered,
    previousPeriod: usersPreviousPeriod,
    delta: usersDelta,
    error: usersError,
    loading: usersLoading
  } = useNewUsers(
    formatLocalDate(fromDate),
    formatLocalDate(toDate),
    newUsersGroupBy,
    formatLocalDate(previousFromDate),
    formatLocalDate(previousToDate),
  )

  const { 
    filtered: filteredChartUsers,
    error: errorChartUsers,
    loading: loadingChartUsers
  } = useNewUsers(
    formatLocalDate(newUsersFrom),
    formatLocalDate(newUsersTo),
    newUsersChartGroupBy
  )

  const formattedNewUsers = formatChartData(
    filteredChartUsers?.historialByPeriod,
    newUsersChartGroupBy as GroupByType
  )

  const { 
    data: driversData, 
    loading: driversLoading, 
    error: driversError 
  } = useDriversPercentage()
  
  const {
    data: verifiedData, 
    loading: verifiedLoading, 
    error: verifiedError
  } = useVerifiedUsers()

  const globalLoading = usersLoading || verifiedLoading || driversLoading

  const newUsersStatus = getStatusDelta(
    usersDelta ?? 0, 
    usersPreviousPeriod?.totalFiltered ?? 0
  )

  const newUsersPercentage = formatPercentageDelta(
    usersDelta ?? 0, 
    usersPreviousPeriod?.totalFiltered ?? 0
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {globalLoading ?
          <>
            <StatCardSkeleton/>
            <StatCardSkeleton/>
            <StatCardSkeleton/>
          </>
        :
          <>
            <StatCard
              title="Nuevos usuarios"
              value={`+${usersFiltered?.totalFiltered ?? 0}`}
              description={capitalize(formatFilterLabel(filter))}
              icon={
                newUsersStatus === 'increase' || newUsersStatus === 'new' ? (
                  <TrendingUp size={18} />
                ) : newUsersStatus === 'decrease' ? (
                  <TrendingDown size={18} />
                ) : (
                  <CircleDashed size={14} />
                )
              }
              trend={
                <span>
                  <span className="font-medium">
                    {newUsersStatus === 'increase' || newUsersStatus === 'new' ? '+' :  ''}
                    {newUsersStatus === 'new' ? 
                      `${formatPrice(newUsersPercentage)}` : 
                      `${newUsersPercentage}%`}
                  </span>
                  {' '}
                  {formatFilterLabelPrevious(filter)}
                </span>
              }
              variant={newUsersStatus}
              error={usersError}
            />
            <StatCard
              title="Usuarios verificados"
              value={`${verifiedData?.totalVerified ?? 0}`}
              description="Total de usuarios verificados"
              icon={<BadgeCheck size={18}/>}
              variant={"increase"}
              error={verifiedError}
            />
            <StatCard
              title="Conductores"
              value={`${driversData?.totalDrivers}`}
              description="Total de conductores"
              icon={<CircleUserRound size={18}/>}
              variant={"default"}
              error={driversError}
            />
          </>
        }
        
      </div>
      <DashboardSeparator 
        title="Análisis de usuarios"
        desc="Evolución de registros y distribución de usuarios"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <BarChartCard
          title="Usuarios registrados"
          desc={
            <>
              Se registraron {" "}
              <span className="font-semibold">
                {filteredChartUsers?.historicalTotal ?? 0}
              </span>{" "}
              usuarios en total
            </>
          }
          icon={User}
          data={formattedNewUsers ?? []}
          totalFiltered={filteredChartUsers?.totalFiltered ?? 0}
          loading={loadingChartUsers}
          error={errorChartUsers}
          filter={newUsersFilter}
          onFilterChange={setNewUsersFilter}
          customRange={newUsersCustomRange}
          onCustomRangeChange={setNewUsersCustomRange}
          unit="usuarios"
        />
        <div className="bg-gray-8 border border-gray-2/50 rounded-2xl h-full flex flex-col">
          {/* Header */}
          <ChartHeader
            title="Distribución de usuarios"
            desc="Conductores vs pasajeros"
            icon={Users}
          />

          {/* Body */}
          <div className="px-5 py-6 flex-1 flex flex-col items-center ">
            <DriversPercentage
              data={driversData ?? null}
              loading={driversLoading}
              error={driversError}
            />
          </div>          
        </div>
        
      </div>
    </div>
  )
}