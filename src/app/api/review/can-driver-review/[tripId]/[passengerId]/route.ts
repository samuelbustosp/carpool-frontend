import { API_URL } from "@/constants/api";
import { BooleanResponse } from "@/shared/types/response";
import { NextRequest, NextResponse } from "next/server";


/**
 * Ddeterminar si el usuario en sesion puede realizar una reseña a un chofer de un determinado viaje
 * Recibe el id del viaje que se desea reseñar
 * @param req 
 * @returns devuelve una response con un booleano que indica el resultado de la consulta
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ tripId: string, passengerId:string}> }
) {
  const { tripId, passengerId } = await context.params;
  try {
    const token = req.cookies.get('token')?.value;


    const res = await fetch(`${API_URL}/review/can-driver-review/${tripId}/${passengerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
    });

    const response: BooleanResponse = await res.json();

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