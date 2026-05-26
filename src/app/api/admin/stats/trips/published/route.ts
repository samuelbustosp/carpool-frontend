
import { API_URL } from "@/constants/api";
import { AdminStatsResponse } from "@/modules/admin/dashboard/types/dto/adminStatSimpleResponse";
import { buildQuery } from "@/shared/utils/query";
import { NextRequest, NextResponse } from "next/server";

/**
 * Obtiene el total de viajes publicados.
 *
 * Devuelve la cantidad total de viajes registrados en la plataforma,
 * independientemente de su estado, permitiendo filtrar por un rango de fechas.
 * 
 * @param req {NextRequest} - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON del tipo AdminCO2StatResponse.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const token = req.cookies.get('token')?.value;
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const query = buildQuery({fromDate, toDate})

    const res = await fetch(`${API_URL}/admin/stats/trips/published${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const response: AdminStatsResponse = await res.json();

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