
import { PassengerCO2StatResponse, PassengerStatResponse } from "@/modules/activity/types/dto/PassengerStatResponse";
import { buildQuery } from "@/shared/utils/query";


export async function getTripsStats(
  fromDate: string, 
  toDate: string, 
  groupBy:string
): Promise<PassengerStatResponse> {
  try {
    const query = buildQuery({fromDate, toDate, groupBy})

    const res = await fetch(`/api/stats/passenger/trips${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: PassengerStatResponse = await res.json()

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

export async function getKmStats(
  fromDate: string, 
  toDate: string, 
  groupBy:string
): Promise<PassengerStatResponse> {
  try {
    const query = buildQuery({fromDate, toDate, groupBy})

    const res = await fetch(`/api/stats/passenger/km${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: PassengerStatResponse = await res.json()

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

export async function getCO2Stats(): Promise<PassengerCO2StatResponse> {
  try {

    const res = await fetch(`/api/stats/passenger/co2`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: PassengerCO2StatResponse = await res.json()

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