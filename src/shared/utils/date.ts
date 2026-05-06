/**
 * Formatea una fecha a formato corto textual en español.
 *
 * @example
 * formatShortDateText(new Date(2025, 2, 18))
 * // → "18 de mar."
 */
export function formatShortDateText(date: Date) {
  const parts = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  }).formatToParts(date)

  const day = parts.find((p) => p.type === 'day')?.value
  const month = parts.find((p) => p.type === 'month')?.value.replace('.', '')

  return `${day} de ${month}.`
}

/**
 * Formatea una fecha a formato corto textual con año en español.
 *
 * @example
 * formatShortDateTextWithYear(new Date(2025, 2, 18))
 * // → "18 de mar. de 2025"
 */
export function formatShortDateTextWithYear(date: Date) {
  const parts = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).formatToParts(date)

  const day = parts.find((p) => p.type === 'day')?.value
  const month = parts.find((p) => p.type === 'month')?.value.replace('.', '')
  const year = parts.find((p) => p.type === 'year')?.value

  return `${day} de ${month}. ${year}`
}



/**
 * Formatea una fecha a formato corto día-mes en español.
 *
 * @example
 * formatShortDate(new Date(2025, 1, 3))
 * // → "03-feb"
 *
 * @param date Fecha como objeto Date
 * @returns String con formato "dd-mmm" (ej: "03-feb")
 */
export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })
    .format(date)
    .replace('.', '')
    .replace(' ', '-');
}

/**
 * Formatea una fecha a formato corto día-mes-año en español.
 *
 * @example
 * formatShortDateWithYear(new Date(2025, 1, 3))
 * // → "03-feb-2025"
 *
 * @param date Fecha como objeto Date
 * @returns String con formato "dd-mmm-yyyy"
 */
export function formatShortDateWithYear(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(date)
    .replace(/\./g, '')
    .replace(/ /g, '-')
}

/**
 * Formatea un string de fecha a formato largo en español.
 *
 * @example
 * formatDateLong("2025-02-03")
 * // → "03 de febrero de 2025"
 *
 * @param dateString Fecha en formato ISO o compatible (yyyy-mm-dd)
 * @returns String con formato "dd de mes de yyyy"
 */
export function formatDateLong(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Formatea una fecha a formato completo sin año.
 * Capitaliza el primer y último término (día de la semana y mes).
 *
 * @example
 * formatFullDate(new Date(2025, 1, 3))
 * // → "Lunes 03 febrero"
 *
 * @param date Fecha como objeto Date
 * @returns String con formato "Día dd mes"
 */
export function formatFullDate(date: Date) {
  const formatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
    .format(date)
    .replace(",", "");

  return formatted
    .split(" ")
    .map((word, index) => {
      if (index === 0 || index === formatted.split(" ").length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
}

/**
 * Formatea una fecha a formato completo con año.
 * Capitaliza el día de la semana y el año.
 *
 * @example
 * formatFullDateWithYear(new Date(2025, 1, 3))
 * // → "Lunes 03 febrero 2025"
 *
 * @param date Fecha como objeto Date
 * @returns String con formato "Día dd mes yyyy"
 */
export function formatFullDateWithYear(date: Date) {
  const formatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
    .format(date)
    .replace(",", "");

  return formatted
    .split(" ")
    .map((word, index) => {
      if (index === 0 || index === formatted.split(" ").length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
}

/**
 * Convierte una fecha ISO (yyyy-mm-dd) en un Date ajustado
 * a la zona horaria local, evitando desfases por UTC.
 *
 * @example
 * parseLocalDate("2025-02-03")
 * // → Date correspondiente al 3 de febrero en hora local
 *
 * @param isoDate Fecha en formato ISO (yyyy-mm-dd)
 * @returns Objeto Date ajustado a la zona horaria local
 */
export function parseLocalDate(isoDate: string): Date {
  const d = new Date(isoDate);
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  return d;
}

/**
 * Convierte un Date a string ISO (yyyy-mm-dd) sin desfase horario.
 * Fuerza la hora a 00:00 para evitar problemas de UTC.
 *
 * @example
 * formatISODate(new Date(2025, 1, 3))
 * // → "2025-02-03"
 *
 * @param date Fecha como objeto Date
 * @returns String ISO sin hora (yyyy-mm-dd)
 */
export function formatISODate(date: Date): string {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

/**
 * Convierte una fecha ISO (yyyy-mm-dd) a formato corto local.
 *
 * @example
 * formatISOToShortDate("2025-02-03")
 * // → "03/02/2025"
 *
 * @param isoDate Fecha en formato ISO (yyyy-mm-dd)
 * @returns String con formato "dd/mm/yyyy"
 */
export function formatISOToShortDate(isoDate: string): string {
  const date = parseLocalDate(isoDate);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}


/**
 * Determina si una fecha tiene al menos una cantidad mínima de horas restantes
 * respecto al momento actual.
 *
 * @param date - Fecha objetivo. Puede ser un objeto Date o un string
 *               que pueda ser interpretado por el constructor de Date.
 * @param hours - Cantidad mínima de horas que deben faltar.
 * @returns `true` si la diferencia entre ahora y la fecha objetivo
 *          es mayor o igual a la cantidad de horas indicada.
 *          En caso contrario, devuelve `false`.
 *
 * @example
 * // Si el viaje empieza en 15 horas
 * hasMinimumHoursRemaining("2026-03-03T18:00:00Z", 12)
 * // → true
 *
 * @example
 * // Si el viaje empieza en 11 horas y 59 minutos
 * hasMinimumHoursRemaining("2026-03-03T14:00:00Z", 12)
 * // → false
 *
 * @observaciones
 * - Si la fecha está en el pasado, la función devuelve `false`.
 * - El parseo de strings depende de la zona horaria del entorno.
 */
export const hasMinimumHoursRemaining = (
  date: string | Date,
  hours: number
): boolean => {
  const now = Date.now()
  const target = new Date(date).getTime()

  const diffMs = target - now
  const requiredMs = hours * 60 * 60 * 1000

  return diffMs >= requiredMs
}

export function formatLocalDate(date: Date | string): string {
  const d = new Date(date)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${day}-${month}-${year}`;
}