import { Reservation } from "@/models/reservation";
import { ReservationResponse } from "@/modules/reservation/create/types/dto/reservationResponseDTO";
import { cancelReservationByPassengerRequestDTO } from "@/modules/reservation/update/types/cancelReservationByPassenger";
import { DeleteTripPassengerDTO } from "@/modules/reservation/update/types/deleteTripPassenger";
import { ReservationDTO } from "@/modules/reservation/update/types/reservation";
import { ReservationUpdateDTO } from "@/modules/reservation/update/types/reservationUpdate";
import { fetchWithRefresh } from "@/shared/lib/http/authInterceptor";
import { NumberResponse, VoidResponse } from "@/shared/types/response";


export async function newReservation(data: Reservation): Promise<VoidResponse> {
  try {
    const res = await fetchWithRefresh('/api/reservation',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    })

    const response: VoidResponse = await res.json()

    if (!res.ok) {
      throw new Error(response.messages?.[0] || 'Error desconocido');
    }

    return response;
  } catch (error: unknown) {
    let message = "Error desconocido";
    if (error instanceof Error) message = error.message;

    return { data: null, messages: [message], state: "ERROR" };
  }
}

export async function getReservations(data: ReservationDTO, size: number, page:number): Promise<ReservationResponse>{
  try{
    const params = new URLSearchParams();

    // Agrega solo los parámetros que tienen valor
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    params.append("size", String(size));
    params.append("page", String(page));

    const url = `/api/reservation/filter?${params.toString()}`;

    const res = await fetchWithRefresh(url, {
      credentials: 'include',
    });

    const response: ReservationResponse = await res.json();
    
    if (!res.ok) {
      throw new Error(response.messages?.[0] || 'Error desconocido');
    }

    return response;
  }catch(error: unknown){
    let message = "Error desconocido";
    if (error instanceof Error) message = error.message;
    return { data: null, messages: [message], state: "ERROR" };
  }
}

export async function getMyReservations(
  state: string,
  skip: number,
  orderBy: string,
  fromDate?: Date,
  toDate?: Date
  ): Promise<ReservationResponse>{
  try{
    const params = new URLSearchParams();

    params.append("state", state);
    params.append("skip", skip.toString());
    params.append("orderBy", orderBy);

    if (fromDate) params.append("fromDate", fromDate.toISOString().split("T")[0]);
    if (toDate) params.append("toDate", toDate.toISOString().split("T")[0]);


    const url = `/api/reservation/me?${params.toString()}`;

    const res = await fetchWithRefresh(url, {
      credentials: 'include',
    });

    const response: ReservationResponse = await res.json();

    if(!res.ok){
      throw new Error(response.messages?.[0] || "Error desconocido");
    }

    return response;
  } catch (error: unknown) {
    let message = "Error desconocido";
    if (error instanceof Error) message = error.message;

    return { data: null, messages: [message], state: "ERROR" };
  }
}


export async function calculateTotal(idTrip: number, idStartCity: number, idDestinationCity: number): Promise<NumberResponse>{
  try{
    const params = new URLSearchParams();

    params.append("idTrip", idTrip.toString());
    params.append("idStartCity", idStartCity.toString());
    params.append("idDestinationCity", idDestinationCity.toString());

    const url = `/api/reservation/calculate-total?${params.toString()}`;
    
    const res = await fetchWithRefresh(url, {
      credentials: 'include',
    });

    const response: NumberResponse = await res.json();

    if (!res.ok){
      throw new Error(response.messages?.[0] || 'Error desconocido');
    }

    return response;
  }catch(error: unknown){
    let message = "Error desconocido";
    if (error instanceof Error) message = error.message;
    return { data: null, messages: [message], state: "ERROR" };
  }
}

export async function updateReservation(reservationUpdateRequest: ReservationUpdateDTO): Promise<VoidResponse>{
  try{
    const res = await fetchWithRefresh('/api/reservation',{
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationUpdateRequest),
      credentials: 'include'
    });

    const response: VoidResponse = await res.json()

    if (!res.ok) {
      throw new Error(response.messages?.[0] || 'Error desconocido');
    }

    return response;
  }catch(error: unknown){
    let message = "Error desconocido";
    if (error instanceof Error) message = error.message;
    return { data: null, messages: [message], state: "ERROR" };
  }
}

export async function deleteTripPassenger(request: DeleteTripPassengerDTO): Promise<VoidResponse>{
  try{
    const res = await fetchWithRefresh('/api/reservation/delete-trip-passenger',{
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      credentials: 'include'
    });

    const response: VoidResponse = await res.json()

    if (!res.ok) {
      throw new Error(response.messages?.[0] || 'Error desconocido');
    }

    return response;
  }catch(error: unknown){
    let message = "Error desconocido";
    if (error instanceof Error) message = error.message;
    return { data: null, messages: [message], state: "ERROR" };
  }
}

export async function cancelReservationByPassenger(request: cancelReservationByPassengerRequestDTO): Promise<VoidResponse>{
  try{
    const res = await fetchWithRefresh('/api/reservation/cancel',{
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      credentials: 'include'
    });

    const response: VoidResponse = await res.json()

    if (!res.ok) {
      throw new Error(response.messages?.[0] || 'Error desconocido');
    }

    return response;
  }catch(error: unknown){
    let message = "Error desconocido";
    if (error instanceof Error) message = error.message;
    return { data: null, messages: [message], state: "ERROR" };
  }
}

export async function payReservation(): Promise<VoidResponse> {
  try {
    const res = await fetchWithRefresh('/api/reservation/payment', {
      method: 'POST',
      credentials: 'include'
    });

    const response: VoidResponse = await res.json();

    if (!res.ok || response.state === "ERROR") {
      throw new Error(response.messages?.[0] || 'Error desconocido');
    }

    return response;
  } catch (error: unknown) {
    let message = "Error desconocido";
    if (error instanceof Error) message = error.message;

    return { data: null, messages: [message], state: "ERROR" };
  }
}

/**
 * Descarga el comprobante PDF de una reserva completada.
 *
 * Realiza la petición al endpoint de Next.js que actúa como proxy hacia el backend,
 * convierte la respuesta en un Blob y dispara la descarga en el navegador.
 *
 * @param reservationId - Id de la reserva completada
 * @returns Promise<void>
 */
export async function downloadPaymentReceipt(reservationId: number): Promise<void> {
  try {
    const res = await fetchWithRefresh(`/api/reservation/${reservationId}/receipt`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Error al descargar el comprobante");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `comprobante-carpool.pdf`;
    a.click();

    URL.revokeObjectURL(url);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error descargando comprobante:", message);
  }
}