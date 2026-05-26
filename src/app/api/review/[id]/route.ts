
import { API_URL } from "@/constants/api";
import { VoidResponse } from "@/shared/types/response";
import { NextRequest, NextResponse } from "next/server";


/**
 * Elimina una reseña hecha por el usuario en sesión
 * 
 * Recibe el ID de la reseña como parámetro de la ruta,
 * realiza la llamada al backend,
 * y devuelve la respuesta estándar de tipo `VoidResponse`.
 * 
 * @param req {NextRequest} - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON con los detalles del viaje
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = req.cookies.get('token')?.value;

    const res = await fetch(`${API_URL}/review/${id}`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      method: "DELETE"
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