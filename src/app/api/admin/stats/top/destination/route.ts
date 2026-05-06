
import { TopCityStatResponse } from "@/modules/admin/dashboard/types/dto/topCityStatResponse";
import { buildQuery } from "@/shared/utils/query";
import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Obtiene el top de ciudades como destino.
 *
 * Devuelve un ranking de las ciudades más elegidas como destino de viaje,
 * permitiendo filtrar por un límite de resultados.
 * 
 * @param req {NextRequest} - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON del tipo TopCityStatResponse.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const token = req.cookies.get('token')?.value;
    const limit = searchParams.get("limit");

    const query = buildQuery({limit})

    const res = await fetch(`${apiUrl}/admin/stats/top/destination${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const response: TopCityStatResponse = await res.json();


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