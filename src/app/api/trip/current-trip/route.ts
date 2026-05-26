
import { CurrentTripResponseDTO } from "@/modules/current-trip/types/dto/currentTripResponseDTO";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";

/**
 * Obtiene el viaje en curso de un chofer
 * 
 * Eealiza la llamada al backend para obtener el viaje en curso del chofer autenticado,
 * y devuelve la respuesta estándar de tipo `TripResponse`.
 * 
 * @param req {NextRequest} - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON con los detalles del viaje
 */
export async function GET(
  req: NextRequest,
) {
  try {
    const token = req.cookies.get('token')?.value;

    const res = await fetch(`${API_URL}/trip/current-trip`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
    });

    const response: CurrentTripResponseDTO = await res.json();

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