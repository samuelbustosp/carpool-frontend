import { API_URL } from "@/constants/api";
import { MediaResponse } from "@/shared/types/response";
import { NextRequest, NextResponse } from "next/server";

/**
 * Obtiene la imagen de perfil de un usuario
 * 
 * Realiza la llamada al backend para obtener la url de la imagen de perfil
 * de un usuario autenticado y devuelve la respuesta estándar de tipo `MediaResponse`.
 * 
 * @param req {NextRequest} - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON del tipo MediaResponse
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    const res = await fetch(`${API_URL}/media/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response: MediaResponse = await res.json();

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

/**
 * Sube la foto de perfil de un usuario
 * 
 * Realiza una llamada al backend para subir una imagen de perfil,
 * enviando la imagen tipo File en el body.
 * 
 * Devuelve una respuesta estandarizada de tipo `MediaResponse`.
 * 
 * @param req - Objeto de la petición entrante de Next.js.
 * @returns {Promise<NextResponse>} Respuesta del tipo `MediaResponse`.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const formData = await req.formData();

    const res = await fetch(`${API_URL}/media/profile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const response: MediaResponse = await res.json();

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

/**
 * Elimina la foto de perfil de un usuario
 * 
 * Realiza una llamada al backend para eliminar una imagen de perfil 
 * de un usuario.
 * 
 * Devuelve una respuesta estandarizada de tipo `MediaResponse`.
 * 
 * @param req - Objeto de la petición entrante de Next.js.
 * @returns {Promise<NextResponse>} Respuesta del tipo `MediaResponse`.
 */
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    const res = await fetch(`${API_URL}/media/profile`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response: MediaResponse = await res.json();

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