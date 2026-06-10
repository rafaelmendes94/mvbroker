import { createFileRoute } from "@tanstack/react-router";
import {
  FolderKanban, Users, UserSquare2, Download, TrendingUp, TrendingDown, ArrowRight,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MV Broker" }] }),
  component: Dashboard,
});

const kpis = [
  { label: "Total de registros", value: "12.482", delta: "+12,4%", up: true, icon: FolderKanban },
  { label: "Total de usuários", value: "284", delta: "+3,1%", up: true, icon: Users },
  { label: "Total de clientes", value: "1.926", delta: "+8,7%", up: true, icon: UserSquare2 },
  { label: "Total de exportações", value: "342", delta: "-2,3%", up: false, icon: Download },
];

const barData = [
  { mes: "Jan", registros: 420 }, { mes: "Fev", registros: 510 },
  { mes: "Mar", registros: 690 }, { mes: "Abr", registros: 740 },
  { mes: "Mai", registros: 820 }, { mes: "Jun", registros: 910 },
  { mes: "Jul", registros: 1020 },
];

const lineData = [
  { dia: "Sem 1", clientes: 120, leads: 80 },
  { dia: "Sem 2", clientes: 180, leads: 140 },
  { dia: "Sem 3", clientes: 240, leads: 200 },
  { dia: "Sem 4", clientes: 310, leads: 260 },
  { dia: "Sem 5", clientes: 390, leads: 320 },
  { dia: "Sem 6", clientes: 480, leads: 410 },
];

const pieData = [
  { name: "Residencial", value: 540 },
  { name: "Comercial", value: 320 },
  { name: "Terreno", value: 180 },
  { name: "Rural", value: 90 },
];
const pieColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral dos indicadores e desempenho da plataforma."
        actions={<Button variant="outline" size="sm">Últimos 30 dias</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{k.label}</p>
                    <p className="text-3xl font-bold tracking-tight mt-2">{k.value}</p>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  {k.up ? (
                    <TrendingUp className="h-3.5 w-3.5 text-[oklch(0.68_0.16_152)]" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <span className={k.up ? "text-xs font-medium text-[oklch(0.68_0.16_152)]" : "text-xs font-medium text-destructive"}>
                    {k.delta}
                  </span>
                  <span className="text-xs text-muted-foreground">vs. mês anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Registros por mês</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Volume de novos cadastros no período</p>
            </div>
            <Badge variant="secondary">2025</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <RTooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="registros" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por tipo</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Imóveis cadastrados</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                  </Pie>
                  <RTooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {pieData.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: pieColors[i] }} />
                    <span className="text-muted-foreground">{p.name}</span>
                  </div>
                  <span className="font-medium">{p.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Clientes vs. Leads</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Evolução semanal</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="dia" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <RTooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="clientes" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="leads" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { who: "Maria Silva", what: "criou um novo registro", when: "há 5 min" },
              { who: "João Pereira", what: "exportou relatório", when: "há 22 min" },
              { who: "Ana Costa", what: "atualizou cliente", when: "há 1 h" },
              { who: "Carlos R.", what: "criou novo usuário", when: "há 3 h" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                  {a.who.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="leading-snug"><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.when}</p>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full justify-between">
              Ver tudo <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
