import { API_URL } from "@/constants/api";
import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Descarga el comprobante PDF de una reserva completada del usuario en sesión.
 *
 * Recibe el id de la reserva como parámetro de ruta y devuelve el PDF generado
 * por el backend como un archivo descargable.
 *
 * @param req - Objeto de la petición entrante de Next.js
 * @param params - Parámetros de ruta, contiene el id de la reserva
 * @returns PDF como stream binario o respuesta de error en JSON
 */

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export async function GET(
  req: NextRequest,
  { params }: Props
) {
  try {
    const token = req.cookies.get("token")?.value;
    const { id } = await params;

    const res = await fetch(`${API_URL}/reservation/${id}/receipt`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { data: null, messages: ["Error al generar el comprobante"], state: "ERROR" },
        { status: res.status }
      );
    }

    const pdfBuffer = await res.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="comprobante-carpool.pdf"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { data: null, messages: [message], state: "ERROR" },
      { status: 500 }
    );
  }
}