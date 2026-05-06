import { BaseResponse } from "@/shared/types/response";
import { CO2Stat } from "../CO2Stat";
import { DriverStat } from "../DriverStat";


export type DriverStatResponse = BaseResponse<DriverStat>

export type DriverCO2StatResponse = BaseResponse<CO2Stat>