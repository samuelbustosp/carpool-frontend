import { useState } from "react";
import { TripHistoryUserDTO } from "../../types/TripHistoryUserDTO";
import { TripPassengerCard } from "./TripPassengerCard";
import { MapPinOff } from "lucide-react";
import { EmptyAlert } from "@/components/ux/EmptyAlert";

interface TripPassengerListProps {
  trips: TripHistoryUserDTO[];
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function TripPassengerList({ trips, onError, onSuccess }: TripPassengerListProps) {
  const [openMenuTripId, setOpenMenuTripId] = useState<number | null>(null);

  if (trips.length === 0) {
    return (
      <div className="bg-dark-5 h-48 rounded-2xl flex items-center border border-gray-2/50">
        <EmptyAlert
          icon={<MapPinOff size={32} />}
          title="No hay viajes disponibles"
          description="Todavía no tenés viajes asociados como pasajero."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {trips.map((trip) => (
        <TripPassengerCard 
          key={trip.tripId} 
          trip={trip} 
          onError={onError}
          onSuccess={onSuccess} 
          openMenuTripId={openMenuTripId}
          setOpenMenuTripId={setOpenMenuTripId}
        />
      ))}
    </div>
  );
}