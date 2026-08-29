"use client";

import { useEffect } from "react";

export function NyraEffects() {
  useEffect(() => {
    const move = (event: MouseEvent) => {
      document.documentElement.style.setProperty(
        "--cursor-x",
        `${event.clientX}px`
      );
      document.documentElement.style.setProperty(
        "--cursor-y",
        `${event.clientY}px`
      );
    };

    const click = (event: MouseEvent) => {
      const ripple = document.createElement("div");
      ripple.className = "nyra-ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      document.body.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("click", click);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("click", click);
    };
  }, []);

  return <div className="nyra-cursor-glow" aria-hidden="true" />;
}
