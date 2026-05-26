import { API_URL } from "@/constants/api";
import { BooleanResponse } from "@/shared/types/response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    const res = await fetch(`${API_URL}/notification`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const response: BooleanResponse = await res.json();

    if (!res.ok || response.state === "ERROR") {
      const messages =
        response.messages?.length > 0
          ? response.messages
          : ["Error desconocido"];

      return NextResponse.json(
        { data: false, messages, state: "ERROR" },
        { status: res.ok ? 200 : res.status }
      );
    }

    return NextResponse.json(response, { status: res.status });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      { data: false, messages: [message], state: "ERROR" },
      { status: 500 }
    );
  }
}