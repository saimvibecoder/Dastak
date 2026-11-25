"use client";
import { useRef } from "react";

// "See how it works" opens the 25-second promo reel. Without JavaScript it still scrolls to the steps.
export default function ReelButton() {
  const dlg = useRef<HTMLDialogElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const open = (e: React.MouseEvent) => {
    if (!dlg.current?.showModal) return;
    e.preventDefault();
    dlg.current.showModal();
    vid.current?.play().catch(() => {});
  };
  const close = () => { vid.current?.pause(); dlg.current?.close(); };
  return (
    <>
      <a className="btn ghost" href="#how" onClick={open} aria-haspopup="dialog">
        <span className="play"><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="currentColor" /></svg></span>See how it works
      </a>
      <dialog ref={dlg} className="reel" aria-label="How Dastak works, 25-second video"
        onClose={() => vid.current?.pause()} onClick={(e) => { if (e.target === dlg.current) close(); }}>
        <video ref={vid} src="/dastak-reel.mp4" poster="/dastak-reel-poster.jpg" controls playsInline preload="none" />
        <button type="button" className="reel-x" onClick={close} aria-label="Close video">×</button>
      </dialog>
    </>
  );
}
