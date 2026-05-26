'use client'

import{ zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ux/Input"
import { Button } from "@/components/ux/Button"
import { registerVehicle } from "@/services/vehicle/vehicleService"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { VehicleTypeList } from "../vehicle-type/VehicleTypeList"
import { Alert } from "@/components/ux/Alert"
import { 
  RegisterVehicleStep1Data, 
  registerVehicleStep1Schema, 
  RegisterVehicleStep2Data, 
  registerVehicleStep2Schema
} from "../../schemas/vehicleSchema"
import { vehicleFormData } from "../../types/vehicle"
import InfoTooltip from "@/components/ux/InfoTooltip"


export function VehicleForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Paso 1: Selección de tipo de vehículo
  const step1Form = useForm<RegisterVehicleStep1Data>({
    resolver: zodResolver(registerVehicleStep1Schema),
    mode: 'onChange',
    defaultValues: { vehicleTypeId: 0 }
  })

  // Paso 2: Datos básicos del vehículo
  const step2Form = useForm<RegisterVehicleStep2Data>({
    resolver: zodResolver(registerVehicleStep2Schema),
    mode: 'onChange',
    defaultValues: {
      domain: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      availableSeats: 1
    }
  })

  const {
    formState: { isValid }
  } = step2Form

  const handleNextFromStep1 = () => {
    setStep(2)
  }


  const handlePrev = () => {
    setStep(step - 1)
  }

  const handleSubmitFinal = async (data: RegisterVehicleStep2Data) => {
    setLoading(true)
    try {
      // Datos comunes
      const baseData: vehicleFormData = {
        ...step2Form.getValues(),
        ...data,
        color: data.color.replace("#", "").toLowerCase(),
        vehicleTypeId: step1Form.getValues().vehicleTypeId, // Nota el guion bajo
      };
      
      const response = await registerVehicle(baseData);

      if (response.state === "ERROR") {
        setError(response.messages?.[0] || "Error al guardar el vehículo");
        return;
      }

      router.push("/vehicle");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocurrió un error inesperado.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 gap-4 w-full">
      
      {/* STEP 1 */}
      {step === 1 && (
        <div className="flex flex-col flex-1 gap-4">
          <h1 className="text-xl font-semibold">Selecciona el tipo de vehículo</h1>
          <form onSubmit={step1Form.handleSubmit(handleNextFromStep1)} className="flex flex-col flex-1 justify-between">
            {/* Lista de tipos de vehículos */}
            <div className="flex flex-col">
              <VehicleTypeList 
                selectedId={step1Form.watch("vehicleTypeId")} 
                onSelect={(id) => step1Form.setValue("vehicleTypeId", id, { shouldValidate: true })} 
              />

              {step1Form.formState.errors.vehicleTypeId && (
                <p className="text-red-500 text-sm">{step1Form.formState.errors.vehicleTypeId.message}</p>
              )}
            </div>
            

            <Button type="submit" variant="primary" className="text-sm font-medium">
              Siguiente
            </Button>
          </form>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Registrar vehículo</h1>
            <p className="text-sm text-muted-foreground">
              Completá los siguientes datos de tu vehículo para finalizar el registro.
            </p>
          </div>
          {error && <Alert message={error} />}
          <form onSubmit={step2Form.handleSubmit(handleSubmitFinal)} className="flex flex-col flex-1 justify-between">
              <div className="flex flex-col flex-1 gap-4">
                {/* Marca y modelo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Marca"
                    {...step2Form.register("brand")}
                    error={step2Form.formState.errors.brand?.message}
                  />
                  <Input
                    label="Modelo"
                    {...step2Form.register("model")}
                    error={step2Form.formState.errors.model?.message}
                  />
                </div>

                {/* Patente y año */}
                <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
                  <div className="md:col-span-2 mb-4 md:mb-0">
                    <Input
                      label="Patente o dominio"
                      {...step2Form.register("domain")}
                      error={step2Form.formState.errors.domain?.message}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 col-span-2 gap-4">
                    <Input
                      label="Año"
                      type="year"
                      placeholder="AAAA"
                      {...step2Form.register("year", { valueAsNumber: true })}
                      error={step2Form.formState.errors.year?.message}
                      className="col-span-1"
                    />
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <label className="text-sm">Asientos</label>    
                        <InfoTooltip 
                          text="Ingresá la cantidad de asientos total del vehiculo"
                        />      
                      </div>
                      <Input  
                        type="number" {...step2Form.register('availableSeats', { valueAsNumber: true })} 
                        error={step2Form.formState.errors.availableSeats?.message} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Color</label>

                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="vehicle-color"
                      className="
                        relative w-10 h-10 rounded-2xl overflow-hidden
                        border-gray-2 border-2 cursor-pointer
                        hover:scale-105 transition-transform
                      "
                    >
                      <input
                        id="vehicle-color"
                        type="color"
                        {...step2Form.register("color")}
                        className="
                          absolute inset-0 opacity-0 cursor-pointer
                        "
                      />

                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: step2Form.watch("color") || "#ffffff",
                        }}
                      />
                    </label>

                    <div className="flex flex-col justify-center leading-none">
                      <span className="text-sm text-gray-11">
                        Color seleccionado
                      </span>

                      <span className="font-medium">
                        {step2Form.watch("color")}
                      </span>
                    </div>
                  </div>

                  {step2Form.formState.errors.color?.message && (
                    <p className="text-sm text-red-500">
                      {step2Form.formState.errors.color?.message}
                    </p>
                  )}
                </div>
              </div>
              {/* Botones */}
              <div className="flex gap-4 md:mb-4">
                <button 
                  type="button" 
                  className="flex-1 px-3 text-sm border border-gray-2 rounded-lg text-gray-11 
                    hover:bg-gray-7 hover:text-white cursor-pointer" 
                  onClick={handlePrev}
                >
                  Volver
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-3 py-2 text-sm bg-gray-11 hover:bg-white hover:text-black text-gray-8 rounded-lg
                    cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                  " 
                  disabled={!isValid ||loading}
                >
                  {loading ?  'Guardando...' :  'Guardar'}
                </button>
              </div>
            </form>
        </>
      )}
    </div>
  )
}