"use client";
import { useEffect } from "react";
// Scroll reveals and the word-by-word tagline, using IntersectionObserver only.
export default function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    const tio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("on"); tio.unobserve(e.target); } }), { rootMargin: "0px 0px -40% 0px" });
    document.querySelectorAll(".tag span").forEach((el) => tio.observe(el));
    return () => { io.disconnect(); tio.disconnect(); };
  }, []);
  return null;
}
