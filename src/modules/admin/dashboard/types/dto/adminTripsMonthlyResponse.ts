import { BaseResponse } from "@/shared/types/response"

export interface AdminTripsMonthlyDTO {
  currentMonthTrips: number
  delta: number
}

export type AdminTripsMonthlyResponse = BaseResponse<AdminTripsMonthlyDTO>