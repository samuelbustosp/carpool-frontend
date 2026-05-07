import { Vehicle } from "@/models/vehicle";
import { VehicleCard } from "@/modules/vehicle/components/VehicleCard";
import { VehicleCardSkeleton } from "@/modules/vehicle/components/VehicleSkeleton";
import { useUserVehicles } from "@/modules/vehicle/hooks/useUserVehicles";
import { useEffect, useRef, useState } from "react";

const PAGE_SIZE = 10;

export function VehicleSelector({ 
  selectedVehicleId, 
  onSelect 
}: { 
  selectedVehicleId: number, 
  onSelect: (v: Vehicle) => void 
}) {
  const { vehicles, loading, error } = useUserVehicles();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibleCount >= vehicles.length) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) 
        setVisibleCount(prev => Math.min(prev + PAGE_SIZE, vehicles.length));
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, vehicles.length]);
  if (error) return <p>{error}</p>;

  return (
    <div className="space-y-2">
      {loading ? (
        Array.from({ length: Math.max(vehicles.length, 3) }).map((_, idx) => (
          <VehicleCardSkeleton key={idx} />
        ))
      ) : (
        <>
          {vehicles.slice(0, visibleCount).map(v => (
            <div
              key={v.id}
              className={`rounded-lg transition-all ${
                selectedVehicleId === v.id ? "ring-2 ring-gray-11" : ""
              }`}
            >
              <VehicleCard vehicle={v} onClick={() => onSelect(v)} />
            </div>
          ))}
          <div ref={sentinelRef} />
        </>
      )}
    </div>
  );
}
