export type HistoryRole = "passenger" | "driver";

export const HISTORY_TABS: {
  label: string;
  value: HistoryRole;
}[] = [
  { label: "Pasajero", value: "passenger" },
  { label: "Conductor", value: "driver" },
];