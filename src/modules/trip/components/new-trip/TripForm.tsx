'use client';

import { useAuth } from '@/contexts/authContext';

import { TripStop, TripStopExtended } from '@/models/tripStop';
import { calculatePriceTrip, newTrip, validateTripDateTime } from '@/services/trip/tripService';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeftCircle, Circle, CircleX, DollarSign, Square, UsersRound } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { BiBriefcaseAlt } from 'react-icons/bi';
import { BsBackpack, BsSuitcase } from 'react-icons/bs';

import { AlertDialog } from '@/components/ux/AlertDialog';
import { Button } from '@/components/ux/Button';
import InfoTooltip from '@/components/ux/InfoTooltip';
import InvalidDriverAlert from '@/components/ux/InvalidDriverAlert';
import { Toast } from '@/components/ux/Toast';
import { CityAutocomplete } from '@/modules/city/components/CityAutocomplete';
import { VehicleCardSkeleton } from '@/modules/vehicle/components/VehicleSkeleton';
import { useUserVehicles } from '@/modules/vehicle/hooks/useUserVehicles';
import { useEffect, useState } from 'react';
import { TripFormData, tripSchema } from '../../schemas/tripSchema';
import { TripPriceCalculationResponseDTO } from '../../types/dto/tripResponseDTO';
import { TripDetail } from './TripDetail';
import { TripPriceSummary } from './TripPriceSummary';
import { TripRoutePreview } from './TripRoutePreview';
import { TripStopForm } from './tripStop/TripStopsForm';
import { VehicleSelector } from './VehicleSelector';

