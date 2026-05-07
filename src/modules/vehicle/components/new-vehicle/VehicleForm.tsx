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
            

            <Button type="submit" variant="primary" className="w-full">
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
          <form onSubmit={step2Form.handleSubmit(handleSubmitFinal)} className="flex flex-col gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Patente o dominio"
                {...step2Form.register("domain")}
                error={step2Form.formState.errors.domain?.message}
              />
              <Input
                label="Año"
                type="year"
                placeholder="AAAA"
                {...step2Form.register("year", { valueAsNumber: true })}
                error={step2Form.formState.errors.year?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Color */}
              <Input
                label="Color"
                {...step2Form.register("color")}
                error={step2Form.formState.errors.color?.message}
              />
              
              {/* Capacidad */}
              <div>
                <div className="flex items-center gap-1">
                  <label>Asientos</label>    
                  <InfoTooltip text="Ingresá la cantidad de asientos total del vehiculo"></InfoTooltip>          
                </div>
                <Input  
                  type="number" {...step2Form.register('availableSeats', { valueAsNumber: true })} 
                  error={step2Form.formState.errors.availableSeats?.message} 
                />
              </div>
              
            </div>

            {/* Botones */}
             <div className="flex gap-4 mt-2">
              <Button type="button" variant="outline" className="w-full" onClick={handlePrev}>Volver</Button>
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ?  'Guardando...' :  'Guardar'}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}