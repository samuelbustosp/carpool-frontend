
import { API_URL } from "@/constants/api";
import { DriversPercentageResponse } from "@/modules/admin/dashboard/types/dto/driversPercentageResponse";
import { NextRequest, NextResponse } from "next/server";


/**
 * Obtiene estadísticas de los conductores.
 *
 * Devuelve el total de usuarios registrados como conductores,
 * el porcentaje respecto al total de usuarios y la cantidad de conductores activos.
 * 
 * 
 * @param req {NextRequest} - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON del tipo DriversPercentageResponse.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    
    const res = await fetch(`${API_URL}/admin/stats/drivers-percentage`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const response: DriversPercentageResponse = await res.json();

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