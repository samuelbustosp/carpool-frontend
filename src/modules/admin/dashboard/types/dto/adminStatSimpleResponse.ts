import { Stat } from "@/modules/activity/types/Stat"
import { BaseResponse } from "@/shared/types/response"

export interface AdminStatSimpleDTO {
  historicalTotal: number
  totalFiltered: number
  historialByPeriod: Stat[]
}

export interface AdminStatDTO {
  historicalTotal: number
  totalFiltered: number
}

export type AdminStatsSimpleResponse = BaseResponse<AdminStatSimpleDTO>
export type AdminStatsResponse = BaseResponse<AdminStatDTO>