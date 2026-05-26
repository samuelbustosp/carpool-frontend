import { API_URL } from "@/constants/api";
import { TakenSeatsStatResponse } from "@/modules/admin/dashboard/types/dto/takenSeatsStatResponse";
import { buildQuery } from "@/shared/utils/query";
import { NextRequest, NextResponse } from "next/server";


/**
 * Obtiene el porcentaje de ocupación de los viajes.
 *
 * Calcula la ocupación promedio de asientos en los viajes,
 * permitiendo filtrar por un rango de fechas.
 * 
 * @param req {NextRequest} - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON del tipo TakenSeatsStatResponse.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const token = req.cookies.get('token')?.value;
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const query = buildQuery({fromDate, toDate})

    const res = await fetch(`${API_URL}/admin/stats/seats-percentage${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const response: TakenSeatsStatResponse = await res.json();

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