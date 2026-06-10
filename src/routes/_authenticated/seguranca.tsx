import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { FileText, ShieldAlert, Activity, MonitorSmartphone, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/seguranca")({
  beforeLoad: async ({ location }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth" });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = (data ?? []).some((r: { role: string }) => r.role === "super_admin");
    if (!isAdmin) throw redirect({ to: "/acesso-negado", search: { from: location.pathname } });
  },
  head: () => ({ meta: [{ title: "Segurança — MV Broker" }] }),
  component: SegurancaLayout,
});

const TABS = [
  { to: "/seguranca", label: "Logs do Sistema", icon: FileText, exact: true },
  { to: "/seguranca/acessos", label: "Acessos", icon: Activity },
  { to: "/seguranca/sessoes", label: "Sessões", icon: MonitorSmartphone },
  { to: "/seguranca/alertas", label: "Alertas", icon: ShieldAlert },
  { to: "/seguranca/permissoes", label: "Permissões", icon: KeyRound },
];

function SegurancaLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <PageHeader title="Segurança & Auditoria" description="Logs, sessões e alertas — visão Super Admin." />
      <div className="border-b mb-6 -mt-2 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link key={t.to} to={t.to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}>
                <Icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <Outlet />
    </>
  );
}
