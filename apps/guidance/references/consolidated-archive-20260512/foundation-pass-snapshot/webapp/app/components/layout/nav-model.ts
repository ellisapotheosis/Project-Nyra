import {
  Bot,
  BriefcaseBusiness,
  Building2,
  Calculator,
  KanbanSquare,
  Megaphone,
  Settings,
  ShieldCheck,
  ServerCog,
  Workflow,
  Users,
} from "lucide-react"

export const navGroups = [
  {
    label: "Work",
    items: [
      { href: "/leads", label: "Leads", icon: Users },
      { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
      { href: "/applications", label: "Applications", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Revenue",
    items: [
      { href: "/quotes", label: "Quotes", icon: Calculator },
      { href: "/campaigns", label: "Campaigns", icon: Workflow },
    ],
  },
  {
    label: "Assistant",
    items: [{ href: "/assistant", label: "Assistant", icon: Bot }],
  },
  {
    label: "Platform",
    items: [
      { href: "/crm", label: "CRM", icon: Building2 },
      { href: "/admin/integrations", label: "Integrations", icon: ServerCog },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/tools/openclaw", label: "OpenClaw", icon: ShieldCheck },
      { href: "/tools/nexus", label: "Nexus", icon: Megaphone },
      { href: "/tools/activepieces", label: "Activepieces", icon: Workflow },
    ],
  },
] as const

export type NavGroup = (typeof navGroups)[number]
