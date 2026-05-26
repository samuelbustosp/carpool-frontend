'use client'

import Separator from "@/components/ux/Separator";
import { CityAutocomplete } from "@/modules/city/components/CityAutocomplete";
import { Circle, Square } from "lucide-react";
import { useState } from "react";

interface CitySearchProps {
  originCity: number | null;
  destinationCity: number | null;
  setOriginCity: (id: number | null) => void;
  setDestinationCity: (id: number | null) => void;
  
}

export default function CitySearch({
  originCity,
  destinationCity,
  setOriginCity,
  setDestinationCity,
}: CitySearchProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <div
      className={`border bg-gray-8 w-full rounded-2xl flex items-center gap-2 px-2 transition-all duration-200 ${
        isFocused
          ? "border-gray-6"
          : "border-gray-2"
      }`}
    >
      
      <div className="rounded-2xl w-full flex items-center">
        <div className="w-full h-full">
          <CityAutocomplete
            placeholder="Localidad origen"
            value={originCity ?? 0}
            onChange={(city) => setOriginCity(city?.id ?? null)}
            excludeIds={[Number(destinationCity)]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            icon={
              <Circle
                size={8}
                className="stroke-gray-1 fill-gray-1"
              />
            }
            searchIcon={false}
          />
          <div className="px-2">
            <Separator color="bg-gray-2" marginY="my-0" />
          </div>
          
          <CityAutocomplete
            placeholder="¿Hacia donde?"
            value={destinationCity ?? null}
            onChange={(city) => setDestinationCity(city?.id ?? null)}
            excludeIds={[Number(originCity)]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            icon={
              <Square
                size={8}
                className=" stroke-gray-1 fill-gray-1"
              />
            }
            searchIcon={false}
          />
        </div>
        
        
      </div>
    </div>
  );
}
