"use client";
import { useEffect, useRef } from "react";
// Dastak mark: a locked door knocks twice, then swings open with warm light.
// Plays once on load and again on hover or tap.
export default function DoorLogo({ size = 0.2 }: { size?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const play = () => { const el = ref.current; if (!el) return; el.classList.remove("go"); void el.offsetWidth; el.classList.add("go"); };
  useEffect(() => { play(); }, []);
  return (<span ref={ref} className="dlogo" style={{ ["--s" as string]: size }} aria-hidden="true" onPointerEnter={play}>
    <span className="rg rg1" /><span className="rg rg2" /><span className="rm"><span className="lt" /><span className="dr" /></span><span className="fr" />
  </span>);
}
