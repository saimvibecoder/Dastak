import { DAYS } from "./util";

export const PARTS = [
  { id: "lunch", label: "Lunch", range: "12–3 PM" },
  { id: "afternoon", label: "Afternoon", range: "3–6 PM" },
  { id: "evening", label: "Evening", range: "6–9 PM" },
  { id: "late", label: "Late night", range: "9 PM–midnight" },
] as const;
export type PartId = (typeof PARTS)[number]["id"];
export type Slot = { d: number; p: PartId };

export function parseSlots(v: unknown): Slot[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is Slot => !!x && Number.isInteger(x.d) && x.d >= 0 && x.d <= 6 && PARTS.some((p) => p.id === x.p)).slice(0, 28);
}
export const partOf = (id: PartId) => PARTS.find((p) => p.id === id)!;
export const slotLabel = (s: Slot) => `${DAYS[s.d]} ${partOf(s.p).label.toLowerCase()}`;
export const slotText = (s: Slot) => `${DAYS[s.d]} ${partOf(s.p).label.toLowerCase()} (${partOf(s.p).range})`;
/** Monday = 0, in India time. */
export const todayIST = () => (new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getDay() + 6) % 7;
