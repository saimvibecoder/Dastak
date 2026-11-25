"use client";
import { useEffect, useState } from "react";
import { PALETTES, isPalette, type PaletteId } from "@/lib/palettes";

// Phone-only colour picker in the footer, so the floating button never covers page text.
export default function FooterColours() {
  const [pal, setPal] = useState<PaletteId | null>(null);
  useEffect(() => { const v = document.documentElement.dataset.pal; if (isPalette(v)) setPal(v); }, []);
  const pick = (id: PaletteId) => {
    setPal(id);
    document.documentElement.dataset.pal = id;
    document.cookie = `pal=${id};path=/;max-age=31536000;samesite=lax`;
  };
  return (
    <div className="fcol" role="group" aria-label="Colour theme">
      <span className="c5">Colours</span>
      {PALETTES.map((p) => (
        <button key={p.id} type="button" aria-pressed={p.id === pal} aria-label={p.label} title={p.label} style={{ background: p.bg }} onClick={() => pick(p.id)}>
          <i style={{ background: p.accent }} />
        </button>
      ))}
    </div>
  );
}
