import { API_URL } from "@/constants/api";
import { VoidResponse } from "@/shared/types/response";
import { NextRequest, NextResponse } from "next/server";



/**
 * Valida o rechaza la licencia de un chofer pendiente.
 * 
 * Realiza una llamada al backend para aprobar o denegar la licencia de un chofer,
 * enviando su identificador junto con el estado de validación (booleano).
 * 
 * Devuelve una respuesta estandarizada de tipo `VoidResponse`.
 * 
 * @param req - Objeto de la petición entrante de Next.js.
 * @param context - Contexto de la ruta (incluye parámetros dinámicos como el id).
 * @returns {Promise<NextResponse>} Respuesta sin datos (`VoidResponse`).
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = req.cookies.get('token')?.value;
    const body = await req.json()

    const res = await fetch(`${API_URL}/admin/drivers/${id}/verify`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const response: VoidResponse = await res.json();

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