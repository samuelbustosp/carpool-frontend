"use client"


import { Vehicle } from "@/models/vehicle";
import { VehicleUpdateForm } from "@/modules/vehicle/components/update-vehicle/VehicleUpdateForm";
import { VehicleResponseDTO } from "@/modules/vehicle/types/dto/vehicleResponseDTO";
import { getVehicleById } from "@/services/vehicle/vehicleService";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VehicleEditPage() {
  //Capturar el id
  const { id } = useParams(); // obtienes el id directamente

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // Aún no está disponible

    const fetchVehicle = async () => {
      try {
        const response: VehicleResponseDTO = await getVehicleById(Number(id));
        if (response.state === "ERROR" || !response.data) {
          setError(response.messages?.[0] || "Error al obtener los datos del vehículo");
          return;
        }
        setVehicle(response.data);
      } catch {
        setError("Error al obtener los datos del vehículo");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-gray-2 mb-2" />
        <p className="text-gray-2">Cargando información del vehículo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center">
      <div className="w-full max-w-lg">
        {vehicle && <VehicleUpdateForm vehicle={vehicle} />}
      </div>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}