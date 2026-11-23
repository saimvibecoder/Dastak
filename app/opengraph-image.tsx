import { ImageResponse } from "next/og";

// The preview picture WhatsApp, Instagram and LinkedIn show when someone shares https://dastak.food
export const alt = "Dastak: turn every diner into a regular on WhatsApp";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ece4d9", padding: "72px 80px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 96, height: 96, borderRadius: 26, background: "#9c4f2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 60, fontWeight: 700 }}>D</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: "#2b211c" }}>Dastak</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, color: "#2b211c", letterSpacing: -2 }}>Turn every diner into a regular on WhatsApp.</div>
          <div style={{ fontSize: 32, color: "#6b5a4e" }}>Table QR, welcome offer, guest list. Fill your slow hours.</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#9c4f2e", fontWeight: 600 }}>dastak.food · Taking 5 founding restaurants in Lucknow</div>
      </div>
    ),
    size,
  );
}
