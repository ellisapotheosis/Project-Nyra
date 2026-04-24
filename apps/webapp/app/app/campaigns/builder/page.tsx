import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { campaigns } from "@/lib/mock-data"

export default function CampaignBuilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Campaign Builder</h1>
        <p className="mt-2 text-muted-foreground">
          Builder placeholder route so campaign management stays navigable inside the unified internal app.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <CardTitle>{campaign.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{campaign.loanPurpose}</p>
              <p className="mt-3 text-sm">{campaign.steps.length} steps</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
