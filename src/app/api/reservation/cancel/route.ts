import { API_URL } from "@/constants/api";
import { VoidResponse } from "@/shared/types/response";
import { NextRequest, NextResponse } from "next/server";


/**
 * Cancelar una solicitud de reserva realizada por el usuario en sesion
 * 
 * @param req 
 */
export async function PUT(req: NextRequest) {
  try{
    const token = req.cookies.get('token')?.value;
    const body = await req.json();

    const res = await fetch(`${API_URL}/reservation/cancel`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json" ,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });  
    
    const response: VoidResponse = await res.json()
    
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