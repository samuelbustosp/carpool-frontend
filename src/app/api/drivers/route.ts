import { fetchWithRefresh } from "@/shared/lib/http/authInterceptor";
import { DriverResponse } from "@/modules/driver/types/dto/driverResponseDTO";

import { NextRequest, NextResponse } from "next/server";
import { DriverDetailsResponseDTO } from "@/modules/driver/types/dto/driverDetailsResponse";
import { API_URL } from "@/constants/api";



/**
 * Obtiene los datos del conductor en sesion
 * 
 * @param {NextRequest} req - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON con el estado de la actualización
 */
export async function GET(req: NextRequest) {
  // Obtenemos el token JWT desde las cookies
  const token = req.cookies.get("token")?.value;

  // Si no existe el token, devolvemos un error 400
  if (!token) {
    return NextResponse.json({ 
      data: null, 
      messages: ["Token inválido o expirado"], 
      state: "ERROR" 
    }, { status: 400 });
  }

  try {
  
    // Llamar al backend
    const res = await fetch(`${API_URL}/drivers`, {
      method: "GET",
      headers: { 
        'Authorization': `Bearer ${token}`
      },
    });

    const response: DriverDetailsResponseDTO = await res.json();

    // Devolver respuesta estandarizada
    return NextResponse.json(response, { status: res.status });
  } catch (error: unknown) {
    // Manejo de errores
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { data: null, messages: [message], state: "ERROR" }, 
      { status: 500 }
    );
  }
}


/**
 * Actualiza el perfil de un usuario.
 *
 * Recibe los datos del perfil desde la petición, realiza la llamada 
 * al backend para registrar al usuario como conductor, devuelve la respuesta
 * estándar de tipo `DriverResponse` y actualiza el access y el refresh token.
 * 
 * @param {NextRequest} req - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON con el estado del registro
 */
export async function POST(req: NextRequest) {
  try {
    // Recibir el token de la petición
    const token = req.cookies.get('token')?.value;
    const formData = await req.formData();

    // Llamada al backend con interceptor para refresco de tokens
    const res = await fetchWithRefresh(`${API_URL}/drivers`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    const response: DriverResponse = await res.json();

    const newAccessToken = response.data?.accessToken;
    const newRefreshToken = response.data?.refreshToken;

    // Guardar nuevos tokens en cookies
    const nextRes = NextResponse.json(response, { status: res.status });

    if (newAccessToken) {
      nextRes.cookies.set("token", newAccessToken, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    if (newRefreshToken) {
      nextRes.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    // Devolver respuesta estandarizada
    return nextRes;
  } catch (error: unknown) {
    let message = "Error desconocido";
    if (error instanceof Error) message = error.message;

    return NextResponse.json({
      data: null,
      messages: [message],
      state: "ERROR",
    }, { status: 500 });
  }
}
