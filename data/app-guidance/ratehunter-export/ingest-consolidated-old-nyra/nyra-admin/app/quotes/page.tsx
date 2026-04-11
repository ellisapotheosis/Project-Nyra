import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Quotes</h1>
      <Card>
        <CardHeader>Quotes</CardHeader>
        <CardContent>Call Quote Engine /v1/quotes/soft and render multi-option quotes.</CardContent>
      </Card>
    </div>
  );
}
