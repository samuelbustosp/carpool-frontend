import { UserDetailsResponseDTO } from "@/modules/profile/types/dto/userDetailsResponseDTO";
import { VoidResponse } from "@/shared/types/response";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";

/**
 * Obtiene los datos del usuario en sesion
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
    const res = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: { 
        'Authorization': `Bearer ${token}`
      },
    });

    const response: UserDetailsResponseDTO = await res.json();

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
 * Registra a un usuario
 *
 * Recibe los datos del usuario, realiza la llamada 
 * al backend para registrarlo, devuelve la respuesta
 * estándar de tipo VoidResponse.
 * 
 * @param {NextRequest} req - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON con el estado de la actualización
 */
export async function POST(req: NextRequest) {
  try {
    // Recibir el body de la petición
    const body = await req.json();

    // Extraer el token recaptcha de la cookie
    const recaptchaToken = req.headers.get('recaptcha');

    // Preparar headers para el backend
    const backendHeaders: Record<string, string> = {
      "Content-Type": "application/json"
    };

    // Si hay token de reCAPTCHA, agregarlo al header
    if (recaptchaToken) {
      backendHeaders['recaptcha'] = recaptchaToken;
    }

    // Llamar al backend para registrar al usuario
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: backendHeaders,
      body: JSON.stringify(body),
    });

    const response: VoidResponse = await res.json();

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
