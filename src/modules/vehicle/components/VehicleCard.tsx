"use client";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { R2_PUBLIC_PREFIX } from "@/constants/imagesR2";
import { Vehicle } from "@/models/vehicle";
import { formatDomain } from "@/shared/utils/domain";

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
}

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between 
        border border-gray-2 
        rounded-lg p-4 shadow hover:ring-gray-11 hover:ring-2
         hover:bg-gray-2/75 transition-all cursor-pointer text-gray-11 hover:text-white"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 relative shrink-0">
          <Image
            src={`${R2_PUBLIC_PREFIX}/${vehicle.vehicleTypeName.toLowerCase()}.png`}
            alt="Car logo"
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div>
          <p className="font-semibold leading-5 ">
            {vehicle.brand}
          </p>
          <p className="text-sm font-light leading-5 ">
            {vehicle.model}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm font-inter ">
          {formatDomain(vehicle.domain)}
        </p>
        
        <ChevronRight size={18} />

        
      </div>
    </div>
  );
}
