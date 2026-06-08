"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  ArrowRightLeft,
  Bell,
  Bot,
  Briefcase,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  CloudLightning,
  Database,
  FileBadge,
  Fingerprint,
  GitBranch,
  History,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Network,
  Palette,
  Quote,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Badge } from "@nyra/ui";

const groups = [
  {
    id: "command",
    label: "Command",
    icon: LayoutDashboard,
    routes: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
      { href: "/leads", label: "Leads", icon: Users },
      { href: "/pipeline", label: "Pipeline", icon: Briefcase },
      { href: "/quotes", label: "Quotes", icon: Quote },
      { href: "/campaigns", label: "Campaigns", icon: GitBranch },
    ],
  },
  {
    id: "communications",
    label: "Communications",
    icon: MessageSquare,
    routes: [
      { href: "/communications", label: "Inbox", icon: Inbox, badge: "12" },
      {
        href: "/communications/reply",
        label: "Needs Reply",
        icon: MessageSquare,
      },
      {
        href: "/communications/positive",
        label: "Positive Intent",
        icon: Sparkles,
      },
      {
        href: "/communications/quotes",
        label: "Quote Requests",
        icon: CircleDollarSign,
      },
      {
        href: "/communications/docs",
        label: "Docs Needed",
        icon: ClipboardList,
      },
      {
        href: "/communications/stop",
        label: "STOP / DNC",
        icon: ShieldCheck,
        tone: "text-risk",
      },
      { href: "/communications/archived", label: "Archived", icon: Archive },
    ],
  },
  {
    id: "ai-ops",
    label: "AI / Ops",
    icon: Bot,
    routes: [
      { href: "/assistant", label: "Assistant", icon: Bot },
      { href: "/memory", label: "Memory", icon: Database },
      { href: "/agents", label: "Agents", icon: Network },
      { href: "/integrations", label: "Integrations", icon: Zap },
      { href: "/nexus", label: "Nexus", icon: Network },
      { href: "/workers", label: "Workers", icon: CloudLightning },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    routes: [
      { href: "/settings/compliance", label: "Compliance", icon: Scale },
      { href: "/settings/branding", label: "Branding", icon: Palette },
      {
        href: "/settings/identities",
        label: "Sender Identities",
        icon: Fingerprint,
      },
      { href: "/settings/secrets", label: "Secrets", icon: CloudLightning },
      { href: "/settings/users", label: "Users", icon: Users },
      { href: "/settings/audit", label: "Audit Log", icon: History },
    ],
  },
];

export function NestedSidebar() {
  const pathname = usePathname() || "/";
  const { state } = useSidebar();
  const [activeGroup, setActiveGroup] = React.useState(groups[0]);

  // Determine active group based on pathname
  React.useEffect(() => {
    const group = groups.find((g) =>
      g.routes.some(
        (r) => pathname === r.href || pathname.startsWith(r.href + "/")
      )
    );
    if (group) setActiveGroup(group);
  }, [pathname]);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/5 bg-background/50 backdrop-blur-xl"
    >
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl border border-primary/30 bg-primary/20 shadow-2xl">
            <Bot className="size-5 text-primary" />
          </div>
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase italic leading-none tracking-tight text-foreground">
                NYRA
              </span>
              <span className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground">
                Neural_Command
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-row overflow-hidden">
        {/* Rail (Main Groups) */}
        <div className="flex w-[70px] flex-col items-center gap-4 py-4 border-r border-white/5 bg-black/20">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group)}
              className={cn(
                "relative group flex size-12 items-center justify-center rounded-2xl transition-all duration-300",
                activeGroup.id === group.id
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.3)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
              title={group.label}
            >
              <group.icon className="size-5" />
              {activeGroup.id === group.id && (
                <div className="absolute -left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
              )}
            </button>
          ))}
        </div>

        {/* Active Group Content (Expanded Sidebar Part) */}
        {state === "expanded" && (
          <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                {activeGroup.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-2">
                  {activeGroup.routes.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                      <SidebarMenuItem key={route.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "h-10 rounded-xl px-3 transition-all duration-200",
                            isActive
                              ? "bg-white/10 text-white font-semibold border border-white/10 shadow-lg"
                              : "text-white/60 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <Link
                            href={route.href}
                            className="flex items-center w-full"
                          >
                            <route.icon
                              className={cn("mr-3 size-4.5", route.tone)}
                            />
                            <span className="text-sm truncate">
                              {route.label}
                            </span>
                            {route.badge && (
                              <Badge
                                variant="glass"
                                className="ml-auto text-[10px] h-4.5 px-1.5 opacity-80"
                              >
                                {route.badge}
                              </Badge>
                            )}
                            {isActive && (
                              <ChevronRight className="ml-auto size-3 opacity-40" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/5 bg-black/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5">
              <Settings className="size-4.5 mr-3" />
              {state === "expanded" && (
                <span className="text-sm">Settings</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
