export const API_URL =
  process.env.NEXT_PUBLIC_DEV === "true"
    ? process.env.NEXT_PUBLIC_API_URL_LOCAL
    : process.env.NEXT_PUBLIC_API_URL_HTTPS;
