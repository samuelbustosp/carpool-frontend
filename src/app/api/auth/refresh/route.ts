
import { API_URL } from '@/constants/api';
import { RefreshResponse } from '@/modules/auth/types/dto/refreshResponseDTO';
import { parseJwt } from '@/shared/utils/jwt';

import { NextRequest, NextResponse } from 'next/server';


/**
 * Refresca el access token
 *
 * Extrae el refresh token de la cookie, realiza la llamada 
 * al backend para refrescar el access token, devuelve la respuesta
 * estándar de tipo RefreshResponse.
 * 
 * @param {NextRequest} req - Objeto de la petición entrante de Next.js
 * @returns {Promise<NextResponse>} - Respuesta JSON con el estado de la actualización
 */
export async function POST(req: NextRequest) {
  // Extraer el refresh token de la cookie
  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ 
      data: null, 
      messages: ["Refresh token no encontrado"], 
      state: "ERROR" 
    }, { status: 400 });
  }
  
  try {
    // Llamar al backend
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json'
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      const errorRes = NextResponse.json(
        { data: null, messages: [errorText], state: "ERROR" },
        { status: res.status }
      );
      
      // Limpiar cookies si falla
      errorRes.cookies.delete('token');
      errorRes.cookies.delete('refreshToken');

      return errorRes;
    }

    const response: RefreshResponse = await res.json();

    if (!response.data?.accessToken || !response.data?.refreshToken) {
      return NextResponse.json({ 
        data: null, 
        messages: ["Tokens inválidos"], 
        state: "ERROR" 
      }, { status: 401 });
    }

    const newAccessToken = response.data?.accessToken;
    const newRefreshToken = response.data?.refreshToken;

    const nextRes = NextResponse.json(response, { status: res.status });

    // Guardar nuevos tokens en la cookie
    if (newAccessToken) {
      // Decodificar el token para calcular la duración
      const decoded = parseJwt(newAccessToken);
      const iat = Number(decoded?.iat);
      const exp = Number(decoded?.exp);
      const maxAge = exp > iat ? exp - iat : 60 * 60 * 2; // 2 horas por defecto

      nextRes.cookies.set('token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge, // Setear la duración
      })
    }

    if (newRefreshToken) {
      const decoded = parseJwt(newRefreshToken);
      const iat = Number(decoded?.iat);
      const exp = Number(decoded?.exp);
      const maxAge = exp > iat ? exp - iat : 60 * 60 * 2; // 2 horas por defecto

      nextRes.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
      });
    }

    // Devolver respuesta estandarizada
    return nextRes;
  } catch (error: unknown) {
    // Manejo de errores inesperados
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