import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, FileText, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/exportacoes")({
  head: () => ({ meta: [{ title: "Exportações — MV Broker" }] }),
  component: Exportacoes,
});

const items = [
  { nome: "registros-junho-2026.xlsx", tipo: "XLSX", quando: "Hoje, 14:32", status: "Concluído" },
  { nome: "clientes-completos.csv", tipo: "CSV", quando: "Ontem, 18:11", status: "Concluído" },
  { nome: "relatorio-financeiro.pdf", tipo: "PDF", quando: "08/06/2026", status: "Processando" },
  { nome: "usuarios-ativos.xlsx", tipo: "XLSX", quando: "07/06/2026", status: "Concluído" },
];

function Exportacoes() {
  return (
    <>
      <PageHeader title="Exportações" description="Histórico de arquivos exportados da plataforma."
        actions={<Button><Download className="h-4 w-4" /> Nova exportação</Button>} />
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Arquivo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Quando</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(it => (
              <TableRow key={it.nome}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-muted">
                      {it.tipo === "PDF"
                        ? <FileText className="h-4 w-4 text-destructive" />
                        : <FileSpreadsheet className="h-4 w-4 text-primary" />}
                    </div>
                    <span className="font-medium">{it.nome}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary">{it.tipo}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{it.quando}</TableCell>
                <TableCell>
                  {it.status === "Concluído"
                    ? <span className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.45_0.16_152)]"><CheckCircle2 className="h-4 w-4" /> {it.status}</span>
                    : <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> {it.status}</span>}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" disabled={it.status !== "Concluído"}>
                    <Download className="h-4 w-4" /> Baixar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
