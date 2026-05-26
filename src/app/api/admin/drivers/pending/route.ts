import { API_URL } from "@/constants/api";
import { DriverPendingResponse } from "@/modules/admin/licenses/types/dto/driverPendingResponse";
import { NextRequest, NextResponse } from "next/server";



/**
 * Recupera los todos los usuarios que tengan pendiente la verificacion de la licencia.
 * 
 * Realiza la llamada al backend para obtener los drivers pendientes,
 * y devuelve la respuesta estándar de tipo `DriverPendingResponse`.
 * 
 * @param req {NextRequest} - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON del tipo DriverPendingResponse.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const token = req.cookies.get('token')?.value;
    const skip = searchParams.get("skip");
    const orderBy = searchParams.get("orderBy");

    const res = await fetch(`${API_URL}/admin/drivers/pending?skip=${skip}&orderBy=${orderBy}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const response: DriverPendingResponse = await res.json();

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