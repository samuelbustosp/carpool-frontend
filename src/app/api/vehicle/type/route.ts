import { VehicleTypeResponseDTO } from "@/modules/vehicle/types/dto/vehicleTypeResponseDTO";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";

/**
 * Obtiene la lista de tipos de vehículos disponibles.
 *
 * Llama al backend usando el token de autenticación del usuario y devuelve
 * todos los tipos de vehículos que el usuario puede seleccionar al registrar
 * o actualizar un vehículo.
 *
 * @param {NextRequest} req - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON con los tipos de vehículos o error
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    const res = await fetch(`${API_URL}/vehicle-types`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response: VehicleTypeResponseDTO = await res.json();

    if (!res.ok || response.state === "ERROR") {
      const messages =
        response.messages?.length > 0
          ? response.messages
          : ["Error desconocido"];
      return NextResponse.json(
        { data: null, messages, state: "ERROR" },
        { status: res.ok ? 200 : res.status } 
      );
    }

    return NextResponse.json(response, { status: res.status });
  } catch (error: unknown) {
    // Manejo de errores inesperados
    const message = error instanceof Error ? error.message : "Error desconocido";
    const errorRes = NextResponse.json(
      { data: null, messages: [message], state: "ERROR" },
      { status: 500 }
    );
    return errorRes;
  }
}