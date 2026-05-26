import { API_URL } from "@/constants/api";
import { DriverReviewResponseDTO } from "@/modules/review/types/dto/DriverReviewResponseDTO";
import { NextRequest, NextResponse } from "next/server";



/**
 * Obtiene las reservas que otros usuarios le han realizado a un chofer
 * Recbe como parametros el id del chofer del cual se quieren obtener las reseñas
 * el skip para el paginado y el orderBy para determinar en que orden mostrar las reseñas
 * @returns 
 */
export async function GET(
  req: NextRequest
){
  try{
    const { searchParams } = req.nextUrl;

    const driverId = searchParams.get("driverId");
    const skip = searchParams.get("skip");
    const orderBy = searchParams.get("orderBy");
    const token = req.cookies.get('token')?.value


    if (!driverId) {
      return NextResponse.json(
        { state: "ERROR", messages: ["driverId es requerido"], data: null },
        { status: 400 }
      );
    }
    const res = await fetch(
      `${API_URL}/review/driver?driverId=${driverId}&skip=${skip ?? 0}&orderBy=${orderBy ?? "RECENT"}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const response: DriverReviewResponseDTO = await res.json();

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

  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    const errorRes = NextResponse.json(
      { data: null, messages: [message], state: "ERROR" },
      { status: 500 }
    );
    return errorRes;
  }
}