"use client";
import { useEffect, useState } from "react";

export function DoorMark({ size = 0.6, knocking = true }: { size?: number; knocking?: boolean }) {
  return (<span className={`dmark ${knocking ? "knocking" : ""}`} style={{ ["--s" as string]: size }} aria-hidden="true"><u /><u /><b /><i /></span>);
}

const DEFAULT = ["Setting up your restaurant", "Opening the doors", "Fetching today's guests", "Laying the tables"];
export default function Loading({ messages = DEFAULT, sub, full = false }: { messages?: string[]; sub?: string; full?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((n) => (n + 1) % messages.length), 1800); return () => clearInterval(t); }, [messages.length]);
  return (<div className={`loadscreen ${full ? "full" : ""}`} role="status" aria-live="polite">
    <div><DoorMark /><p key={i} className="fadeword">{messages[i]}…</p>{sub && <small>{sub}</small>}</div>
  </div>);
}
