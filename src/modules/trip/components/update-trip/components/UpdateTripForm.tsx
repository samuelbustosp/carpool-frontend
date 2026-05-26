'use client'

import { ErrorAlert } from "@/components/ux/admin/ErrorAlert";
import { AlertDialog } from "@/components/ux/AlertDialog";
import { Button } from "@/components/ux/Button";
import InfoTooltip from "@/components/ux/InfoTooltip";
import { R2_PUBLIC_PREFIX } from "@/constants/imagesR2";
import { useAuth } from "@/contexts/authContext";
import { TripStop, TripStopExtended } from "@/models/tripStop";
import { CityAutocomplete } from "@/modules/city/components/CityAutocomplete";
import { TripFormData, tripSchema } from "@/modules/trip/schemas/tripSchema";
import { TripPriceCalculationResponseDTO } from "@/modules/trip/types/dto/tripResponseDTO";
import { useUserVehicles } from "@/modules/vehicle/hooks/useUserVehicles";
import { calculatePriceTrip, updateTrip, validateTripDateTime } from "@/services/trip/tripService";
import { formatDomain } from "@/shared/utils/domain";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Circle, CircleX, DollarSign, Plus, Repeat, Square, UsersRound } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { TripDetail } from "../../new-trip/TripDetail";
import { baggageOptions } from "../../new-trip/TripForm";
import { TripPriceSummary } from "../../new-trip/TripPriceSummary";
import { TripRoutePreview } from "../../new-trip/TripRoutePreview";
import { TripStopForm } from "../../new-trip/tripStop/TripStopsForm";
import { VehicleSelector } from "../../new-trip/VehicleSelector";
import { useTripDetails } from "../hooks/useTripData";
import UpdateTripFormSkeleton from "./UpdateTripSkeleton";

