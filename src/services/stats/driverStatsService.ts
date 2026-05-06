import { DriverCO2StatResponse, DriverStatResponse } from "@/modules/activity/types/dto/DriverStatResponse";
import { buildQuery } from "@/shared/utils/query";


export async function getDriverTripsStats(
  fromDate: string, 
  toDate: string, 
  groupBy:string
): Promise<DriverStatResponse> {
  try {
    const query = buildQuery({fromDate, toDate, groupBy})

    const res = await fetch(`/api/stats/driver/trips${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: DriverStatResponse = await res.json()

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

export async function getDriverKmStats(
  fromDate: string, 
  toDate: string, 
  groupBy:string
): Promise<DriverStatResponse> {
  try {
    const query = buildQuery({fromDate, toDate, groupBy})

    const res = await fetch(`/api/stats/driver/km${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: DriverStatResponse = await res.json()

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

export async function getDriverEarningStats(
  fromDate: string, 
  toDate: string, 
  groupBy:string
): Promise<DriverStatResponse> {
  try {
    const query = buildQuery({fromDate, toDate, groupBy})

    const res = await fetch(`/api/stats/driver/earnings${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: DriverStatResponse = await res.json()

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

export async function getDriverCO2Stats(): Promise<DriverCO2StatResponse> {
  try {

    const res = await fetch(`/api/stats/driver/co2`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: DriverCO2StatResponse = await res.json()

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