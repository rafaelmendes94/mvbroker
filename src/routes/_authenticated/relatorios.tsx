import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { BarChart3, Building2, Download, Activity, Share2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — MV Broker" }] }),
  component: RelatoriosLayout,
});

const TABS = [
  { to: "/relatorios", label: "Visão Geral", icon: BarChart3, exact: true },
  { to: "/relatorios/imoveis", label: "Imóveis", icon: Building2 },
  { to: "/relatorios/exportacoes", label: "Exportações & Portais", icon: Share2 },
  { to: "/relatorios/atividade", label: "Atividade & Auditoria", icon: Activity },
];

function RelatoriosLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <PageHeader title="Relatórios & BI" description="Inteligência operacional consolidada." />
      <div className="border-b mb-6 -mt-2 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
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
