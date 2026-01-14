"use client";

import Script from "next/script";

export default function ChatPage() {
  const widgetUrl = process.env.NEXT_PUBLIC_DIFY_WIDGET_URL || "";
  const appId = process.env.NEXT_PUBLIC_DIFY_APP_ID || "";

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-semibold tracking-tight">Nyra Chat (Dify)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Configure <code>NEXT_PUBLIC_DIFY_WIDGET_URL</code> and <code>NEXT_PUBLIC_DIFY_APP_ID</code> in{" "}
        <code>apps/nyra-admin/.env.local</code>.
      </p>

      {!widgetUrl ? (
        <div className="mt-6 rounded-xl border p-6">
          <p className="text-sm">
            Missing <code>NEXT_PUBLIC_DIFY_WIDGET_URL</code>. Example:
          </p>
          <pre className="mt-3 overflow-auto rounded-lg bg-black p-4 text-xs text-white">
{`NEXT_PUBLIC_DIFY_WIDGET_URL=http://localhost:8080/chatbot.js
NEXT_PUBLIC_DIFY_APP_ID=YOUR_APP_ID
PORT=3002`}
          </pre>
        </div>
      ) : (
        <>
          <Script src={widgetUrl} strategy="afterInteractive" />
          <div className="mt-6 rounded-xl border p-6">
            <div
              id="dify-chatbot"
              data-app-id={appId}
              data-theme="light"
              style={{ width: "100%", height: "70vh" }}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              If the widget does not load: check browser console, CORS, and that the Dify app is published.
            </p>
          </div>
        </>
      )}
    </main>
  );
}
