import { BaseResponse } from "@/shared/types/response"

export interface AdminCO2StatDTO {
  totalC02Saved: number
}

export type AdminCO2StatResponse = BaseResponse<AdminCO2StatDTO>