interface BaggageOption {
  value: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const baggageOptions: BaggageOption[] = [
  { value: "LIVIANO", type: "Liviano", icon: BsBackpack },
  { value: "MEDIANO", type: "Mediano", icon: BiBriefcaseAlt },
  { value: "PESADO", type: "Pesado", icon: BsSuitcase },
  { value: "NO_EQUIPAJE", type: "", icon: CircleX },
];


export function TripForm() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'success' } | null>(null);
  const router = useRouter()
  const {user,driver} = useAuth();
  const [tripStops, setTripStops] = useState<TripStop[]>([])
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

  const [isProcessing, setIsProcessing] = useState(false);

  const { handleSubmit, register, watch, setValue, trigger, formState: { errors , isValid},  }  = useForm<TripFormData>({
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
      tripStops: []
    }
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useUserVehicles();
  const selectedVehicleId = watch('idVehicle');
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  
  const availableBaggage = watch('availableBaggage');

  const [dateError, setDateError] = useState<string | null>(null);
  const startDateTime = watch('startDateTime');

  const [priceSummary, setPriceSummary] = useState<TripPriceCalculationResponseDTO["data"] | null>(null);

  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [priceCalculationError, setPriceCalculationError] = useState<string | null>(null);

  const seatPrice = watch("seatPrice");
  const availableSeat = watch("availableSeat");

  const exceedsVehicleSeats = !!selectedVehicle && availableSeat >= selectedVehicle.availableSeats;

  const hasTripstops = tripStops?.length > 0

  const isValidDriver = driver?.licenseStatus === 'APPROVED'

  const now = new Date()
  const isExpiredLicense = new Date(driver?.licenseExpirationDate ?? '') < now

  useEffect(() => {
    if (selectedVehicle) {
      // si el usuario no cambió nada todavía, inicializo con el valor del vehículo
      setValue("availableSeat", selectedVehicle.availableSeats-1, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [selectedVehicle, setValue]);

  
  useEffect(() => {
    if (!startDateTime || !selectedVehicleId || !origin.cityId || !destination.cityId) {
      setDateError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await validateTripDateTime(
          startDateTime,
          origin.cityId,
          destination.cityId
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

  //Funcion "helper" para asignar delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    // condiciones mínimas para calcular
    if (!seatPrice || seatPrice <= 0 || !availableSeat || availableSeat <= 0) {
      setPriceSummary(null);
      return;
    }

    // si hay errores en el formulario, no calculamos
    if (errors.seatPrice || errors.availableSeat || exceedsVehicleSeats) {
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

  const handleTripStopsSubmit = (stops: { cityId: number; cityName: string; observation: string }[]) => {
    const formattedStops: TripStopExtended[] = stops.map((stop, index) => ({
      ...stop,
      order: index + 2,
      start: false,
      destination: false
    }));
    setTripStops(formattedStops);
  };

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
      ...tripStops.map((stop, index) => ({
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

  const onSubmit = async (data: TripFormData) => {
    if (!origin || !destination) {
      setToast({ message:"Debes seleccionar origen y destino", type: 'error' })
      return;
    }
    setIsProcessing(true);

    const tripStopsPayload = [
      {
        cityId: data.originId,
        start: true,
        destination: false,
        order: 1,
        observation: data.originObservation
      },
      ...((data.tripStops || []).map((stop, index) => ({
        ...stop,
        order: index + 2,
        start: false,
        destination: false,
      }))),
      {
        cityId: data.destinationId,
        start: false,
        destination: true,
        order: (tripStops?.length || 0) + 2,
        observation: data.destinationObservation
      }
    ];

    const payload = {
      idVehicle: data.idVehicle,
      startDateTime: data.startDateTime,
      availableSeat: data.availableSeat,
      seatPrice: data.seatPrice,
      availableBaggage: data.availableBaggage,
      tripStops: tripStopsPayload
    };

    try {
      const response = await newTrip(payload);
      if (response.state === "ERROR") {
        setToast({ message: response.messages?.[0] || "Error al guardar el viaje", type: 'error' })
        setIsProcessing(false);
        return;
      }
      setIsProcessing(false);
      setIsSuccessDialogOpen(true);
    } catch (error) {
      setToast({ message: "Error al guardar el viaje", type: 'error' })
      setIsProcessing(false);
      console.error(error)
    }
  };

  if (vehiclesLoading) {
    return (
      <div className="flex flex-col justify-start gap-4  h-screen w-full max-w-md mx-auto md:py-8">
        <div className='h-6 w-2/3 bg-gray-2 animate-pulse rounded'></div>
        {Array.from({ length: Math.max(vehicles.length, 3) }).map((_, idx) => (
            <VehicleCardSkeleton key={idx} />
        ))}
      </div>
    )
  }

  if (!isValidDriver || isExpiredLicense) return <InvalidDriverAlert expired={isExpiredLicense}/>

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-full">
        <Image
          src="/vehicles.svg"
          alt="Imagen de vehículo claro"
          width={200}
          height={166}
          className="block dark:hidden"
        />

        <Image
          src="/vehicles-dark.svg"
          alt="Imagen de vehículo oscuro"
          width={200}
          height={166}
          className="hidden dark:block"
        />
        <h1 className='text-2xl font-semibold text-center leading-7 mt-8'>
          No tenes vehículos <br/> para realizar un viaje 
        </h1>
        <p className='font-inter font-medium mt-8'>¿Deseas registrar uno?</p>
        <div className="flex justify-center gap-2 mt-8">
          <Button
            type="button" 
            variant="outline" 
            onClick={()=>router.back()}
            className='px-5 py-2 text-sm font-inter font-medium'
          >
            Volver
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={()=>router.push('/vehicle')}
            className='py-2 text-sm font-inter font-medium'
          >
            Registrar
          </Button>
        </div>
      </div>
    )
  }

  


  return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-start gap-4 h-full w-full max-w-md mx-auto md:py-8">
        {step === 1 && (
          // === PASO 1: Seleccionar vehículo ===
          <div className='flex flex-col justify-between h-full'>
            <div>
              <div className='text-center mb-4'>
                <h2 className="text-2xl"><span className='font-semibold'>{user?.name}</span>, ¿con qué vehículo 
                  deseas viajar hoy? 
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
                onClick={() => setStep(2)}
                disabled={!selectedVehicleId}
                className='px-12 py-2 text-sm font-inter font-medium'
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          // === PASO 2: Datos viaje ===
          <div className="flex flex-col justify-between flex-1 pb-8">
            <div className='space-y-3'>
              
              <h2 className="text-2xl font-medium">Nuevo viaje</h2>
                
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
                  className="w-full p-2 mt-2 rounded border border-gray-5 dark:border-gray-2"
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
    
                  className="w-full p-2 mt-2 rounded border border-gray-5 dark:border-gray-2"
                />
                {errors.destinationObservation && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.destinationObservation.message}
                  </p>
                )}

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
                      : watch("availableSeat") >= ((selectedVehicle?.availableSeats) ?? 0)
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
                    inputMode="numeric"
                    {...register("seatPrice", {
                      setValueAs: (value) => {
                        const cleaned = String(value).replace(/\D+/g, "");
                        return cleaned ? Number(cleaned) : undefined;
                      },
                    })}
                    onInput={(e) => {
                      const el = e.target as HTMLInputElement;
                      el.value = el.value.replace(/\D+/g, "");
                    }}
                    className="w-full pl-10 pr-3 py-2 rounded border"
                    placeholder="Ej. 1000"
                  />
                </div>
                  {errors.seatPrice && (
                    <p className="text-red-500 text-sm mt-1">{errors.seatPrice.message}</p>
                  )}
                </div>

              </div>

              <div className="col-span-1 md:col-span-2">
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


            <div className="flex justify-center gap-7.5 mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(1)}
                className='px-15 py-2 text-sm font-inter font-medium'
              >
                Atrás
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep(3)}
                className='px-12 py-2 text-sm font-inter font-medium'
                disabled={!isValid || !!priceCalculationError || calculatingPrice || !!dateError}
              >
                Siguiente
              </Button>
            </div>
          </div>
          
        )}

        {step === 3 && (
          // === PASO 3: Seleccionar equipaje ===
          <div className='flex flex-col justify-between h-full items-center'>
            <div className='flex flex-col justify-center items-center'>
              <h2 className="text-2xl text-center font-medium mb-16 ">
                Seleccioná el equipaje que cargará cada pasajero
              </h2>

              <div className="grid grid-cols-2 justify-items-center gap-8 mb-12">
                {baggageOptions.map(({ type, icon: Icon, value}) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("availableBaggage", value)}
                    className={`cursor-pointer flex flex-col items-center justify-center gap-2 w-32 h-32 rounded-2xl  transition ${
                      availableBaggage === value
                        ? "bg-gray-6 text-gray-2 border border-gray-4"
                        : "text-dark-3 dark:text-gray-1"
                    }`}
                  >
                    <Icon className="w-12 h-12" />
                    <span className="font-medium font-inter">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-7.5 mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(2)}
                className='px-15 py-2 text-sm font-inter font-medium'
              >
                Atrás
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep(4)}
                disabled={!availableBaggage}
                className='px-12 py-2 text-sm font-inter font-medium'
              >
                Siguiente
              </Button>
            </div>
          
          </div>
          
        )}

      {step === 4 && (
        <div className="flex flex-col h-full">
          
          {/* Parte superior (centrada) */}
          <div className="flex flex-col items-center gap-8 justify-center flex-1">
            <Image 
              src="/map-pin-2.svg"
              alt="Imagen MapPin"
              width={121}
              height={0}
              priority
              className="h-auto"
            />
            <h1 className="text-2xl text-center font-semibold">
              ¿Deseas sumar paradas intermedias?
            </h1>
          </div>

          {/* Botones abajo del todo */}
          <div className="flex flex-col items-center gap-6 mb-6">
            <div className="flex justify-center gap-7.5">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setStep(6)}
                className="px-6 py-2 text-sm font-inter font-medium"
              >
                No
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep(5)}
                className="px-6 py-2 text-sm font-inter font-medium"
              >
                Sí
              </Button>
            </div>

            {/* Volver */}
            <button 
              onClick={() => setStep(3)}
              className="flex items-center gap-1 hover:gap-1.5
                        transition-all duration-200 text-sm
                        hover:scale-105 hover:text-[15px] hover:text-gray-6 cursor-pointer border-b border-gray-9 px-2 py-1 rounded-lg"
            >
              <ChevronLeftCircle size={16}/>
              Volver a los datos del viaje
            </button>



          </div>

        </div>
      )}


        {step === 5 && (
          <div className="flex flex-col h-screen md:pb-8 justify-between">
            {/* Contenido principal con scroll si es necesario */}
            <div className="flex-1">
              <TripStopForm
                initialStops={watch("tripStops")}
                onSubmitTripStops={(stops) => {
                  setValue("tripStops", stops, { shouldValidate: true });
                  handleTripStopsSubmit(stops); // tu lógica previa
                }}
                origin={origin?.cityId}
                destination={destination?.cityId}
                onBack={() => setStep(4)}
                onNext={() => {
                  trigger().then((valid) => {
                    if (valid) setStep(6);
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

        {step === 6 && (
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
                onClick={() => setStep(tripStops.length > 0 ? 5 : 4)}
                className='px-15 py-2 text-sm font-inter font-medium'
              >
                Atrás
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep(7)}
                className='px-12 py-2 text-sm font-inter font-medium'
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className='flex flex-col justify-between mb-8 '>
            <TripDetail
              origin={origin?.cityName ?? "Origen"}
              destination={destination.cityName ?? "Destino"}
              hasTripstops={hasTripstops}
              startDateTime={watch("startDateTime")}
              availableSeat={watch("availableSeat")}
              availableBaggage={watch("availableBaggage") || ""}
              seatPrice={priceSummary!.publishedSeatPrice}
              vehicle={selectedVehicle!}
              onBack={() => setStep(5)}
            />
            <div className="flex justify-center gap-7.5 my-8 mb-8">
              <Button 
                type="button" 
                variant="outline" 
                disabled= {isProcessing}
                onClick={() => setIsCancelDialogOpen(true)}
                className='px-12 py-2 text-sm font-inter font-medium'
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                variant="primary"
                className='px-12 py-2 text-sm font-inter font-medium'
              > 
                {isProcessing ? (
                  <div className='px-5 py-0.5'>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-2 border-t-transparent"></div>
                  </div>
                ) : (
                  <span>Publicar</span>
                )}
              </Button>
            </div>
          </div>
        )}

        <AlertDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onConfirm={handleSubmit(onSubmit)} 
          type="info"
          title="¿Deseas publicar el viaje?"
          description="Una vez publicado, otros usuarios podrán ver y solicitar unirse a este viaje."
          confirmText="Publicar"
          cancelText="Cancelar"
        />
        <AlertDialog
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          onConfirm={() => router.push('/home')} 
          type="info"
          title="¿Estás seguro de cancelar la publicación?"
          description="Se perderán todos los datos ingresados del viaje."
          confirmText="Sí, cancelar"
          cancelText="Volver"
        />
        <AlertDialog
          isOpen={isSuccessDialogOpen}
          onClose={() => setIsSuccessDialogOpen(false)}
          secondaryButton={{
            text: "Inicio",
            onClick: () => {
              setIsSuccessDialogOpen(false)
              router.push('/home')
            }
          }}
          onConfirm={() => {
            router.push("/trips?role=driver");
          }}
          type="success"
          title="¡Listo! Tu viaje ha sido publicado"
          description="Podrás ver y gestionar tus viajes en la sección 'Mis Viajes'."
          confirmText="Mis viajes"
          cancelText="Inicio"
        />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </form>
  );
  
}
