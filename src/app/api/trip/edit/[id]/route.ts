
import { TripResponseDTO } from "@/modules/trip/types/dto/tripResponseDTO";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";

/**
 * Recupera los detalles de un viaje específico para editar.
 * 
 * Recibe el ID del viaje como parámetro de la ruta,
 * realiza la llamada al backend para obtener los detalles del viaje,
 * y devuelve la respuesta estándar de tipo `TripResponse`.
 * 
 * @param req {NextRequest} - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON con los detalles del viaje
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = req.cookies.get('token')?.value;

    const res = await fetch(`${API_URL}/trip/edit/${id}`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
    });

    const response: TripResponseDTO = await res.json();

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