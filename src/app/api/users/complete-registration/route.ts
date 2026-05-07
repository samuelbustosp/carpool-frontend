import { GoogleLoginResponse } from "@/modules/auth/types/dto/googleAuthResponseDTO";
import { VoidResponse } from "@/shared/types/response";
import { parseJwt } from "@/shared/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Completa el registro de un usuario.
 *
 * Recibe el email y datos adicionales del formulario de registro,
 * realiza la llamada al backend para completar el registro del usuario,
 * y devuelve la respuesta estandarizada de tipo CompleteRegResponse.
 * 
 * @param {NextRequest} req - Objeto de la petición entrante de Next.js que contiene el body con los datos del usuario.
 * @returns {Promise<NextResponse>} - Respuesta JSON con la información del registro completado o un error estandarizado.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, accessToken, refreshToken, ...rest } = body;

    if (!email) {
      return NextResponse.json({ 
        data: null, 
        messages: ["Falta el campo 'email' en el body"], 
        state: "ERROR" 
      }, { status: 400 });
    }

    const res = await fetch(`${apiUrl}/users/complete-registration`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        'Authorization': `Bearer ${accessToken}` 
      },
      body: JSON.stringify({ email, ...rest }), 
    });

    if (!res.ok) {
      const errorJson: GoogleLoginResponse = await res.json();

      const errorRes = NextResponse.json(errorJson, { status: res.status });
      errorRes.cookies.delete("token");
      errorRes.cookies.delete("refreshToken");

      return errorRes;
    }

    const response: VoidResponse = await res.json();

    const nextRes = NextResponse.json(response, { status: res.status });

    if (accessToken) {
      const decoded = parseJwt(accessToken);
      const iat = Number(decoded?.iat);
      const exp = Number(decoded?.exp);
      const maxAge = exp > iat ? exp - iat : 60 * 60 * 2;

      nextRes.cookies.set('token', accessToken, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
      });
    }

    if (refreshToken) {
      const decoded = parseJwt(refreshToken);
      console.log('decoded',decoded)
      const iat = Number(decoded?.iat);
      const exp = Number(decoded?.exp);
      const maxAge = exp > iat ? exp - iat : 60 * 60 * 2;

      nextRes.cookies.set('refreshToken', refreshToken, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
      });
    }

    return nextRes;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    const errorRes = NextResponse.json(      
      { data: null, messages: [message], state: "ERROR" },
      { status: 500 }
    );
    errorRes.cookies.delete('token');         
    errorRes.cookies.delete('refreshToken');
    return errorRes; 
  }
}