"use client";

import { useEffect } from "react";
import Script from "next/script";

interface DifyWidgetProps {
  widgetUrl: string;
  appId: string;
  theme?: "light" | "dark";
  className?: string;
}

export function DifyWidget({ widgetUrl, appId, theme = "light", className }: DifyWidgetProps) {
  useEffect(() => {
    // Initialize widget after script loads
    if (typeof window !== "undefined" && (window as any).DifyChat) {
      (window as any).DifyChat.init({
        appId,
        theme,
      });
    }
  }, [appId, theme]);

  return (
    <>
      <Script src={widgetUrl} strategy="afterInteractive" />
      <div
        id="dify-chatbot"
        data-app-id={appId}
        data-theme={theme}
        className={className}
        style={{ width: "100%", height: "100%", minHeight: "500px" }}
      />
    </>
  );
}
