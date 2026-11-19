"use client";
import { useState } from "react";
import { PALETTES, type PaletteId } from "@/lib/palettes";

// Each person picks their own look. Saved in a cookie for a year, so it follows them on this device.
export default function PaletteSwitcher({ current }: { current: PaletteId }) {
  const [pal, setPal] = useState(current);
  const [open, setOpen] = useState(false);
  const pick = (id: PaletteId) => {
    setPal(id);
    document.documentElement.dataset.pal = id;
    document.cookie = `pal=${id};path=/;max-age=31536000;samesite=lax`;
  };
  const cur = PALETTES.find((p) => p.id === pal)!;
  return (
    <div className="pal" role="group" aria-label="Colour theme">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} aria-label={`Colour theme: ${cur.label}. Change`} title="Change colours" style={{ background: cur.bg }}>
          <i style={{ background: cur.accent }} />
        </button>
      ) : (
        <>
          <span>Colours</span>
          {PALETTES.map((p) => (
            <button key={p.id} type="button" aria-pressed={p.id === pal} aria-label={p.label} title={p.label} style={{ background: p.bg }} onClick={() => pick(p.id)}>
              <i style={{ background: p.accent }} />
            </button>
          ))}
          <button type="button" onClick={() => setOpen(false)} aria-label="Close colour picker" style={{ background: "var(--bg)", color: "var(--mfg)", fontSize: 18 }}>×</button>
        </>
      )}
    </div>
  );
}