export function UpdateTripForm() {
  const { id } = useParams();
  const { trip, loading, error: tripError } = useTripDetails(Number(id));
  const { vehicles, error: vehiclesError } = useUserVehicles();
  const {user} = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<number>(0);
  const [error, setError] = useState<string | null>();
  const [tripStops, setTripStops] = useState<TripStop[]>([]);

  //Errores
  const [dateError, setDateError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [priceSummary, setPriceSummary] = useState<TripPriceCalculationResponseDTO["data"] | null>(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [priceCalculationError, setPriceCalculationError] = useState<string | null>(null);
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const hasTripstops = tripStops?.length > 0;

  const [origin, setOrigin] = useState<TripStop>({
    cityId: 0,
    cityName: "",
    start: true,
    destination: false,
    order: 1,
    observation: ""
  })

  const [destination, setDestination] = useState<TripStop>({
    cityId: 0,
    cityName: "",
    start: false,
    destination: true,
    order: 1,
    observation: ""
  })

  const { handleSubmit, register, watch, setValue, trigger,reset, formState: { errors , isValid},  }  = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    mode: 'onChange',
    defaultValues: {
      startDateTime: '',
      availableSeat: 0,
      seatPrice: undefined,
      originId: 0,
      originObservation: '',
      destinationId: 0,
      destinationObservation: '',
      tripStops: [],
      idVehicle: 0
    }
  })

  const startDateTime = watch('startDateTime');
  const selectedVehicleId = watch('idVehicle');
  const seatPrice = watch("seatPrice");
  const availableSeat = watch("availableSeat");

  const currentVehicle =
    vehicles.find(v => v.id === selectedVehicleId) ??
    trip?.vehicle; 
  
  const exceedsVehicleSeats = !!currentVehicle && availableSeat >= currentVehicle.availableSeats;
  

    useEffect(() => {
    if (!startDateTime || !selectedVehicleId || startDateTime===trip?.startDateTime || !origin.cityId || !destination.cityId) {
      setDateError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await validateTripDateTime(
          startDateTime,
          origin.cityId,
          destination.cityId,
          trip?.id
        );

        if (response.state === 'ERROR') {
          setDateError(response.messages?.[0] || 'Ya existe un viaje en esta fecha y hora');
        } else {
          setDateError(null);
        }
      } catch (error) {
        setDateError('Error validando la fecha y hora');
        console.error(error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [startDateTime, selectedVehicleId, origin.cityId, destination.cityId]);

  useEffect(() => {
    // condiciones mínimas para calcular
    if (!seatPrice || seatPrice <= 0 || !availableSeat || availableSeat <= 0) {
      setPriceSummary(null);
      return;
    }

    // si hay errores en el formulario, no calculamos
    if (errors.seatPrice || errors.availableSeat || exceedsVehicleSeats ) {
      setPriceSummary(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setCalculatingPrice(true);

        await delay(300);

        const response = await calculatePriceTrip(seatPrice,availableSeat);

        if (response.state === "OK") {
          setPriceSummary(response.data);
          setPriceCalculationError(null);
        } else {
          setPriceSummary(null);
        }
      } catch (error) {
        console.error(error);
        setPriceSummary(null);
        setPriceCalculationError(
          error instanceof Error
            ? error.message
            : "No se pudo calcular el precio del viaje"
        );
      } finally {
        setCalculatingPrice(false);
      }
    }, 500);// delay para no spamear el endpoint al tipear rápido

    return () => clearTimeout(timeoutId);
  }, [seatPrice, availableSeat, errors.seatPrice, errors.availableSeat]);

  useEffect(() => {
    if (!trip) return;
    const originStop = trip.tripStops.find(stop => stop.start);
    const destinationStop = trip.tripStops.find(stop => stop.destination);

    setOrigin(originStop!);
    setDestination(destinationStop!);

    const intermediateStops = trip?.tripStops.filter(
      stop => !stop.start && !stop.destination
    );

    setTripStops(intermediateStops)

    reset({
      startDateTime: trip.startDateTime.slice(0, 16),
      seatPrice: trip.originalSeatPrice,
      availableSeat: trip.availableSeat,
      tripStops: trip.tripStops,
      availableBaggage: trip.availableBaggage,
      idVehicle: trip.vehicle.id,
      originId: originStop?.cityId ?? 0,
      originObservation: originStop?.observation ?? '',
      destinationId: destinationStop?.cityId ?? 0,
      destinationObservation: destinationStop?.observation ?? '',
    })
  }, [trip]);

  const availableBaggage = watch('availableBaggage');


  const buildTripRoute = (): TripStop[] => {
    if (!origin || !destination) return [];

    return [
      {
        cityId: origin.cityId,
        cityName: origin.cityName || "Origen",
        start: true,
        destination: false,
        order: 1,
        observation: origin.observation
      },
      ...(tripStops || []).map((stop, index) => ({
        ...stop,
        start: false,
        destination: false,
        order: index + 2
      })),
      {
        cityId: destination.cityId,
        cityName: destination.cityName || "Destino",
        start: false,
        destination: true,
        order: tripStops.length + 2,
        observation: destination.observation
      }
    ];
    };

  const handleTripStopsSubmit = (stops: { cityId: number; cityName: string; observation: string }[]) => {
    const formattedStops: TripStopExtended[] = stops.map((stop, index) => ({
      ...stop,
      order: index + 2,
      start: false,
      destination: false
    }));
    setTripStops(formattedStops);
  };

  const handleConfirmPublish = () => {
    handleSubmit(onSubmit)();
  };

  const findExistingStop = (predicate: (s: TripStop) => boolean) =>
    trip?.tripStops.find(predicate);

  const onSubmit = async (data: TripFormData) => {
    if (!origin || !destination) {
      setError("Debes seleccionar origen y destino");
      return;
    }
    setIsProcessing(true);

    const tripStopsPayload = [
      {
        tripStopId: findExistingStop(s => s.start)?.tripStopId,
        cityId: data.originId,
        start: true,
        destination: false,
        order: 1,
        observation: data.originObservation
      },
      ...((tripStops || []).map((stop, index) => ({
        ...stop,
        order: index + 2, // empezamos en 2 para que no choque con origen
        start: false,
        destination: false,
      }))),
      {
        tripStopId: findExistingStop(s => s.destination)?.tripStopId,
        cityId: data.destinationId,
        start: false,
        destination: true,
        order: (tripStops?.length || 0) + 2,
        observation: data.destinationObservation
      }
    ];

    const payload = {
      idTrip: id,
      idVehicle: data.idVehicle,
      startDateTime: data.startDateTime,
      availableSeat: data.availableSeat,
      seatPrice: data.seatPrice,
      availableBaggage: data.availableBaggage,
      tripStops: tripStopsPayload
    };

    try {
      const response = await updateTrip(payload);

      if (response.state === "ERROR") {
        setError(response.messages?.[0] || "Error al guardar el viaje");
        setIsProcessing(false);
        setIsErrorDialogOpen(true);
        return;
      }
      setIsProcessing(false);
      setIsSuccessDialogOpen(true);
    } catch (error) {
      setError("Error al crear el viaje");
      console.error(error)
    }
  };

  if (loading) return <UpdateTripFormSkeleton/>;

  if (tripError) {
    return (
      <div className="flex items-center justify-center mt-50">
        <ErrorAlert
          icon={<CircleX size={32} />}
          title="Error inesperado"
          description={tripError ?? "Lo sentimos ocurrió un error inesperado."}
        />
      </div>
      
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {step === 0 &&
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-between p-4 bg-gray-7 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 relative shrink-0">
                <Image
                  src={`${R2_PUBLIC_PREFIX}/${(currentVehicle?.vehicleTypeName ?? 'auto').toLowerCase()}.png`}
                  alt={`Imagen Tipo Vehiculo ${(currentVehicle?.vehicleTypeName ?? 'auto').toLowerCase()}`}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">
                  {currentVehicle?.brand} {currentVehicle?.model}
                </span>
                <span className="font-inter text-sm">
                  {formatDomain(currentVehicle?.domain ?? "")}
                </span>
              </div>
              
            </div>
            <button 
              type="button"
              className="group bg-gray-2 p-2 rounded-full cursor-pointer hover:bg-gray-9/45"
              onClick={() => setStep(1)}
            >      
              <Repeat className="transition-transform duration-300 group-hover:rotate-180" />
            </button>
          </div>
          <div className="">
            <CityAutocomplete
              value={origin?.cityId ?? 0}
              onChange={(city) => {
                setOrigin(prev => ({
                  cityId: city?.id ?? 0,
                  start: true,
                  destination: false,
                  order: 1,
                  observation: prev?.observation || '',
                  cityName: city?.name ?? ""
                }));
                setValue("originId", city?.id ?? 0, { shouldValidate: true });
              }}
              error={errors.originId?.message}
              label="Desde"
              placeholder="Localidad origen"
              icon={
                <Circle
                  size={10}
                  className="stroke-gray-5 fill-gray-5 dark:stroke-gray-1 dark:fill-gray-1"
                />
              }
              excludeIds={[destination?.cityId ?? 0]}
              outline={true}
            />
            <input
              type="text"
              placeholder="Punto de encuentro (ej: Plaza principal)"
              {...register(`originObservation`, {
                required: "La observación del origen es obligatoria",
              })}
              value={origin?.observation || ""}
              onChange={(e) => {
                setOrigin({ ...origin, observation: e.target.value });
                setValue("originObservation", e.target.value, { shouldValidate: true });
              }}
              className="w-full p-2 mt-1 rounded-b-lg bg-gray-7"
            />
            {errors.originObservation && (
              <p className="text-xs text-red-500 mt-1">
                {errors.originObservation.message}
              </p>
            )}
          </div>

          <div className="">
            <CityAutocomplete
              value={destination?.cityId ?? 0}
              onChange={(city) => {
                setDestination(prev => ({
                  cityId: city?.id ?? 0,
                  start: false,
                  destination: true,
                  order: 9999,
                  observation: prev?.observation || '',
                  cityName: city?.name || ""
                }));
                setValue("destinationId", city?.id ?? 0, { shouldValidate: true });
              }}
              error={errors.destinationId?.message}
              label="Hasta"
              placeholder="Localidad destino"
              icon={
                <Square
                  size={10}
                  className="stroke-gray-5 fill-gray-5 dark:stroke-gray-1 dark:fill-gray-1"
                />
              }
              excludeIds={[origin?.cityId ?? 0]}
              outline={true}
            />
            <input
              type="text"
              placeholder="Punto de destino (ej: Terminal de buses)"
              {...register(`destinationObservation`, {
                required: "La observación del destino es obligatoria",
              })}
              value={destination?.observation || ""}
              onChange={(e) => {
                setDestination({ ...destination, observation: e.target.value });
                setValue("destinationObservation", e.target.value, { shouldValidate: true });
              }}
              className="w-full p-2 mt-1 rounded-b-lg bg-gray-7"
            />
            {errors.destinationObservation && (
              <p className="text-xs text-red-500 mt-1">
                {errors.destinationObservation.message}
              </p>
            )}

          </div>

          <div className="my-4">
            <button 
              type="button"
              className="
                group
                 text-sm 
                px-4 py-1.5 
                bg-gray-7 hover:bg-gray-2
                rounded-lg font-light
                transition-colors duration-200 cursor-pointer
              "
              onClick={() => setStep(2)}
            >
              {(tripStops?.length ?? 0) > 0 ?
                <div className="flex items-center gap-1">
                  Modificar paradas intermedias
                  <ChevronRight 
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-2"
                  />
                </div>
              :
                
                <div className="flex items-center gap-1">
                  <Plus 
                    size={16}
                  />
                  <span className="transition-transform duration-200 group-hover:translate-x-2">Agregar paradas intermedias</span>
                  
                </div>
                
              }
             
            </button>
          </div>

          <div className="flex flex-col gap-1">   
            <label className="text-sm font-medium font-inter">Equipaje</label>
            <div className="flex items-center justify-around p-2 bg-gray-7 rounded-lg">
              {baggageOptions.map(({ type, icon: Icon, value}) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("availableBaggage", value)}
                  className={`cursor-pointer flex flex-col items-center justify-center gap-2 w-20 h-20 rounded-2xl  transition ${
                    availableBaggage === value
                      ? "bg-gray-6 text-gray-2 border border-gray-4"
                      : "text-dark-3 dark:text-gray-1"
                  }`}
                >
                  <Icon className="w-8 h-8" />
                  <span className="font-medium font-inter text-xs">{type}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium font-inter">Fecha y hora de salida</label>
            <input
              type="datetime-local"
              {...register('startDateTime')}
              className="w-full p-2 rounded border border-gray-5 dark:border-gray-2"
              step="60"
            />
            {errors.startDateTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startDateTime.message}</p>
            )}
            {dateError && (
              <p className="text-red-500 text-sm mt-1">{dateError}</p>
            )}
            
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Asientos disponibles */}
            <div>
              <label className="flex mb-1 items-center text-sm font-medium font-inter gap-1">
                <span className="truncate">Asientos disponibles</span>
                <InfoTooltip text="Cantidad de asientos disponibles para pasajeros"></InfoTooltip>
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-2 dark:text-gray-1/65">
                  <UsersRound size={20} />
                </span>

                <input
                  type="number"
                  min={1}
                  {...register("availableSeat", {
                    required: "Debe indicar los asientos disponibles",
                    valueAsNumber: true,
                  })}
                  className="w-full pl-10 pr-3 py-2 rounded border border-gray-5 dark:border-gray-2 placeholder-gray-5"
                  placeholder="0"
                />

              </div>
              <p className="text-red-500 text-sm mt-1">
                {errors.availableSeat
                  ? errors.availableSeat.message
                  : watch("availableSeat") >= ((currentVehicle?.availableSeats) ?? 0)
                    ? `No puede superar los asientos del vehículo`
                    : null
                }
              </p>
              
              
            </div>

            {/* Precio por asiento */}
            <div>
              <label className="flex mb-1 items-center text-sm font-medium font-inter gap-1">
                <span className="truncate">Precio por asiento</span>
                <InfoTooltip text="El precio ingresado corresponde al valor antes de comisiones. El monto que recibirás será menor una vez aplicadas las tarifas de la plataforma"></InfoTooltip>
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-2 dark:text-gray-1/65">
                  <DollarSign size={20} />
                </span>

              <input
                type="text"
                inputMode="decimal"
                {...register("seatPrice", {
                  setValueAs: (value) => {
                    const cleaned = String(value)
                      .replace(/[^0-9.]/g, "")      // permite números y punto
                      .replace(/(\..*?)\..*/g, "$1"); // solo un punto decimal
                    return cleaned ? Number(cleaned) : undefined;
                  },
                })}
                onInput={(e) => {
                  const el = e.target as HTMLInputElement;
                  el.value = el.value
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*?)\..*/g, "$1");
                }}
                className="w-full pl-10 pr-3 py-2 rounded border"
                placeholder="Ej. 1000"
              />
            </div>
              {errors.seatPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.seatPrice.message}</p>
              )}
            </div>
            <div className="col-span-2">
              {(priceSummary || calculatingPrice) && (
                <TripPriceSummary
                  seatPrice={seatPrice ?? 0}
                  publishedSeatPrice={priceSummary?.publishedSeatPrice ?? 0}
                  driverPriceDiscount={priceSummary?.driverPriceDiscount ?? 0}
                  netEarningsPerSeat={priceSummary?.netEarningsPerSeat ?? 0}
                  commission={priceSummary?.commission ?? 0}
                  loading={calculatingPrice}
                />
              )}

              {priceCalculationError && !calculatingPrice && (
                <p className="text-sm text-red-500 mt-2">
                  {priceCalculationError}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-center my-4">
            <Button
              type="button"
              variant="primary"
              onClick={() => setStep(3)}
              className='px-12 py-2 text-sm font-inter font-medium'
              disabled={!isValid || !!priceCalculationError || calculatingPrice}
            >
              Siguiente
            </Button>
          </div>
          
        </div>
      }

      {step === 1 &&
        <div className='flex flex-col justify-between h-full'>
          <div>
            <div className='text-center mb-4'>
              <h2 className="text-2xl"><span className='font-semibold'>{user?.name}</span>, ¿Deseas cambiar el vehículo del viaje? 
              </h2>
            </div>

            {vehiclesError && <p className="text-sm text-red-500">{vehiclesError}</p>} 

            <VehicleSelector
              selectedVehicleId={selectedVehicleId}
              onSelect={(vehicle) => setValue('idVehicle', vehicle.id)}
            />
          </div>

          <div className="flex justify-center gap-2 mt-12">
            <Button
              type="button"
              variant="primary"
              onClick={() => setStep(0)}
              disabled={!selectedVehicleId}
              className='px-12 py-2 text-sm font-inter font-medium '
            >
              Siguiente
            </Button>
          </div>
        </div>
      }

      {step === 2 && (
        <div className="flex flex-col h-screen md:pb-8 justify-between">
          <div className="flex-1">
            <TripStopForm
              initialStops={tripStops}
              onSubmitTripStops={(stops) => {
                setValue("tripStops", stops, { shouldValidate: true });
                handleTripStopsSubmit(stops); 
              }}
              origin={origin?.cityId}
              destination={destination?.cityId}
              onBack={() => setStep(0)}
              onNext={() => {
                trigger().then((valid) => {
                  if (valid) setStep(0);
                });
              }}
            />
            {errors.tripStops && (
              <p className="text-xs text-red-500 mt-2">
                {errors.tripStops.message}
              </p>
            )}
          </div>

        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col justify-between h-full items-center">
          <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-8">
            <h2 className="text-2xl text-center font-semibold mb-6">
              ¿Deseas confirmar el recorrido?
            </h2>
            <div className='items-center w-full bg-gray-6 dark:bg-gray-8 py-4 px-6 rounded-lg'>
              <TripRoutePreview
                tripStops={buildTripRoute()}
              />
            </div>
            
          </div>

          <div className="flex justify-center gap-7.5 mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep(0)}
              className='px-15 py-2 text-sm font-inter font-medium'
            >
              Atrás
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => setStep(4)}
              className='px-12 py-2 text-sm font-inter font-medium'
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className='flex flex-col justify-between mb-8 '>
          <TripDetail
            origin={origin?.cityName ?? "Origen"}
            destination={destination.cityName ?? "Destino"}
            hasTripstops={hasTripstops}
            startDateTime={watch("startDateTime")}
            availableSeat={watch("availableSeat")}
            availableBaggage={watch("availableBaggage") || ""}
            seatPrice={priceSummary!.publishedSeatPrice}
            vehicle={currentVehicle!}
            onBack={() => setStep(2)}
          />
          <div className="flex justify-center gap-7.5 my-8 mb-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/trips?role=driver')}
              className='px-12 py-2 text-sm font-inter font-medium'
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              variant="primary"
              className='px-12 py-2 text-sm font-inter font-medium'
              disabled={isProcessing}
            > 
              {isProcessing ? (
                <div className='px-5 py-0.5'>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-2 border-t-transparent"></div>
                </div>
              ) : (
                <span>Guardar</span>
              )}
            </Button>
          </div>
        </div>
      )}

      <AlertDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmPublish} 
        type="info"
        title="¿Deseas Editar el viaje?"
        description="Una vez editado, otros usuarios podrán ver y solicitar unirse a este viaje."
        confirmText="Guardar cambios"
        cancelText="Cancelar"
      />
      <AlertDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        secondaryButton={{
          text: "Inicio",
          onClick: () => {
            setIsSuccessDialogOpen(false)
            router.push('/home') //deberia llevar a los detalles del viaje
          }
        }}
        onConfirm={() => {
          router.push("/trips?role=driver");
        }}
        type="success"
        title="¡Listo! Tu viaje ha sido editado"
        description="Podrás ver y gestionar tus viajes en la sección 'Mis Viajes'."
        confirmText="Mis viajes"
        cancelText="Inicio"
      />

      <AlertDialog
        isOpen={isErrorDialogOpen}
        onClose={() => {
          setIsErrorDialogOpen(false)
          router.push("/trips?role=driver")
        }}
        type="error"
        title="No se pudo editar el viaje"
        description={error || "Ocurrió un error inesperado. Intenta nuevamente."}
        confirmText="Entendido"
      />

      

    </form>
  );
}
