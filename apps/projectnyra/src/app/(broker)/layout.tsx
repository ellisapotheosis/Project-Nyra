import { AppShell } from "@/components/shell/AppShell";

export default function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
