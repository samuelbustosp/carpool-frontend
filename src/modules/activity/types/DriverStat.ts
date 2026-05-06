import { Stat } from "./Stat"


export interface DriverStat {
  historialTotal: number
  totalFiltered: number 
  historialByPeriod: Stat[]
}