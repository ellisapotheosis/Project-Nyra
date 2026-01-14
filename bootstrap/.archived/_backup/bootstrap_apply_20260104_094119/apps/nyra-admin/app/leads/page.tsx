import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Leads</h1>
      <Card>
        <CardHeader>Leads</CardHeader>
        <CardContent>This page should read/write leads via Nyra Orchestrator -> Twenty.</CardContent>
      </Card>
    </div>
  );
}
