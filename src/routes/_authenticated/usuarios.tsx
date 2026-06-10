import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button as B } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — MV Broker" }] }),
  component: Usuarios,
});

const users = [
  { nome: "Maria Silva", email: "maria@mvbroker.com", role: "Administrador", status: "Ativo" },
  { nome: "João Pereira", email: "joao@mvbroker.com", role: "Gerente", status: "Ativo" },
  { nome: "Ana Costa", email: "ana@mvbroker.com", role: "Usuário", status: "Ativo" },
  { nome: "Carlos Ribeiro", email: "carlos@mvbroker.com", role: "Usuário", status: "Inativo" },
  { nome: "Patrícia Lima", email: "patricia@mvbroker.com", role: "Gerente", status: "Ativo" },
];

function Usuarios() {
  return (
    <>
      <PageHeader title="Usuários" description="Gerencie os usuários e permissões do sistema."
        actions={<Button><Plus className="h-4 w-4" /> Novo usuário</Button>} />
      <Card>
        <div className="p-4 border-b border-border relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar usuários..." className="pl-9 max-w-md" />
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {u.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{u.nome}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                <TableCell>
                  <Badge variant="outline" className={u.status === "Ativo" ? "bg-[oklch(0.68_0.16_152)]/15 text-[oklch(0.45_0.16_152)] border-[oklch(0.68_0.16_152)]/30" : "bg-muted text-muted-foreground"}>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell><B variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></B></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
