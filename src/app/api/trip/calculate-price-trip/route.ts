import { TripPriceCalculationResponseDTO } from "@/modules/trip/types/dto/tripResponseDTO";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";

/**
 * Metodo para calcular el precio de publicacion de un asiento de un viaje
 *
 * Recibe el precio y la cantidad de asientos, realiza la llamada al backend
 * y devuelve la respuesta estándar indicando el precio final con tarifa aplicada
 *
 * @param {NextRequest} req - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON con estado de la creación
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const { searchParams } = new URL(req.url);

    const seatPrice = searchParams.get("seatPrice");
    const availableSeats = searchParams.get("availableCurrentSeats");
    
    if (!seatPrice || !availableSeats) {
      return NextResponse.json(
        {
          data: null,
          messages: ["Precio y cantidad de asientos son obligatorios"],
          state: "ERROR",
        },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_URL}/trip/calculate-price-trip?seatPrice=${seatPrice}&availableCurrentSeats=${availableSeats}`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      },
    });

    const response: TripPriceCalculationResponseDTO = await res.json();

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
