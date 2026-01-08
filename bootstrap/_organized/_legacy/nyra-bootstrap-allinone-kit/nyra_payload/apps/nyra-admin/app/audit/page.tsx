import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Audit Log</h1>
      <Card>
        <CardHeader>Audit Log</CardHeader>
        <CardContent>Read audit events from Nyra Orchestrator + Loki.</CardContent>
      </Card>
    </div>
  );
}
