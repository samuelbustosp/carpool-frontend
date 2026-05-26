'use client'

import { Toast } from "@/components/ux/Toast";
import { R2_PUBLIC_PREFIX } from "@/constants/imagesR2";
import { useTrip } from "@/contexts/tripContext";
import { CurrentTripSkeleton } from "@/modules/feed/components/CurrentTripSkeleton";
import { capitalizeWords } from "@/shared/utils/string";
import { ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";

export default function CurrentTrip() {
  const {currentTrip, arriveNextStop, loading, arriveLoading, errorArrive, clearErrorArrive} = useTrip();
  const route = [...(currentTrip?.tripStops ?? [])].sort((a, b) => {
    if (a.tripStop.order == null || b.tripStop.order == null) return 0;
      return a.tripStop.order - b.tripStop.order;
    });

  const nextStop = route.find(
    stop => !stop.tripStop.start && !stop.arrivalDateTime
  )
  
  const arrivedCount = route.filter(s => s.arrivalDateTime).length - 1
  const totalSteps = route.length - 1
  const progressPercent = (arrivedCount / totalSteps) * 100
  
  const originStop = route.find(stop => stop.tripStop.start);
  const destinationStop = route.find(stop => stop.tripStop.destination);
  
  const isLastStop = nextStop?.tripStop.destination === true

  const currentStop =
    [...route]
      .filter(stop => stop.arrivalDateTime)
      .sort(
        (a, b) =>
          new Date(b.arrivalDateTime!).getTime() -
          new Date(a.arrivalDateTime!).getTime()
      )[0] ?? originStop


  return (
    <div className="rounded-xl w-full h-full flex flex-col">
      {loading ? (
        <CurrentTripSkeleton />
      ) : (
        <div className="relative flex flex-col h-full flex-1">
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full gap-4 flex-1">
            
              <div className="bg-gray-8/90 rounded-xl p-4 flex flex-col flex-1">
                <Image
                  src={`${R2_PUBLIC_PREFIX}/isologo-cropped.svg`}
                  alt="Isologo carpool"
                  width={36}
                  height={24}
                  className="dark:invert"
                />
                <h2 className="text-2xl font-semibold leading-tight my-4">
                  Modo conductor activado
                </h2>


                <div className="space-y-3 text-sm">
                  <p className="text-gray-6 bg-gray-7 rounded-lg p-3">
                    Durante el viaje solo se mostrarán las acciones necesarias para conducir.
                    Esto ayuda a reducir distracciones y mejorar la seguridad en ruta.
                  </p>

                  <p className="text-gray-6 bg-gray-7 rounded-lg p-3">
                    Al finalizar el recorrido podrás salir del modo conductor y volver a utilizar
                    todas las funciones de la aplicación.
                  </p>
                </div>


              </div>
              <div className="bg-gray-8/90 backdrop-blur rounded-xl p-4 flex flex-col gap-2 justify-between flex-1">
                <div className="space-y-4">
                  {/* Header */}
                  <div>
                    <h1 className="text-2xl font-semibold">
                      {nextStop 
                        ? 'Inició el recorrido' 
                        : 'Finalizó el recorrido'
                      }
                    </h1>
                    {nextStop && 
                      <div className="flex items-center gap-2 font-semibold text-sm mt-1">
                        <span>{capitalizeWords(originStop?.tripStop.cityName)}</span>
                        <span className="px-0.5 py-0.5 bg-gray-7 rounded-full">
                          <ChevronRight size={14}/>
                        </span>
                        <span>{capitalizeWords(destinationStop?.tripStop.cityName)}</span>
                      </div>
                    }
                  </div>

                  <div className="w-full h-2 bg-gray-7 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-success transition-all rounded-full duration-500 ease-out ${
                        progressPercent >= 100 ? 'animate-pulse' : ''
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {nextStop &&
                      <div className="flex items-center gap-2 text-gray-6">
                        <span className="bg-gray-7 p-2 rounded-lg">
                          <MapPin size={14}/>
                        </span>
                        <p>Estás en {capitalizeWords(currentStop?.tripStop.cityName)}</p>
                      </div>
                    }
                    {/* Trip info */}
                    <div className="text-sm text-gray-6 space-y-1 bg-gray-7 p-3 rounded-lg">
                      <p className="text-base font-semibold">
                        {nextStop
                          ? `¡${capitalizeWords(nextStop.tripStop.cityName)} es la próxima parada!`
                          : "¡Destino alcanzado!"
                        }
                      </p>
                      {nextStop ?
                        <p>
                          La siguiente parada se encuentra a aproximadamente {nextStop?.distanceFromPrevious.toFixed(2)} km
                        </p>
                      :
                        <p>Serás redireccionado a los detalles del viaje.</p>
                      }
                      
                    </div>
                  </div>
                </div>
                
                {/* Action */}
                <div className="flex items-center justify-end pt-2">
                  {nextStop && (
                    <button
                      className="bg-gray-6 text-gray-8 px-4 py-2 rounded-lg font-medium cursor-pointer disabled:opacity-60"
                      onClick={arriveNextStop}
                      disabled={arriveLoading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className=" h-4 w-4 animate-spin rounded-full border-2 border-gray-2 border-t-transparent"></div>
                        </div>
                      ) : (
                        nextStop
                          ? `Llegué a ${capitalizeWords(nextStop.tripStop.cityName)}`
                          : isLastStop && "Finalizar viaje"
                      )}
                    </button>
                  )}
                </div>
                
              </div>

          </div>
        </div>

      )}
      {errorArrive && (
        <Toast
          message={errorArrive}
          type="error"
          onClose={clearErrorArrive}
        />
      )}
    </div>
    
  );
}
