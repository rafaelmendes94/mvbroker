import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/seguranca/alertas")({
  component: Alertas,
});

type Alerta = {
  id: string;
  tipo: string;
  severidade: string;
  usuario_id: string | null;
  descricao: string;
  metadata: Record<string, unknown> | null;
  status: string;
  created_at: string;
};

const SEV_VARIANT: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  baixa: "secondary", media: "outline", alta: "default", critica: "destructive",
};

function Alertas() {
  const [rows, setRows] = useState<Alerta[]>([]);

  async function load() {
    const { data } = await supabase.from("security_alerts")
      .select("*").order("created_at", { ascending: false }).limit(500);
    setRows((data ?? []) as Alerta[]);
  }
  useEffect(() => { load(); }, []);

  async function resolver(id: string) {
    const { error } = await supabase.from("security_alerts").update({ status: "resolvido" }).eq("id", id);
    if (error) toast.error("Erro"); else { toast.success("Alerta resolvido"); load(); }
  }

  const abertos = rows.filter((r) => r.status === "aberto").length;
  const criticos = rows.filter((r) => r.severidade === "critica" && r.status === "aberto").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Alertas abertos" value={abertos} />
        <Kpi label="Críticos abertos" value={criticos} />
        <Kpi label="Total registrados" value={rows.length} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quando</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">—</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(r.created_at), "dd/MM HH:mm")}</TableCell>
                  <TableCell><Badge variant="outline">{r.tipo}</Badge></TableCell>
                  <TableCell><Badge variant={SEV_VARIANT[r.severidade] ?? "outline"}>{r.severidade}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{r.usuario_id?.slice(0, 8) ?? "—"}</TableCell>
                  <TableCell className="text-sm truncate max-w-[320px]">{r.descricao}</TableCell>
                  <TableCell><Badge variant={r.status === "aberto" ? "destructive" : "secondary"}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {r.status === "aberto" && (
                      <Button variant="ghost" size="sm" onClick={() => resolver(r.id)}>
                        <CheckCircle2 className="h-4 w-4" /> Resolver
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Nenhum alerta.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}
