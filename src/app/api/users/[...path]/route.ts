import { NextRequest, NextResponse } from "next/server";


import { API_URL } from "@/constants/api";


export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params; 
  const url = new URL(req.url);
  const query = url.search; 

  const backendUrl = `${API_URL}/users/${path.join("/")}${query}`;


  try {
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const response = await res.json();

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
