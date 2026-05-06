export function buildQuery(params: Record<string, string | number | null>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.append(key, String(value));
    }
  });

  return `?${search.toString()}`;
}