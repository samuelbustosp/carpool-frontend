
import { API_URL } from "@/constants/api";
import { ReservationResponse } from "@/modules/reservation/create/types/dto/reservationResponseDTO";
import { NextRequest, NextResponse } from "next/server";




export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const { searchParams } = new URL(req.url);
    const paramsObject = {
      idTrip: searchParams.get("idTrip"),
      idStartCity: searchParams.get("idStartCity"),
      idDestinationCity: searchParams.get("idDestinationCity"),
      baggage: searchParams.get("baggage"),
      nameState: searchParams.get("nameState"),
    };

    const params = new URLSearchParams();

    Object.entries(paramsObject).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    });

    const url = `${API_URL}/reservation/filter?${params.toString()}`;
   
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const response: ReservationResponse = await res.json();

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

    return NextResponse.json(response,{ status: res.status });
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