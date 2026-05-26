import { fetchWithRefresh } from "@/shared/lib/http/authInterceptor";
import { CityResponseDTO } from "@/modules/city/types/dto/CityResponseDTO";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/constants/api";



export async function GET(req: NextRequest) {
  try {
    //Obtener token de cookies
    const token = req.cookies.get('token')?.value;

    //Obtener lat y lng desde los query params
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        {
          data: null,
          messages: ["lat y lng son obligatorios"],
          state: "ERROR",
        },
        { status: 400 }
      );
    }

    // 
    const res = await fetchWithRefresh(
      `${API_URL}/city/coordinates?lat=${lat}&lng=${lng}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const response: CityResponseDTO = await res.json();

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
