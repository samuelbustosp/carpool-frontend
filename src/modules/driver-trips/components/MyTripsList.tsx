'use client'

import { MapPinOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import MyTrip from "./MyTrip";
import { TripDriverDTO } from "../types/tripDriver";
import { EmptyAlert } from "@/components/ux/EmptyAlert";

interface MyTripListProps{
    myTrips: TripDriverDTO[] | [];
}

const LOAD_SIZE = 5; 

export default function MyTripsList({myTrips}: MyTripListProps) {
    const router = useRouter();
    const [visibleCount, setVisibleCount] = useState(1);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    const handleTripClick = (tripId: number) => {
        router.push(`/reservations/${tripId}`);
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
            const target = entries[0];
            if (target.isIntersecting) {
                // Cargar 5 más cuando el sentinela sea visible
                setVisibleCount((prev) => Math.min(prev + LOAD_SIZE, myTrips.length));
            }
            },
            {
            rootMargin: "200px", // empieza a cargar un poco antes del final
            threshold: 0.1,
            }
        );

        const currentRef = loaderRef.current;

        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [myTrips.length]);

    if (myTrips.length === 0) {
        return (
            <div className="bg-dark-5 h-48 rounded-2xl flex items-center border border-gray-2/50">
                <EmptyAlert
                    icon={<MapPinOff size={32} />}
                    title="No tienes viajes programados"
                    description="Tus próximos viajes aparecerán aquí."
                />
            </div>
            
        );
      }

    const visibleTrips = myTrips.slice(0, visibleCount);

    return (
        <div>
            {visibleTrips.map((trip, index) => {
        
                return (
                    <div key={index}>

                    <div 
                        onClick={() => handleTripClick(trip.id)} 
                        className="cursor-pointer block" // Añadir cursor-pointer para mejor UX
                    >
                        <MyTrip 
                            trip={trip} 
                        /> 
                    </div>
                        {/* Preguntar si hace falt aun endpoint para la ciudad por defecto*/}
                    </div>
                );
                })}
        
                {/* Loader o indicador al final */}
                {visibleCount < myTrips.length && (
                <div ref={loaderRef} className="py-4 text-center text-sm text-muted-foreground">
                    Cargando más viajes...
                </div>
            )}
        </div>
    )

    




}