import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Chat</h1>
      <Card>
        <CardHeader>Chat</CardHeader>
        <CardContent>Embed Dify app (iframe) or call Dify API; keep Open WebUI optional for internal.</CardContent>
      </Card>
    </div>
  );
}
