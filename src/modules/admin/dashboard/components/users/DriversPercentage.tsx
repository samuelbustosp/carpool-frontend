'use client'


import { OctagonX, UserRoundCheck, UserRoundX } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { DriversPercentageResponseDTO } from "../../types/dto/driversPercentageResponse"
import { ErrorAlert } from "@/components/ux/admin/ErrorAlert"
import DriversPercentageSkeleton from "../skeletons/DriversPercentageSkeleton"

interface DriversPercentageProps {
  data: DriversPercentageResponseDTO | null
  loading: boolean
  error: string | null
}

const COLORS = {
  drivers: "#e5e5e5", 
  passengers: "#3f3f3f", 
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-gray-8 border border-gray-2/50 rounded-xl px-3 py-2 text-sm shadow-lg">
      <p className="text-white font-medium">{payload[0].name}</p>
      <p className="text-gray-11">{payload[0].value}%</p>
    </div>
  )
}

export default function DriversPercentage({
  data,
  loading,
  error,
}: DriversPercentageProps) {
  const driverPercentage = data?.driverPercentage
  const passengerPercentage = Math.round((100 - (driverPercentage ?? 0)) * 10) / 10

  const activeDiff = (data?.totalDrivers ?? 0) - (data?.totalActiveDrivers ?? 0)

  const dataLeyend = [
    { name: "Conductores", value: driverPercentage },
    { name: "Pasajeros", value: passengerPercentage },
  ]

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full">
      {loading ? (
        <DriversPercentageSkeleton/>
      ) : error ? (
        <div className="flex items-center h-full w-full gap-2 text-sm text-gray-11">
          <ErrorAlert
            icon={<OctagonX size={32} />}
            title="Error inesperado"
            description={error}
            variant="Y"
          />
        </div>
      ) : (
        <>
          {/* Gráfico */}
          <div className="relative w-52 h-52 [&_*:focus]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataLeyend}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                  isAnimationActive={true}
                >
                  {dataLeyend.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={index === 0 ? COLORS.drivers : COLORS.passengers}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip />}
                  offset={20}
                  wrapperStyle={{ zIndex: 20 }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centro */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-semibold text-white leading-none">
                {driverPercentage}%
              </p>
              <p className="text-xs text-gray-11 mt-1">conductores</p>
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-5">
            {dataLeyend.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: index === 0 ? COLORS.drivers : COLORS.passengers }}
                />
                <span className="text-xs text-gray-11">{entry.name}</span>
                <span className="text-xs text-white font-medium tabular-nums">
                  {entry.value}%
                </span>
              </div>
            ))}
          </div>
          <div className="w-full max-w-md rounded-2xl  mt-2">
            <p className="text-sm text-gray-11 mb-2">
              Actualmente hay{" "}
              <span className="font-semibold text-white">
                {data?.totalDrivers}
              </span>{" "}
              {(data?.totalDrivers ?? 0) === 1
                ? "conductor registrado"
                : "conductores registrados"}
            </p>

            <div className="flex items-center w-full gap-4">
              <div className="flex items-center w-full rounded-2xl overflow-hidden bg-gray-2/40 ">
                
                {/* Icon section */}
                <div className="flex items-center rounded-l-2xl justify-center self-stretch px-5 bg-green-400/15 ">
                  <UserRoundCheck className="text-green-400/80" />
                </div>

                {/* Content */}
                <div className="flex-1 px-2 py-1">
                  <p className="text-xs uppercase tracking-wide text-gray-11 font-medium">
                    Activos
                  </p>
                  <p className="text-xl font-semibold text-white tabular-nums">
                    {data?.totalActiveDrivers}
                  </p>
                </div>
              </div>

              <div className="flex items-center w-full rounded-2xl overflow-hidden bg-gray-2/40">
                
                {/* Icon section */}
                <div className="flex items-center justify-center self-stretch px-5 bg-red-400/15">
                  <UserRoundX className="text-red-400/80" />
                </div>

                {/* Content */}
                <div className="flex-1 px-2 py-1">
                  <p className="text-xs uppercase tracking-wide text-gray-11 font-medium">
                    Inactivos
                  </p>
                  <p className="text-xl font-semibold text-white tabular-nums">
                    {activeDiff}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}