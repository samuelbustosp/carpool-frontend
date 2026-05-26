import { Toast } from "@/components/ux/Toast";
import { R2_PUBLIC_PREFIX } from "@/constants/imagesR2";
import { formatDateTime } from "@/shared/utils/dateTime";
import { formatDomain } from "@/shared/utils/domain";
import { getClockIcon } from "@/shared/utils/getTimeIcon";
import { formatPrice } from "@/shared/utils/number";
import { translateTripState } from "@/shared/utils/state";
import { ChevronRight, Ellipsis, LogOut, LucideEye, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TripHistoryUserDTO } from "../../types/TripHistoryUserDTO";

interface TripPassengerCardProps {
  trip: TripHistoryUserDTO;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
  openMenuTripId: number | null;
  setOpenMenuTripId: (id: number | null) => void;
}

export function TripPassengerCard({ trip, openMenuTripId, setOpenMenuTripId}: TripPassengerCardProps) {
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'warning' } | null>(null);

  const startDate = new Date(trip.startDateTime);
  const ClockIcon = getClockIcon(startDate);
  const router = useRouter();
  
  
  const isMenuOpen = openMenuTripId === trip.tripId;

  const canReview = (trip.tripState === "FINISHED" && !trip.reviewed);
  const canLeave = (trip.tripState === "CLOSED" || trip.tripState == 'CREATED' );
  

  const handleReview = () => {
    router.push(`/driver-review/trip/${trip.tripId}`); 
  };

  const handleView = () => {
    router.push(`/trip/details/passenger/${trip.tripId}`); 
  };

  return (
    <div  className="trip-card mb-4 p-4 border border-gray-2 rounded-lg shadow-sm transition-all duration-20">
      {/* Ruta */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <span>{trip.startCity}</span>
          <span className="px-0.5 py-0.5 bg-gray-7 rounded-full"><ChevronRight size={14}/></span>
          <span>{trip.destinationCity}</span>
           
        </div>
        <span className="text-base font-semibold">
          ${formatPrice(trip.seatPrice)}
        </span>
      </div>

      {/* Fecha */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center text-xs text-gray-6 mb-2 bg-gray-7 gap-1 px-2 py-1     rounded-xl font-inter">
          <span><ClockIcon size={14} /></span>
          <span>{formatDateTime(startDate?.toISOString())}</span>
        </div>
        <div className="inline-flex gap-2 items-center text-xs text-gray-6 mb-2 bg-gray-7 px-3 py-1 rounded-xl font-inter">
          <span>{translateTripState(trip.tripState)}</span>
          <span className="bg-white h-1.5 w-1.5 rounded-full"></span>
        </div>
      </div>
      

      {/* Info secundaria */}
      <div className="flex items-center justify-between text-xs text-gray-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 relative shrink-0 ">
            <Image
              src={`${R2_PUBLIC_PREFIX}/${(trip.vehicle.vehicleTypeName).toLowerCase()}.png`}
              alt={`Imagen Tipo Vehiculo ${(trip.vehicle.vehicleTypeName).toLowerCase()}`}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">
              {trip.vehicle.brand} {trip.vehicle.model} de {trip.driverName}
            </span>
            <span className="font-inter">
              {formatDomain(trip.vehicle.domain)}
            </span>
          </div>
          
        </div>

        <div className="relative">
          <button
              onClick={() =>
                setOpenMenuTripId(isMenuOpen ? null : trip.tripId)
              }            
              className={`
              p-2 rounded-full
              text-sm font-medium
              transition-all duration-200
              ${isMenuOpen
                ? "bg-white text-black"
                : "bg-gray-7 text-gray-6 hover:bg-gray-6 hover:text-gray-8"
              }
              cursor-pointer
            `}
          >
            <Ellipsis size={16} />
          </button>

        {isMenuOpen && (
          <div
            className="
              absolute right-0 mt-2 w-56
              bg-[#1a1a1a] border border-gray-700
              rounded-xl shadow-lg
              p-2
              z-50
              space-y-1
            "
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleView}
              className='w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
                bg-gray-7 text-gray-6 hover:bg-gray-6 hover:text-gray-8 hover:font-semibold
                disabled:opacity-60 disabled:cursor-not-allowed
                cursor-pointer' 
            >
              <LucideEye size={16} />
              Visualizar
            </button>
            
            
            {canLeave && (
              <button
                className="
                  w-full flex items-center gap-2
                  px-3 py-2 rounded-lg text-sm
                  text-red-500
                  bg-red-500/10
                  hover:bg-red-500/20
                  transition-all duration-200
                  cursor-pointer
                "
              >
                <LogOut size={16} />
                Abandonar viaje
              </button>
            )}

            {/* Cancelar */}
            {canReview && (
              <button
                onClick={() => {
                  handleReview();
                }}
                className='
                  w-full flex items-center gap-2
                  px-3 py-2 rounded-lg text-sm
                  transition-all duration-200
                  bg-gray-7 text-gray-6
                  hover:bg-gray-6 hover:text-gray-8 hover:font-semibold
                  disabled:opacity-60 disabled:cursor-not-allowed
                  cursor-pointer
                '
              >
                <Star size={16} />
                Reseñar al conductor
              </button>
            )}
          </div>
        )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-100 w-full max-w-[90%] sm:max-w-md pointer-events-none flex justify-center">
          <div className="pointer-events-auto w-full">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        </div>
      )}

    </div>

  );
}