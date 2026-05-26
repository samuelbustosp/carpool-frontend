import { fetchWithRefresh } from "@/shared/lib/http/authInterceptor";
import { TokensResponse } from "@/shared/types/response";
import { parseJwt } from "@/shared/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";

/**
 * Actualiza el correo electrónico de un usuario.
 *
 * Recibe el correo elcetrónico anterior, realiza la llamada al backend 
 * para actualizar el correo elcetrónico, devuelve la respuesta
 * estándar de tipo UserResponse y actualiza el access y el refresh token.
 * 
 * @param {NextRequest} req - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON con el estado de la actualización
 */
export async function PUT(req: NextRequest) {
  try {
    // Recibir body de la petición
    const body = await req.json();
    const token = req.cookies.get('token')?.value;

    // Llamada al backend con interceptor para refresco de tokens
    const res = await fetchWithRefresh(`${API_URL}/users/update-email`, {
      method: "PUT",
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body), 
    });

    const response: TokensResponse = await res.json();

    const newAccessToken = response.data?.accessToken;
    const newRefreshToken = response.data?.refreshToken;

    // Guardar nuevos tokens en cookies
    const nextRes = NextResponse.json(response, { status: res.status });

    if (newAccessToken) {
      const decoded = parseJwt(newAccessToken);
      const iat = Number(decoded?.iat);
      const exp = Number(decoded?.exp);
      const maxAge = exp > iat ? exp - iat : 60 * 60 * 2; // 2 horas por defecto

      nextRes.cookies.set("token", newAccessToken, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
      });
    }

    if (newRefreshToken) {
      nextRes.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });
    }

    // Devolver respuesta estandarizada
    return nextRes;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { data: null, messages: [message], state: "ERROR" }, 
      { status: 500 }
    );
  }
}
