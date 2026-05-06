import { BaseResponse } from "@/shared/types/response";
import { TopCityStat } from "../topCity";


export interface TopCityStatResponseDTO {
  cities: TopCityStat[]
  totalReservationsCount: number
}


export type TopCityStatResponse = BaseResponse<TopCityStatResponseDTO>