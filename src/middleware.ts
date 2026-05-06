import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_PATHS } from "./constants/paths/publicPaths";
import {verifyTokenWithServer} from './services/auth/authService'
import { isTokenExpired, parseJwt } from "./shared/utils/jwt";


export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  //IGNORAR TODAS LAS API ROUTES DEL FRONTEND
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  //RUTAS PÚBLICAS
  const isPublicPage = PUBLIC_PATHS.pages.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );

  if (isPublicPage) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/files')) return NextResponse.next();


  //TOKEN
  const token = req.cookies.get("token")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;


  if (!token) {
    return redirectToLogin(req);
  }


  //EXPIRACIÓN
  if (isTokenExpired(token)) {
    if (refreshToken) {
      const newTokens = await refreshAccessToken(refreshToken);
      if (newTokens) {
        const response = NextResponse.next();
        setTokenCookies(response, newTokens);
        return response;
      }
    }
    return redirectToLogin(req);
  }

  // Controlar errores.
  const isValid = await verifyTokenWithServer(token);
  if (!isValid) {
    const response = redirectToLogin(req);
    clearAuthCookies(response);
    return response;
  }

  //ROLES
  const payload = parseJwt(token);
  if (!payload) return redirectToLogin(req);

  return NextResponse.next();
}

//HELPERS

function clearAuthCookies(res: NextResponse): NextResponse {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 0,
  };

  res.cookies.set('token', '', cookieOptions);
  res.cookies.set('refreshToken', '', cookieOptions);

  return res;
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

async function refreshAccessToken(refreshToken: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    if (!res.ok) return null;
    const data = await res.json();

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? refreshToken,
    };
  } catch {
    return null;
  }
}

function setTokenCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken?: string }
) {
  const { accessToken, refreshToken } = tokens;


  if(accessToken ) {
    const decoded = parseJwt(accessToken);
    const iat = Number(decoded?.iat);
    const exp = Number(decoded?.exp);
    const maxAge = exp > iat ? exp - iat : 60 * 60 * 2; // 2 horas por defecto
    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge,
    });
  }
 

  if (refreshToken) {
    const decoded = parseJwt(refreshToken);
    const iat = Number(decoded?.iat);
    const exp = Number(decoded?.exp);
    const maxAge = exp > iat ? exp - iat : 60 * 60 * 2; // 2 horas por defecto
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge,
    });
  }
}

//MATCHER
export const config = {
  matcher: [
    "/((?!_next|icons|favicon.ico|manifest.webmanifest|sw.js|workbox-).*)",
  ],
};


