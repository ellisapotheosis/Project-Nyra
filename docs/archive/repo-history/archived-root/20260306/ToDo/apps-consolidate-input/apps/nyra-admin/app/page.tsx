import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader>Leads</CardHeader><CardContent>Connect to Twenty via Orchestrator.</CardContent></Card>
        <Card><CardHeader>Campaigns</CardHeader><CardContent>Edit DSL + preview + deploy to n8n.</CardContent></Card>
        <Card><CardHeader>Compliance</CardHeader><CardContent>Logistics-only + consent ledger.</CardContent></Card>
      </div>
    </div>
  );
}
