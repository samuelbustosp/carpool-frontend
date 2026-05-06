import { endOfMonth, startOfMonth, subDays } from 'date-fns';

export type GroupByType = "DAY" | "WEEK" | "MONTH" | "YEAR"

/**
 * Convierte el filtro seleccionado del frontend
 * en el tipo de agrupación utilizado por el backend.
 */
export function mapFilterToOrderBy(filter: string): string {
  switch (filter) {
    case "7d":
      return "DAY";
    case "month":
      return "WEEK";
    case "year":
      return "MONTH";
    default:
      return "MONTH"; 
  }
}

export function formatFilterLabel(filter: string): string {
  switch (filter) {
    case "7d":
      return "últimos 7 días"

    case "month":
      return "últimos 30 días"

    case "year":
      return "último año"

    case "custom":
      return "período seleccionado"

    default:
      return filter
  }
}

export function formatFilterLabelPrevious(filter: string): string {
  switch (filter) {
    case "7d":
      return "vs sem. pasada"

    case "month":
      return "vs mes pasado"

    case "year":
      return "vs año pasado"

    case "custom":
      return "vs período anterior"

    default:
      return "vs período anterior"
  }
}

/**
 * Devuelve el rango de fechas correspondiente
 * según el filtro seleccionado.
 */
export function getRangeForFilter(filter: string): { from: Date; to: Date } {
  const now = new Date()
  switch (filter) {
    case '7d':   return { from: subDays(now, 7), to: now }
    case 'month': return { from: startOfMonth(now), to: now }
    case 'year':
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: now
      }
    default:     return { from: startOfMonth(now), to: now }
  }
}

export function getPreviousRangeForFilter(
  filter: string,
  currentFrom: Date,
  currentTo: Date
): { from: Date; to: Date } {
  switch (filter) {
    case "7d": {
      const to = subDays(currentFrom, 1)
      const from = subDays(to, 6)

      return { from, to }
    }

    case "month": {
      const previousMonth = new Date(
        currentFrom.getFullYear(),
        currentFrom.getMonth() - 1,
        1
      )

      const from = startOfMonth(previousMonth)
      const to = endOfMonth(previousMonth)

      return { from, to }
    }

    case "year": {
      return {
        from: new Date(currentFrom.getFullYear() - 1, 0, 1),
        to: new Date(currentTo.getFullYear() - 1, currentTo.getMonth(), currentTo.getDate())
      }
    }

    case "custom":
    default: {
      const diffInMs = currentTo.getTime() - currentFrom.getTime()
      const diffInDays = Math.ceil(
        diffInMs / (1000 * 60 * 60 * 24)
      )

      const to = subDays(currentFrom, 1)
      const from = subDays(to, diffInDays)

      return { from, to }
    }
  }
}

/**
 * Determina automáticamente el tipo de agrupación
 * para un rango personalizado según su duración.
 */
export function getDynamicGroupBy(from: Date, to: Date) {
  const diffMs = to.getTime() - from.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const diffYears = to.getFullYear() - from.getFullYear()

  if (diffDays < 7) return "DAY"
  if (diffDays < 31) return "WEEK"
  if (diffYears >= 1) return "YEAR"

  return "MONTH"
}

/**
 * Convierte una fecha en formato string
 * a un objeto Date local.
 */
function parseLocalDate(label: string): Date {
  const separator = label.includes("/") ? "/" : "-"

  const [day, month, year] = label
    .split(separator)
    .map(Number)

  return new Date(year, month - 1, day)
}

/**
 * Formatea la etiqueta corta que se muestra
 * en el eje X del gráfico.
 */
export function formatLabelByGroup(
  label: string,
  groupBy: GroupByType
): string {
  const currentYear = new Date().getFullYear()

  const monthShort = (date: Date) =>
    date
      .toLocaleDateString("es-AR", {
        month: "short",
      })
      .replace(".", "")

  switch (groupBy) {
    case "DAY": {
      const date = parseLocalDate(label)

      const day = date.getDate()
      const month = monthShort(date)
      const year = date.getFullYear()

      return year === currentYear
        ? `${day} ${month}`
        : `${day} ${month} ${year}`
    }

    case "WEEK": {
      const start = parseLocalDate(label)
      const end = new Date(start)

      end.setDate(start.getDate() + 6)

      const startDay = start.getDate()
      const endDay = end.getDate()

      const startMonth = monthShort(start)
      const endMonth = monthShort(end)

      const year = start.getFullYear()

      if (startMonth === endMonth) {
        return year === currentYear
          ? `${startDay}-${endDay} ${startMonth}`
          : `${startDay}-${endDay} ${startMonth} ${year}`
      }

      return year === currentYear
        ? `${startDay} ${startMonth} - ${endDay} ${endMonth}`
        : `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`
    }

    case "MONTH": {
      const [month, year] = label.split("/").map(Number)

      const date = new Date(year, month - 1)

      return monthShort(date)
    }

    case "YEAR": {
      return label
    }

    default:
      return label
  }
}

/**
 * Formatea la etiqueta completa que se muestra
 * dentro del tooltip del gráfico.
 */
export function formatTooltipLabelByGroup(
  label: string,
  groupBy: GroupByType
): string {
  const fullMonth = (date: Date) =>
    date.toLocaleDateString("es-AR", {
      month: "long",
    })

  switch (groupBy) {
    case "DAY": {
      const date = parseLocalDate(label)

      return date.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    }

    case "WEEK": {
      const start = parseLocalDate(label)
      const end = new Date(start)

      end.setDate(start.getDate() + 6)

      return `${start.toLocaleDateString("es-AR")} - ${end.toLocaleDateString("es-AR")}`
    }

    case "MONTH": {
      const [month, year] = label.split("/").map(Number)
      const date = new Date(year, month - 1)

      return `${fullMonth(date)} ${year}`
    }

    case "YEAR":
      return label

    default:
      return label
  }
}

/**
 * Adapta los datos recibidos del backend para el gráfico,
 * agregando labels formateados y tooltipLabel.
 */
export function formatChartData<T extends { label: string }>(
  data: T[] = [],
  groupBy: GroupByType
) {
  return data.map((item) => ({
    ...item,
    tooltipLabel: formatTooltipLabelByGroup(item.label, groupBy),
    label: formatLabelByGroup(item.label, groupBy),
  }))
}