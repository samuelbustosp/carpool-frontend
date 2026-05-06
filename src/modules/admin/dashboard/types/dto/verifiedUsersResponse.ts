import { BaseResponse } from "@/shared/types/response"

export interface VerifiedUserDTO {
  totalVerified: number
}

export type VerifiedUserResponse = BaseResponse<VerifiedUserDTO>