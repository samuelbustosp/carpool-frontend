import { AdminCO2StatResponse } from "@/modules/admin/dashboard/types/dto/adminCO2Response";
import { AdminStatsResponse, AdminStatsSimpleResponse } from "@/modules/admin/dashboard/types/dto/adminStatSimpleResponse";
import { DriversPercentageResponse } from "@/modules/admin/dashboard/types/dto/driversPercentageResponse";
import { TakenSeatsStatResponse } from "@/modules/admin/dashboard/types/dto/takenSeatsStatResponse";
import { TopCityStatResponse } from "@/modules/admin/dashboard/types/dto/topCityStatResponse";
import { VerifiedUserResponse } from "@/modules/admin/dashboard/types/dto/verifiedUsersResponse";
import { buildQuery } from "@/shared/utils/query";

/**
 * -------------------------------------------------------------------------
 * CATEGORIA GENERAL
 * -------------------------------------------------------------------------
 */

export async function getAppEarnings(
  fromDate: string, 
  toDate: string, 
): Promise<AdminStatsSimpleResponse> {
  try {
    const query = buildQuery({fromDate, toDate})

    const res = await fetch(`/api/admin/stats/earnings${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: AdminStatsSimpleResponse = await res.json()

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

export async function getTotalTransacted(
  fromDate: string, 
  toDate: string, 
): Promise<AdminStatsSimpleResponse> {
  try {
    const query = buildQuery({fromDate, toDate})

    const res = await fetch(`/api/admin/stats/transacted${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: AdminStatsSimpleResponse = await res.json()

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

export async function getCompletedTrips(
  fromDate: string, 
  toDate: string, 
): Promise<AdminStatsSimpleResponse> {
  try {
    const query = buildQuery({fromDate, toDate})

    const res = await fetch(`/api/admin/stats/trips${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: AdminStatsSimpleResponse = await res.json()

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

export async function getTotalCO2Saved(): Promise<AdminCO2StatResponse> {
  try {
  
    const res = await fetch(`/api/admin/stats/co2`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: AdminCO2StatResponse = await res.json()

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

/**
 * -------------------------------------------------------------------------
 * CATEGORIA VIAJES
 * -------------------------------------------------------------------------
 */
export async function getTopOriginCities(limit: number): Promise<TopCityStatResponse> {
  try {
    const query = buildQuery({limit})

    const res = await fetch(`/api/admin/stats/top/origin${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: TopCityStatResponse = await res.json()

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

export async function getTopDestinationCities(limit:number): Promise<TopCityStatResponse> {
  try {
    const query = buildQuery({limit})

    const res = await fetch(`/api/admin/stats/top/destination${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: TopCityStatResponse = await res.json()
    
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

export async function getSeatsPercentage(
  fromDate: string, 
  toDate: string, 
): Promise<TakenSeatsStatResponse> {
  try {
    const query = buildQuery({fromDate, toDate})

    const res = await fetch(`/api/admin/stats/seats-percentage${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: TakenSeatsStatResponse = await res.json()

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

export async function getPublishedTrips(
  fromDate: string, 
  toDate: string
): Promise<AdminStatsResponse> {
  try {
    const query = buildQuery({fromDate, toDate})

    const res = await fetch(`/api/admin/stats/trips/published${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: AdminStatsResponse = await res.json()

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
/**
 * -------------------------------------------------------------------------
 * CATEGORIA USUARIOS
 * -------------------------------------------------------------------------
 */

export async function getDriversPercentage(): Promise<DriversPercentageResponse> {
  try {

    const res = await fetch(`/api/admin/stats/drivers-percentage`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: DriversPercentageResponse = await res.json()
    
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

export async function getNewUsers(
  fromDate: string, 
  toDate: string, 
  groupBy: string
): Promise<AdminStatsSimpleResponse> {
  try {
    const query = buildQuery({fromDate, toDate, groupBy})

    const res = await fetch(`/api/admin/stats/users/new${query}`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: AdminStatsSimpleResponse = await res.json()

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

export async function getVerifiedUsers(): Promise<VerifiedUserResponse> {
  try {

    const res = await fetch(`/api/admin/stats/users/verified`,{
      method: 'GET',
      credentials: 'include',
    })

    const response: VerifiedUserResponse = await res.json()

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