
import { AdminCO2StatResponse } from "@/modules/admin/dashboard/types/dto/adminCO2Response";
import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Obtiene las estadísticas de CO2 total ahorrado en la plataforma.
 * 
 * Devuelve el total estimado de emisiones de CO₂ evitadas,
 * calculado en función del uso compartido de viajes.
 * 
 * @param req {NextRequest} - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON del tipo AdminCO2StatResponse.
 */
export async function GET(req: NextRequest) {
  try {
    
    const token = req.cookies.get('token')?.value;

    const res = await fetch(`${apiUrl}/admin/stats/co2`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const response: AdminCO2StatResponse = await res.json();

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