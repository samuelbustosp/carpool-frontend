'use client'

import { Alert } from "@/components/ux/Alert";
import { AlertDialog } from "@/components/ux/AlertDialog";
import { Input } from "@/components/ux/Input";
import { Vehicle } from "@/models/vehicle";
import { deleteVehicle, updateVehicle } from "@/services/vehicle/vehicleService";
import { formatDomain } from "@/shared/utils/domain";
import { capitalizeWords } from "@/shared/utils/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CompleteRegisterVehicleData, completeRegisterVehicleSchema } from "../../schemas/vehicleSchema";
import { vehicleFormData } from "../../types/vehicle";
import { VehicleTypeList } from "../vehicle-type/VehicleTypeList";

export function VehicleUpdateForm({ vehicle }: { vehicle?: Vehicle }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialValues, setInitialValues] = useState<CompleteRegisterVehicleData | null>(null);
  const router = useRouter()

  const vehicleForm = useForm<CompleteRegisterVehicleData>({
    resolver: zodResolver(completeRegisterVehicleSchema),
    mode: 'onChange', // Importante: esto hace que valide en cada cambio
    defaultValues: {
      vehicleTypeId: 0,
      domain: '',
      brand: '',
      model: '',
      year: 0,
      color: '',
      availableSeats: 1
    }
  })

  // Precargar datos si estamos en edición
  useEffect(() => {
    if (vehicle) {
      const values = {
        vehicleTypeId: vehicle.vehicleTypeId,
        domain: formatDomain(vehicle.domain),
        brand: capitalizeWords(vehicle.brand),
        model: capitalizeWords(vehicle.model),
        year: vehicle.year,
        color: capitalizeWords(vehicle.color),
        availableSeats: vehicle.availableSeats
      };

      vehicleForm.reset(values);
      setInitialValues(values);
    }
  }, [vehicle, vehicleForm]);

  // Función para comparar valores ignorando diferencias de capitalización en strings
  const compareValues = (current: CompleteRegisterVehicleData, initial: CompleteRegisterVehicleData) => {
    const normalizeString = (str: string | undefined) =>
      typeof str === 'string' ? str.toLowerCase().trim() : str;

    return (
      normalizeString(current.brand) !== normalizeString(initial.brand) ||
      normalizeString(current.model) !== normalizeString(initial.model) ||
      normalizeString(current.color) !== normalizeString(initial.color) ||
      normalizeString(current.domain) !== normalizeString(initial.domain) ||
      current.year !== initial.year ||
      current.availableSeats !== initial.availableSeats ||
      current.vehicleTypeId !== initial.vehicleTypeId
    );
  };

  // Verificar si los valores han cambiado comparando con los valores iniciales
  const watchedValues = vehicleForm.watch();
  const isChanged = initialValues ?
    compareValues(watchedValues, initialValues) :
    false;

  // Verificar si el formulario es válido
  const { isValid, errors } = vehicleForm.formState;

  // El botón debe estar habilitado solo si hay cambios Y el formulario es válido
  const canSubmit = isChanged && isValid && !loading;

  const handleSubmit = async (values: CompleteRegisterVehicleData) => {
    if (!vehicle) return;

    setLoading(true)
    try {
      const updateData: vehicleFormData = {
        brand: values.brand,
        model: values.model,
        year: values.year,
        color: values.color.replace("#", "").toLowerCase(),
        availableSeats: values.availableSeats,
        domain: values.domain,
        vehicleTypeId: values.vehicleTypeId,
      };

      const response = await updateVehicle(vehicle.id, updateData);

      if (response.state === "ERROR") {
        setError(response.messages?.[0] || "Error al actualizar el vehículo");
        return;
      }

      // Actualizar los valores iniciales después de guardar exitosamente
      setInitialValues(values);
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

  const handleDelete = async () => {
    if (!vehicle) return;
    setLoading(true);
    try {
      const response = await deleteVehicle(vehicle.id);
      if (response.state === "OK") {
        router.push("/vehicle");
      } else {
        setError(response.messages?.[0] || "Error al eliminar el vehículo");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocurrió un error inesperado.");
      }
      console.error(error);
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {error && <Alert message={error} />}
      <h1 className="text-xl font-semibold">Selecciona el tipo de vehículo</h1>
      <form onSubmit={vehicleForm.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
        {/* Lista de tipos de vehículos */}
        <VehicleTypeList
          selectedId={vehicleForm.watch("vehicleTypeId")}
          onSelect={(id) => vehicleForm.setValue("vehicleTypeId", id, {
            shouldValidate: true,
            shouldDirty: true
          })}
        />

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <Input
            label="Marca"
            {...vehicleForm.register("brand")}
            error={errors.brand?.message}
          />
          <Input
            label="Modelo"
            {...vehicleForm.register("model")}
            error={errors.model?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-1 md:col-span-2 mb-4 md:mb-0">
            <Input
              label="Patente"
              {...vehicleForm.register("domain")}
              error={errors.domain?.message}
              disabled={!!vehicle}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 col-span-2">
            <Input
              label="Año"
              type="year"
              {...vehicleForm.register("year", { valueAsNumber: true })}
              error={errors.year?.message}
            />
            <Input
              label="Asientos"
              type="number"
              {...vehicleForm.register('availableSeats', { valueAsNumber: true })}
              error={errors.availableSeats?.message}
            />
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
                {...vehicleForm.register("color")}
                className="
                  absolute inset-0 opacity-0 cursor-pointer
                "
              />

              <div
                className="w-full h-full"
                style={{
                  backgroundColor: vehicleForm.watch("color") || "#ffffff",
                }}
              />
            </label>

            <div className="flex flex-col justify-center leading-none">
              <span className="text-sm text-gray-11">
                Color seleccionado
              </span>

              <span className="font-medium">
                {vehicleForm.watch("color")}
              </span>
            </div>
          </div>

          {errors.color?.message && (
            <p className="text-sm text-red-500">
              {errors.color.message}
            </p>
          )}
        </div>
        

        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            className="bg-red-500/20 hover:bg-red-500/30 text-gray-11 hover:text-white 
            flex col-span-2 items-center gap-1 rounded-lg px-2 justify-center cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            Dar de baja
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full col-span-2 py-2 rounded-lg transition-colors ${canSubmit ?
              'bg-transparent border border-gray-400 text-gray-700 dark:border-gray-5 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-2 focus:ring-gray-400 cursor-pointer'
              :
              'cursor-not-allowed text-gray-700 dark:text-gray-3 dark:bg-gray-2 focus:ring-gray-400'
              }`}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      <AlertDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        type="error"
        title="Confirmar eliminación"
        description="¿Estás seguro de que querés eliminar este vehículo? Esta acción no se puede deshacer."
        confirmText="Aceptar"
        cancelText="Cancelar"
      />
    </div>
  )
}