'use client'

import { EmptyAlert } from "@/components/ux/EmptyAlert";
import { useTripPassengers } from "../../hooks/useTripPassengers";
import PassengerCard from "./PassengerCard";
import { UserRoundMinus } from "lucide-react";
import { Toast } from "@/components/ux/Toast";
import PassengerCardSkeleton from "./PassengerCardSekeleton";
import { useRouter } from "next/navigation";

interface PassengersTripProps {
  idTrip: number;
}

export default function PassengersTrip({ idTrip }: PassengersTripProps) {
  const { passengers, loading, error } = useTripPassengers(idTrip);
  const router = useRouter();

  const handlePassengerReview = (idPassenger: number) => {
    router.push(`/passenger-review/trip/${idTrip}/${idPassenger}`);
  }

  if (loading) {
    return (
      <div className="max-w-lg flex flex-col gap-2 w-full">
        <div className="h-4.5 w-64 bg-gray-2 animate-pulse rounded"/>
        {[...Array(3)].map((_, i) => (
          <PassengerCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!passengers || passengers.length === 0) {
    return (
      <EmptyAlert
        icon={<UserRoundMinus size={32} />}
        title="No hay pasajeros"
        description="No hay ningún pasajero en este viaje."
      />
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-lg mx-auto">
      {loading ? 
        <div className="h-4.5 w-32 bg-gray-2 animate-pulse"/> 
      :
        <p className="text-lg">Pasajeros que viajaron con vos!</p>
      }
      
      {passengers.map((p) => (
        <PassengerCard 
          key={p.idPassenger} 
          passenger={p} 
          handlePassengerReview={() => handlePassengerReview(p.idPassenger)} 
        />
      ))}
      {error && (
        <Toast
          message={error}
          type="error"
        />
      )}
    </div>
  );
}