import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Search, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/seguranca/")({
  component: LogsSistema,
});

type Log = {
  id: string;
  usuario_id: string | null;
  perfil: string | null;
  modulo: string;
  acao: string;
  registro_tipo: string | null;
  registro_id: string | null;
  dados_anteriores: unknown;
  dados_novos: unknown;
  ip: string | null;
  user_agent: string | null;
  status: string;
  descricao: string | null;
  created_at: string;
};

const ALL = "__all__";
const PERIODOS = [
  { v: "1", l: "24h" }, { v: "7", l: "7 dias" }, { v: "30", l: "30 dias" }, { v: "90", l: "90 dias" }, { v: "0", l: "Tudo" },
];
const STATUS = ["sucesso", "erro", "negado", "alerta"];

const STATUS_VARIANTS: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  sucesso: "default",
  erro: "destructive",
  negado: "destructive",
  alerta: "secondary",
};

function LogsSistema() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("7");
  const [modulo, setModulo] = useState(ALL);
  const [acao, setAcao] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Log | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query: any = supabase.from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (periodo !== "0") {
        const since = new Date(Date.now() - Number(periodo) * 86400000).toISOString();
        query = query.gte("created_at", since);
      }
      if (modulo !== ALL) query = query.eq("modulo", modulo);
      if (acao !== ALL) query = query.eq("acao", acao);
      if (status !== ALL) query = query.eq("status", status);
      const { data } = await query;
      setLogs((data ?? []) as Log[]);
      setLoading(false);
    })();
  }, [periodo, modulo, acao, status]);

  const modulos = useMemo(() => [...new Set(logs.map((l) => l.modulo))].sort(), [logs]);
  const acoes = useMemo(() => [...new Set(logs.map((l) => l.acao))].sort(), [logs]);

  const filtered = useMemo(() => {
    if (!q) return logs;
    const lower = q.toLowerCase();
    return logs.filter((l) =>
      [l.modulo, l.acao, l.descricao ?? "", l.ip ?? "", l.usuario_id ?? "", l.registro_id ?? ""]
        .join(" ").toLowerCase().includes(lower)
    );
  }, [logs, q]);

  function reset() {
    setPeriodo("7"); setModulo(ALL); setAcao(ALL); setStatus(ALL); setQ("");
  }

  function exportCSV() {
    const head = ["data", "usuario_id", "modulo", "acao", "status", "registro_tipo", "registro_id", "ip", "descricao"];
    const rows = filtered.map((l) => [
      l.created_at, l.usuario_id ?? "", l.modulo, l.acao, l.status,
      l.registro_tipo ?? "", l.registro_id ?? "", l.ip ?? "", (l.descricao ?? "").replace(/"/g, '""'),
    ]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `audit-logs-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-3 flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-0.5">
            <Label>Período</Label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{PERIODOS.map((p) => <SelectItem key={p.v} value={p.v}>{p.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-0.5">
            <Label>Módulo</Label>
            <Select value={modulo} onValueChange={setModulo}>
              <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {modulos.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-0.5">
            <Label>Ação</Label>
            <Select value={acao} onValueChange={setAcao}>
              <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas</SelectItem>
                {acoes.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-0.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-[180px]">
            <Label>Busca</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="h-9 pl-8" placeholder="usuário, IP, descrição..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="h-4 w-4" /> Limpar</Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>Exportar CSV</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP</TableHead>
                <TableHead className="text-right">—</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Carregando...</TableCell></TableRow>}
              {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Nenhum log no período.</TableCell></TableRow>}
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(l.created_at), "dd/MM HH:mm:ss")}
                  </TableCell>
                  <TableCell><Badge variant="outline">{l.modulo}</Badge></TableCell>
                  <TableCell className="font-medium">{l.acao}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">
                    {l.usuario_id?.slice(0, 8) ?? "—"}
                  </TableCell>
                  <TableCell><Badge variant={STATUS_VARIANTS[l.status] ?? "outline"}>{l.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.ip ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelected(l)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto">
          <DialogHeader><DialogTitle>Detalhe do log</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Row k="Data" v={format(new Date(selected.created_at), "dd/MM/yyyy HH:mm:ss")} />
              <Row k="Módulo" v={selected.modulo} />
              <Row k="Ação" v={selected.acao} />
              <Row k="Status" v={selected.status} />
              <Row k="Usuário" v={selected.usuario_id ?? "—"} />
              <Row k="IP" v={selected.ip ?? "—"} />
              <Row k="User Agent" v={selected.user_agent ?? "—"} />
              <Row k="Registro" v={`${selected.registro_tipo ?? "—"} ${selected.registro_id ?? ""}`} />
              <Row k="Descrição" v={selected.descricao ?? "—"} />
              <DiffBlock title="Antes" data={selected.dados_anteriores} />
              <DiffBlock title="Depois" data={selected.dados_novos} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] uppercase tracking-wide text-muted-foreground px-1">{children}</span>;
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 border-b py-1.5">
      <span className="text-muted-foreground text-xs">{k}</span>
      <span className="font-mono text-xs break-all">{v}</span>
    </div>
  );
}
function DiffBlock({ title, data }: { title: string; data: unknown }) {
  if (!data) return null;
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1">{title}</div>
      <pre className="text-[11px] bg-muted rounded p-3 overflow-auto max-h-72">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
