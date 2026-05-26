
import { SearchTripResponse } from "@/modules/search/types/dto/searchTripResponseDTO";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const skip = searchParams.get("skip");

    if (!body || !skip) {
      return NextResponse.json(
        { data: null, messages:'Faltan parametros', state: "ERROR" },
        { status: 400} 
      );
    }
    const params = new URLSearchParams();
    params.append("skip", skip);
   
    const res = await fetch(`${API_URL}/trip/search?${params.toString()}`, {
        method:'POST',
        headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const response: SearchTripResponse = await res.json();

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
