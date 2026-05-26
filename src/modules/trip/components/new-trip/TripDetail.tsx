import { R2_PUBLIC_PREFIX } from "@/constants/imagesR2";
import { Vehicle } from "@/models/vehicle";
import { VehicleResponseTripDTO } from "@/modules/driver-trips/types/vehicleTrip";
import { capitalizeWords } from "@/shared/utils/string";
import { ChevronRight, Circle, Plus, Square, UsersRound } from "lucide-react";
import Image from "next/image";
import { baggageOptions } from "./TripForm";


interface TripDetailProps {
  origin: string;
  destination: string;
  startDateTime: string;
  availableSeat: number;
  availableBaggage: string;
  seatPrice?: number;
  vehicle: Vehicle | VehicleResponseTripDTO;
  onBack: () => void;
  hasTripstops: boolean
}

export function TripDetail({
  origin,
  destination,
  startDateTime,
  availableSeat,
  availableBaggage,
  seatPrice,
  vehicle,
  onBack,
  hasTripstops
}: TripDetailProps) {
  const selectedBaggage = baggageOptions.find(
    (b) => b.value === availableBaggage
  );

  const BaggageIcon = selectedBaggage?.icon;
  
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="w-full mb-4">
        <h2 className="text-xl font-semibold text-start">Detalles del viaje</h2>
      </div>
      
      <div className="w-full flex flex-col gap-3">
        <div className="px-4 py-2">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center">
              <Circle size={12} fill="white" stroke="white" />
              <div className="w-0.5 h-12 bg-gray-5 dark:bg-gray-2 my-2">
              </div>
              <Square size={12} fill="white" stroke="white" />
            </div>
            <div className="flex-1 space-y-6">
              <div >
                <p className="text-sm font-light text-gray-2 dark:text-gray-6 leading-5 ">Origen</p>
                <p className="font-medium">{origin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-2 dark:text-gray-6 leading-5 ">Destino</p>
                <p className="font-medium">{destination}</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <button onClick={onBack} className="cursor-pointer text-white text-sm flex items-center gap-1 border rounded-lg py-1.5 px-2 border-gray-5 dark:border-gray-2 dark:hover:bg-gray-8">
            {hasTripstops ?
                <div className="flex items-center gap-1">
                  Modificar paradas intermedias
                  <ChevronRight
                    size={14}
                    
                  />
                </div>
              :
                <div className="flex items-center gap-1">
                  <Plus 
                    size={14}
                    
                  />
                  <span>Agregar paradas intermedias</span>
                </div>
              }
          </button>
        </div>
        
        <div className="flex justify-between p-4 rounded-lg bg-gray-6 dark:bg-gray-8">
          <p className="flex flex-col text-gray-7 dark:text-gray-1">
            <span className="font-medium text-lg">Horario de salida</span>
            <span className="font-regular text-sm ">
              {new Date(startDateTime).toLocaleDateString('es-AR', {
                day: 'numeric',    
                month: 'long',     
                year: 'numeric',   
              })}
            </span>
            <span className="text-2xl font-bold">
              {new Date(startDateTime).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })} hs
            </span>
          </p>
          <p className="flex flex-col items-start text-right min-w-22.5 text-gray-7 dark:text-gray-1">
            <span className="font-medium text-lg">Precio</span> 
            <span className="text-2xl font-bold">${seatPrice}</span>
            <span className="font-regular text-sm">por pasajero</span>
          </p>
        </div>

        <div className="flex justify-between p-4 rounded-lg bg-gray-6 dark:bg-gray-8">
          <div className="flex flex-col text-gray-7 dark:text-gray-1">
            <span className="font-medium mb-2 text-lg">Equipaje</span>
            <div className="flex items-center gap-2">
              {BaggageIcon && (
                <div className="p-2 rounded-lg bg-gray-11 dark:bg-gray-2">
                  <BaggageIcon className="w-7 h-7" />
                </div>
              )}
              <span className="font-regular">{selectedBaggage?.type}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-start w-20 text-gray-7 dark:text-gray-1">
            <span className="font-medium mb-2 text-lg">Asientos</span>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gray-11 dark:bg-gray-2">
                <UsersRound size={28} />
              </div>
              <span className="text-2xl font-bold ">{availableSeat}</span>
            </div>
          </div>
        </div>
        <div className="py-2 px-4 rounded-lg bg-gray-6 dark:bg-gray-8 text-gray-7 dark:text-gray-1">
          <span className="font-medium text-lg">Vehículo</span> 
          <div className="flex justify-between items-center">
            <div className="flex py-2 gap-2 items-center">
              <div className="p-1 rounded-lg bg-gray-11 dark:bg-gray-2">
                <div className="w-9 h-9 relative shrink-0 ">
                  <Image
                    src={`${R2_PUBLIC_PREFIX}/${(vehicle.vehicleTypeName).toLowerCase()}.png`}
                    alt={`Imagen Tipo Vehiculo ${(vehicle.vehicleTypeName).toLowerCase()}`}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
              <div className="leading-5">
                <p className="font-semibold">{capitalizeWords(vehicle.brand)}</p>
                <p className="font-light"> {capitalizeWords(vehicle.model)}</p>
              </div>
            </div>
            
            <p className="text-sm font-inter leading-3 w-20">{vehicle.domain}</p>
            
          </div>
        </div>   
      </div>
    </div>
  );
}