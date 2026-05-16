import {
  Bot,
  Brain,
  Building2,
  Calculator,
  Cpu,
  Kanban,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ServerCog,
  Workflow,
  Users,
  FileText,
  Network,
  Minimize2,
  Box,
  UserCircle,
  Activity,
  Zap
} from "lucide-react"

export const navGroups = [
  {
    label: "Main",
    id: "main",
    items: [
      { href: "/", label: "Mission Overview", icon: LayoutDashboard },
    ],
  },
  {
    label: "Broker Platform",
    id: "broker",
    items: [
      { href: "/leads", label: "Lead Registry", icon: Users },
      { href: "/pipeline", label: "Pipeline Board", icon: Kanban },
      { href: "/applications", label: "Applications", icon: Activity },
    ],
  },
  {
    label: "Operations",
    id: "ops",
    items: [
      { href: "/assistant", label: "Assistant", icon: UserCircle },
      { href: "/quotes", label: "Quotes Desk", icon: Calculator },
      { href: "/campaigns", label: "Campaigns", icon: Zap },
      { href: "/drip-builder", label: "Drip Builder", icon: Workflow },
    ],
  },
  {
    label: "Cluster & Logic",
    id: "system",
    items: [
      { href: "/fleet", label: "Fleet Control", icon: Cpu },
      { href: "/memory", label: "Mempalace", icon: Brain },
      { href: "/nexus-router", label: "Nexus Router", icon: Network },
      { href: "/orchestrator", label: "Orchestrator", icon: Minimize2 },
    ],
  },
  {
    label: "Administration",
    id: "admin",
    items: [
      { href: "/logs", label: "Audit Trail", icon: FileText },
      { href: "/admin/integrations", label: "Integrations", icon: Box },
      { href: "/admin/crm", label: "CRM Ledger", icon: Building2 },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const

export type NavGroup = (typeof navGroups)[number]
