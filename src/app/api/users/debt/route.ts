import { UserDebtResponseDTO } from "@/modules/debt/types/UserDebtResponseDTO";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";

/**
 * Recupera el estado de deuda del usuario autenticado.
 * 
 * Realiza la llamada al backend para verificar si el usuario
 * posee deudas activas o expiradas y devuelve la respuesta estándar.
 *
 * @param req {NextRequest} - Petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON con el estado de deuda
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    const res = await fetch(`${API_URL}/users/debtor`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const response: {
      data: UserDebtResponseDTO | null;
      messages: string[];
      state: "OK" | "ERROR";
    } = await res.json();

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
    const message =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      { data: null, messages: [message], state: "ERROR" },
      { status: 500 }
    );
  }
}