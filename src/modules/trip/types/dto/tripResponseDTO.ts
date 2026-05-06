import { BaseResponse } from "@/shared/types/response";
import { TripDetailsData } from "../tripDetails";

export type TripResponseDTO = BaseResponse<TripDetailsData>
export type VerifyCreatorResponse = BaseResponse<{ isCreator: boolean }>
export type TripPriceCalculationResponseDTO = BaseResponse<{ seatPrice:number, publishedSeatPrice: number, netEarningsPerSeat: number ,driverPriceDiscount: number, commission:number}>