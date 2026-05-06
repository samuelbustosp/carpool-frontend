import { PassengerStatResponse } from "@/modules/activity/types/dto/PassengerStatResponse";
import { buildQuery } from "@/shared/utils/query";
import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Obtiene las estadísticas de kilómetros realizados por el pasajero
 * dentro de un período determinado, agrupadas según el criterio indicado.
 * 
 * Permite consultar la cantidad de kilómetros entre dos fechas (`fromDate` y `toDate`)
 * y agrupar los resultados por día, semana, mes o año según `groupBy`.
 * 
 * @param req {NextRequest} - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON del tipo PassengerStatResponse.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const token = req.cookies.get('token')?.value;
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const groupBy = searchParams.get("groupBy");

    const query = buildQuery({fromDate, toDate, groupBy})

    const res = await fetch(`${apiUrl}/stats/passenger/km${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const response: PassengerStatResponse = await res.json();

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