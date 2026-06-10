import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, FileText, PieChart, TrendingUp, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — MV Broker" }] }),
  component: Relatorios,
});

const reports = [
  { titulo: "Relatório de Cadastros", desc: "Volume e evolução dos registros.", icon: FileText },
  { titulo: "Performance Comercial", desc: "Vendas e conversões por período.", icon: TrendingUp },
  { titulo: "Distribuição por Tipo", desc: "Composição da carteira de imóveis.", icon: PieChart },
  { titulo: "Análise Mensal", desc: "Indicadores consolidados do mês.", icon: BarChart3 },
];

function Relatorios() {
  return (
    <>
      <PageHeader title="Relatórios" description="Gere relatórios completos sobre a operação." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reports.map(r => {
          const Icon = r.icon;
          return (
            <Card key={r.titulo} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{r.titulo}</h3>
                <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  <Download className="h-4 w-4" /> Gerar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
