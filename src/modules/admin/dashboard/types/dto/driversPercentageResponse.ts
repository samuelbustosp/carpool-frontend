import { BaseResponse } from "@/shared/types/response";


export interface DriversPercentageResponseDTO {
  driverPercentage:number;
  totalDrivers:number;
  totalActiveDrivers:number;
}

export type DriversPercentageResponse = BaseResponse<DriversPercentageResponseDTO>