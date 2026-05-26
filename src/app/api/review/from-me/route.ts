import { API_URL } from "@/constants/api";
import { ReviewsFromMeDTO } from "@/modules/review/types/dto/ReviewsFromMeDTO";
import { NextRequest, NextResponse } from "next/server";



/**
 * Metodo para obtener las reseñas que he realizado
 * @param req 
 * @param context 
 * @returns 
 */
export async function GET(
  req: NextRequest
) {
  try {
    const token = req.cookies.get('token')?.value;


    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get("role");
    const skip = searchParams.get("skip");
    const orderBy = searchParams.get("orderBy");

    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    if (!role || !skip || !orderBy) {
      return NextResponse.json(
        {
          data: null,
          messages: ["Faltan parametros."],
          state: "ERROR",
        },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();

    params.append("skip", skip);
    params.append("orderBy", orderBy);
    params.append("role", role);


    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const res = await fetch(`${API_URL}/review/my-made-reviews?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const response: ReviewsFromMeDTO = await res.json();

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