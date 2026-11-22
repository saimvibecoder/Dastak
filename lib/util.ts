export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const wa = (num: string | null | undefined, text: string) =>
  `https://wa.me/${num || ""}?text=${encodeURIComponent(text)}`;
export const phoneFmt = (p: string | null) => (p ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : "Removed");
export const fmtDate = (t: string | Date) =>
  new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
export const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const firstName = (n: string) => n.split(/\s+/)[0];
