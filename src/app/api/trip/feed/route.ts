
import { SearchTripResponse } from "@/modules/search/types/dto/searchTripResponseDTO";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const { searchParams } = new URL(req.url);

    const cityId = searchParams.get("cityId");
    const skip = searchParams.get("skip");

    if (!skip) {
      return NextResponse.json(
        { data: null, messages: ["Falta skip"], state: "ERROR" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    params.append("skip", skip);

    if (cityId) params.append("cityId", cityId);

    const res = await fetch(`${API_URL}/trip/feed?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response: SearchTripResponse = await res.json();

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
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { data: null, messages: [message], state: "ERROR" },
      { status: 500 }
    );
  }
}
