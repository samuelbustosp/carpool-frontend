import { VoidResponse } from "@/shared/types/response";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/constants/api";

export async function POST(req: NextRequest){
    try {
        const body = await req.json();
        const token = body.token;
        if (!token) {
           return NextResponse.json(
                { data: null, messages:"Token inválido", state: "ERROR" },
                { status: 400 } 
            );
        }

        const res = await fetch(`${API_URL}/users/unlock-account`,{
            method: "POST",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify(body),
        })

        const response: VoidResponse = await res.json();

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