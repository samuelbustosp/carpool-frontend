export function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    fromDate: start.toISOString().split("T")[0],
    toDate: end.toISOString().split("T")[0],
  };
}

export function getPreviousMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const end = new Date(date.getFullYear(), date.getMonth(), 0);

  return {
    fromDate: start.toISOString().split("T")[0],
    toDate: end.toISOString().split("T")[0],
  };
}

export function getStatusDelta(
  delta: number,
  previousValue: number
) {
  if (delta === 0) return "default"

  if (previousValue === 0 && delta > 0) {
    return "new"
  }

  if (delta > 0) return "increase"

  if (delta < 0) return "decrease"

  return "default"
}

export function formatPercentageDelta(
  delta: number,
  previousValue: number
): number | string {
  if (delta === 0) return 0

  if (previousValue === 0) {
    return delta > 0 ? `${delta}` : `${delta}`
  }

  const value = (delta * 100) / previousValue

  const formatted = Number.isInteger(value)
    ? value
    : Number(value.toFixed(2))

  return formatted
}

export function formatFixedDouble ( value : number) {
  return Number.isInteger(value)
    ? value
    : Number(value.toFixed(2))
}