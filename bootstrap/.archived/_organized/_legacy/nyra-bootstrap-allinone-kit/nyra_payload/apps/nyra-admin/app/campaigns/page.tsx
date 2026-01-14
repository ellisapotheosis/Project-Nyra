import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Campaigns</h1>
      <Card>
        <CardHeader>Campaigns</CardHeader>
        <CardContent>Load campaign DSL from /data/campaigns and render previews.</CardContent>
      </Card>
    </div>
  );
}
