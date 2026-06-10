import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoleGate } from "@/components/RoleGate";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/auditoria")({
  head: () => ({ meta: [{ title: "Auditoria — MV Broker" }] }),
  component: () => (
    <RoleGate allow={["super_admin"]}>
      <AuditoriaPage />
    </RoleGate>
  ),
});

type Evento = {
  id: string;
  user_id: string | null;
  evento: string;
  descricao: string | null;
  created_at: string;
};

const COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  login: "default",
  logout: "secondary",
  perfil_alterado: "outline",
  usuario_criado: "default",
  usuario_inativado: "destructive",
};

function AuditoriaPage() {
  const [items, setItems] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("auditoria_acessos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setItems((data ?? []) as Evento[]);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <PageHeader
        title="Auditoria de acessos"
        description="Histórico de eventos de segurança e gestão de usuários."
      />
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(e.created_at).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={COLOR[e.evento] ?? "outline"}>{e.evento}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">
                      {e.user_id?.slice(0, 8) ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{e.descricao ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
