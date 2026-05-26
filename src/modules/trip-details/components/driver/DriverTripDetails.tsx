'use client'

import { ErrorAlert } from "@/components/ux/admin/ErrorAlert";
import { R2_PUBLIC_PREFIX } from "@/constants/imagesR2";
import { baggageOptions } from "@/modules/trip/components/new-trip/TripForm";
import { TripRoutePreview } from "@/modules/trip/components/new-trip/TripRoutePreview";
import { useTripDetails } from "@/modules/trip/components/update-trip/hooks/useTripData";
import { formatDomain } from "@/shared/utils/domain";
import { formatPrice } from "@/shared/utils/number";
import { capitalizeWords } from "@/shared/utils/string";
import { CircleX } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Rating } from "react-simple-star-rating";
import { TripDetailSkeleton } from "../TripDetailSkeleton";
import PassengersTrip from "./PassengersTrip";

export default function DriverTripDetails() {
  const { id } = useParams();
  const {trip, loading: tripLoading, error: tripError} = useTripDetails(Number(id));

  const selectedBaggage = baggageOptions.find(
    (b) => b.value === trip?.availableBaggage
  );

  const BaggageIcon = selectedBaggage?.icon;


  if (tripLoading) 
    return (
      <TripDetailSkeleton reservationButton={false}/>
    )
  if (tripError) return (
    <div className="my-50">
      <ErrorAlert
        icon={<CircleX size={32} />}
        title="Error inesperado"
        description={tripError ?? "Lo sentimos ocurrió un error inesperado."}
      />
    </div>

  );

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto mt-2">
      {trip &&
        <div
          className="w-full h-full grid grid-cols-9 auto-rows-auto gap-2 mb-4"
        >
          
          <div className="col-span-5 row-span-2 bg-gray-6 dark:bg-gray-8 flex flex-col justify-center text-center rounded-xl p-3">
            <h2 className="text-gray-7 dark:text-gray-1 font-medium text-xl">
              Disponibilidad
            </h2>
            <span className="font-medium text-[28px]">
              {trip?.currentAvailableSeats}/{trip?.availableSeat}
            </span>
          </div>


          <div className="col-span-4 col-start-6 row-span-2 bg-gray-6 dark:bg-gray-8 flex flex-col justify-center text-center rounded-xl p-3">
            <h2 className="text-gray-7 dark:text-gray-1 font-medium text-xl flex justify-center gap-1">
              Precio
            </h2>
            <span className="font-medium text-[28px]">${formatPrice(trip?.seatPrice ?? 0)}</span>
          </div>

         
          <div className="col-span-9 row-span-4 row-start-3 bg-gray-6 dark:bg-gray-8 rounded-xl flex flex-col">
            <h2 className="text-gray-7 mt-3 ml-3 dark:text-gray-1 font-medium text-xl">
              Recorrido
            </h2>
            <div className="px-3 flex items-center justify-center h-full">
              <TripRoutePreview
                tripStops={trip?.tripStops.sort((a, b) => a.order - b.order)??[]}
                withTimes={true}
              />
            </div>
          </div>

         
          <div className="col-span-9 row-span-2 row-start-7 bg-gray-6 dark:bg-gray-8 flex flex-col rounded-xl p-3"
            >
            <h2 className="text-gray-7 dark:text-gray-1 font-medium text-xl mb-2">
              Datos del conductor
            </h2>
            <div className="flex gap-5 items-center">
              <Image
                src={trip?.driverInfo.profileImageUrl || "/default-profile.png"}
                alt="Foto de perfil"
                width={60} // o el tamaño real que querés renderizar
                height={60}
                className="w-15 h-15 rounded-full object-cover"
              />
              <div className="text-gray-7 dark:text-gray-1 flex flex-col">
                <span className="font-medium">{trip?.driverInfo.fullName}</span>
                <div className="flex items-center gap-2 space-y-1.5">
                  <span className="font-medium pt-1.5">{trip?.driverInfo.rating}</span>
                  <Rating
                    initialValue={trip?.driverInfo.rating}
                    fillColor="#ffffff"
                    emptyColor="#706562"
                    size={18}
                    readonly
                    SVGstyle={{ display: "inline" }}
                    allowFraction
                  />

                </div>
              </div>
            </div>
          </div>

         
          <div className="col-span-6 row-span-2 row-start-9 bg-gray-6 dark:bg-gray-8 flex flex-col rounded-xl justify-center p-2">
            <h2 className="text-gray-7 self-start dark:text-gray-1 font-medium text-xl mb-2">
              Datos del vehículo
            </h2>
            <div className="flex items-center gap-2">
              <Image
                src={`${R2_PUBLIC_PREFIX}/${trip?.vehicle.vehicleTypeName.toLowerCase()}.png`}
                alt="Car logo"
                width={60}
                height={60}
                className="ml-3"
              />
              <div className="flex flex-col">
                <span className="font-semibold">
                  {capitalizeWords(trip?.vehicle.brand)}{" "}
                  {capitalizeWords(trip?.vehicle.model)}
                </span>
                <span>{formatDomain(trip?.vehicle.domain??'')}</span>
              </div>
            </div>
          </div>


          <div className="col-span-3 col-start-7 row-span-2 row-start-9 bg-gray-6 dark:bg-gray-8 flex flex-col rounded-xl justify-center items-center p-2">
            <h2 className="text-gray-7 dark:text-gray-1 font-medium text-xl mb-2">
              Equipaje
            </h2>
            <div className="flex flex-col items-center text-gray-7 dark:text-gray-1">
              <div className="flex gap-2">
                {BaggageIcon && (
                  <div className="rounded-lg">
                    <BaggageIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
              <span className="font-medium text-xl">{selectedBaggage?.type}</span>
            </div>
          </div>

          
        </div>
      } 

      {trip && 
        <div className="mb-4 w-full">
          <PassengersTrip idTrip={Number(id) ?? null}/>
        </div>
      }
      

    </div>
  );
}
