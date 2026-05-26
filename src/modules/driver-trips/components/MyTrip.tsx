import Separator from "@/components/ux/Separator";
import { R2_PUBLIC_PREFIX } from "@/constants/imagesR2";

import { formatDateTime } from "@/shared/utils/dateTime";
import { formatDomain } from "@/shared/utils/domain";
import { capitalizeWords } from "@/shared/utils/string";
import { ChevronRight, ClockIcon, UserRound } from "lucide-react";
import Image from "next/image";
import { TripDriverDTO } from "../types/tripDriver";


export interface MyTripProps {
  trip: TripDriverDTO
}

export default function MyTrip({ trip }: MyTripProps) {
  return (
    <div className="mb-4 p-4 border border-gray-2 rounded-xl transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-semibold text-[13px] md:text-sm">
          <span className="truncate">{trip.startCity}</span>
          <span className="px-0.5 py-0.5 bg-gray-7 rounded-full"><ChevronRight size={14}/></span>
          <span className="truncate">{trip.destinationCity}</span>
        </div>
        <span className="text-base font-semibold">
          ${trip.seatPrice}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-6 bg-gray-7 gap-1 px-2 py-1 rounded-xl font-inter">
          <span><ClockIcon size={14} /></span>
          <span>{formatDateTime(trip.startDateTime)}</span>
        </div>
        <div className="inline-flex gap-2 items-center text-gray-6 bg-gray-7 px-3 rounded-xl font-inter">
          <p className="flex items-center justify-end text-base gap-1">
            {trip.currentAvailableSeats}
            <span><UserRound size={16} /></span>
          </p>
        </div>
      </div>


      <Separator color="bg-gray-2" marginY="my-2" />


      <div className="flex flex-col w-full">
        <div className="flex items-center gap-4 w-full mt-1">
          <Image
            src={`${R2_PUBLIC_PREFIX}/${(trip.vehicle.vehicleTypeName).toLowerCase()}.png`}
            alt={`Imagen Tipo Vehiculo ${(trip.vehicle.vehicleTypeName).toLowerCase()}`}
            width={45}
            height={45}
            className="rounded-full object-cover"
          />
          <div className="flex items-center justify-between w-full">
            <div className="leading-none text-sm">
              <div className="flex items-center gap-1">
                <p className="font-semibold">{capitalizeWords(trip.vehicle.brand)} </p>
                <p className="">{capitalizeWords(trip.vehicle.model)}</p>
              </div>
              <p className="text-xs">{formatDomain(trip.vehicle.domain)}</p>
            </div>
              
            <span 
              className="flex items-center text-gray-11 gap-1 text-sm bg-gray-8 rounded-full px-3 py-1
              hover:bg-gray-7 cursor-pointer hover:text-white"
            >
              Ver reservas
              <ChevronRight size={20} strokeWidth={1} />
            </span>
            
          </div>
        </div>
      </div>
    </div>
  )
}