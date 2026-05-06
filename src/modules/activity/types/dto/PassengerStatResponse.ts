import { BaseResponse } from "@/shared/types/response";
import { PassengerStat } from "../PassengerStat";
import { CO2Stat } from "../CO2Stat";


export type PassengerStatResponse = BaseResponse<PassengerStat>

export type PassengerCO2StatResponse = BaseResponse<CO2Stat>