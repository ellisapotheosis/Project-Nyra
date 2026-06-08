import { AppShell } from "@/components/shell/AppShell";

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
