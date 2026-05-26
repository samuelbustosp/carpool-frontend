import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email;

    if (!email) {
      return new NextResponse(
        JSON.stringify({ message: "Falta el parámetro 'email'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const response = await fetch(`${API_URL}/users/resend-activation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    let message = "Error desconocido";

    if (error instanceof Error) {
      message = error.message;
    }
    return new NextResponse(
      JSON.stringify({ message: "Error en la API de resend activation", detail: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
