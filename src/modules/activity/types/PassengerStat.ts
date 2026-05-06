import { Stat } from "./Stat"


export interface PassengerStat {
  historialTotal: number
  totalFiltered: number 
  historialByPeriod: Stat[]
}