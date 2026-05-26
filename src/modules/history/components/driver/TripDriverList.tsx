import { useState } from "react";
import { TripDriverCard } from "./TripDriverCard";
import { TripDriverDTO } from "@/modules/driver-trips/types/tripDriver";
import { MapPinOff } from "lucide-react";
import { EmptyAlert } from "@/components/ux/EmptyAlert";

interface TripDriverListProps {
  trips: TripDriverDTO[];
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function TripDriverList({ trips, onError, onSuccess }: TripDriverListProps) {
  const [openMenuTripId, setOpenMenuTripId] = useState<number | null>(null);

  if (trips.length === 0) {
    return (
      <div className="bg-dark-5 h-48 rounded-2xl flex items-center border border-gray-2/50">
        <EmptyAlert
          icon={<MapPinOff size={32} />}
          title="No hay viajes disponibles"
          description="Todavía no tenés viajes asociados como conductor."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {trips.map((trip) => (
        <TripDriverCard key={trip.id} trip={trip} onError={onError}  onSuccess={onSuccess}  openMenuTripId={openMenuTripId} setOpenMenuTripId={setOpenMenuTripId} />
      ))}
    </div>
  );
}
