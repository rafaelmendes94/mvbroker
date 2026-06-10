import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/seguranca/sessoes")({
  component: Sessoes,
});

type Sess = {
  id: string;
  usuario_id: string;
  ip: string | null;
  user_agent: string | null;
  device: string | null;
  last_seen: string;
  status: string;
};

function Sessoes() {
  const [rows, setRows] = useState<Sess[]>([]);

  async function load() {
    const { data } = await supabase.from("active_sessions")
      .select("*")
      .order("last_seen", { ascending: false })
      .limit(500);
    setRows((data ?? []) as Sess[]);
  }

  useEffect(() => { load(); }, []);

  async function encerrar(id: string) {
    const { error } = await supabase.from("active_sessions").update({ status: "encerrada" }).eq("id", id);
    if (error) toast.error("Erro ao encerrar sessão");
    else { toast.success("Sessão encerrada"); load(); }
  }

  const ativas = rows.filter((r) => r.status === "ativa");
  const encerradas = rows.filter((r) => r.status !== "ativa");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Kpi label="Sessões ativas" value={ativas.length} />
        <Kpi label="Encerradas" value={encerradas.length} />
        <Kpi label="Total registradas" value={rows.length} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Último acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.usuario_id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{r.device ?? "—"}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[280px]">{r.user_agent ?? ""}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{r.ip ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(r.last_seen), { addSuffix: true, locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.status === "ativa" ? "default" : "secondary"}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "ativa" && (
                      <Button variant="ghost" size="sm" onClick={() => encerrar(r.id)}>
                        <LogOut className="h-4 w-4" /> Encerrar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Nenhuma sessão registrada.</TableCell></TableRow>
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
