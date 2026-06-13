"use client";

import { useEffect, useRef } from "react";

export default function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "f" || e.key === "F") {
        if (
          document.activeElement &&
          ["INPUT", "TEXTAREA", "SELECT"].includes(
            (document.activeElement as HTMLElement).tagName
          )
        )
          return;
        rootRef.current?.classList.toggle("focus-mode");
      }
      if (e.key === "Escape") {
        rootRef.current?.classList.remove("focus-mode");
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
