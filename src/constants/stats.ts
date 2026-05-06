import { CalendarDays } from "lucide-react";

export const SECTIONS = [
    { key: "general", label: "Generales" },
    { key: "trips", label: "Viajes" },
    { key: "users", label: "Usuarios" },
  ]

export const FILTERS = [
  { label: 'Últimos 7 días', value: '7d' },
  { label: 'Último mes', value: 'month' },
  { label: 'Último año', value: 'year' },
  { label: 'Elegir período', value: 'custom', icon: CalendarDays},
]

export const LIMIT_OPTIONS = [1, 3, 5]