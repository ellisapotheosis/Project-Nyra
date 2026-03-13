"use client";

import { DifyWidget } from "@/components/dify/dify-widget";
import { Card, CardContent } from "@/components/ui/card";

export default function ChatPage() {
  const widgetUrl = process.env.NEXT_PUBLIC_DIFY_WIDGET_URL || "";
  const appId = process.env.NEXT_PUBLIC_DIFY_APP_ID || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">
          Chat with Nyra's AI assistant powered by Dify
        </p>
      </div>

      {!widgetUrl || !appId ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="font-medium text-gray-700">Dify Configuration Required</p>
              <p className="text-sm text-gray-600">
                To enable the chat widget, configure the following environment variables in{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  bootstrap/apps/nyra-admin/.env.local
                </code>
              </p>
              <pre className="mt-4 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-white">
                {`# Dify Chat Configuration
NEXT_PUBLIC_DIFY_WIDGET_URL=http://localhost:8080/chatbot.js
NEXT_PUBLIC_DIFY_APP_ID=your-dify-app-id-here

# Backend Services
NEXT_PUBLIC_NEXUS_URL=http://localhost:7000

# Optional: Twenty CRM
NEXT_PUBLIC_TWENTY_URL=http://localhost:3000`}
              </pre>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Make sure your Dify instance is running and the app is
                  published. Check the Dify documentation for setup instructions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <DifyWidget widgetUrl={widgetUrl} appId={appId} theme="light" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-medium mb-2">Campaign Help</h3>
            <p className="text-sm text-gray-600">
              Ask the AI assistant about campaign strategies, best practices, and optimization tips.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-medium mb-2">Lead Qualification</h3>
            <p className="text-sm text-gray-600">
              Get help with lead scoring, qualification criteria, and follow-up strategies.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-medium mb-2">Analytics Insights</h3>
            <p className="text-sm text-gray-600">
              Ask questions about your campaign analytics, conversion rates, and ROI calculations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
