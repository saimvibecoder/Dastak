"use client";
import { useEffect, useState } from "react";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
// Shows an install button where the browser supports it (Android, desktop Chrome/Edge),
// and a short Add to Home Screen tip on iPhone. Hidden once installed.
export default function InstallApp({ label = "Install Dastak app" }: { label?: string }) {
  const [evt, setEvt] = useState<BIP | null>(null);
  const [ios, setIos] = useState(false);
  const [tip, setTip] = useState(false);
  const [installed, setInstalled] = useState(true);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
    setInstalled(!!standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const h = (e: Event) => { e.preventDefault(); setEvt(e as BIP); };
    window.addEventListener("beforeinstallprompt", h);
    const done = () => setInstalled(true);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", h); window.removeEventListener("appinstalled", done); };
  }, []);
  if (installed || (!evt && !ios)) return null;
  if (evt) return <button className="btn ghost sm" onClick={async () => { await evt.prompt(); await evt.userChoice; setEvt(null); }}>{label}</button>;
  return (<span style={{ position: "relative" }}>
    <button className="btn ghost sm" onClick={() => setTip(!tip)} aria-expanded={tip}>{label}</button>
    {tip && <span className="notice" role="note" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 240, zIndex: 20, background: "var(--bg)" }}>
      Tap the Share button in Safari, then <b>Add to Home Screen</b>.</span>}
  </span>);
}
