import { BaseResponse } from "@/shared/types/response";

export interface TakenSeatsStatResponseDTO {
  takenPercentageFiltered: number;
  takenPercentageHistorical: number;
  totalTakenSeatsFiltered: number;
  totalTakenSeatsHistorical: number;
  totalUntakenSeatsFiltered: number;
  totalUntakenSeatsHistorical: number;
}

export type TakenSeatsStatResponse = BaseResponse<TakenSeatsStatResponseDTO>