import { TripHistoryUserResponse } from "@/modules/history/types/dto/TripHistoryUserResponseDTO";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";


export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    const { searchParams } = new URL(req.url);
    const statesParam = searchParams.get('states');
    const skipParam = searchParams.get('skip');

    const params = new URLSearchParams();

    if (skipParam) {
      params.append("skip", skipParam);
    }

    if (statesParam) {
      statesParam.split(',').forEach(state => {
        params.append("namesStateTrip", state);
      });
    }

    const query = params.toString() ? `?${params.toString()}` : "";

    const res = await fetch(`${API_URL}/trip/history-trip-user${query}`, {
      headers: { 
        "Content-Type": "application/json" ,
        'Authorization': `Bearer ${token}`
      },
    });

    const response: TripHistoryUserResponse = await res.json();

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