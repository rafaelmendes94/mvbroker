import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, ArrowUpDown, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/registros/")({
  head: () => ({ meta: [{ title: "Cadastros — MV Broker" }] }),
  component: RegistrosList,
});

const mock = Array.from({ length: 24 }, (_, i) => ({
  id: String(i + 1).padStart(4, "0"),
  titulo: ["Apartamento Centro", "Casa Jardim Europa", "Sala Comercial", "Terreno Industrial"][i % 4],
  tipo: ["Residencial", "Comercial", "Terreno", "Rural"][i % 4],
  cidade: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba"][i % 4],
  status: ["Ativo", "Pendente", "Arquivado"][i % 3] as "Ativo" | "Pendente" | "Arquivado",
  valor: `R$ ${(Math.random() * 900 + 100).toFixed(0)}.000`,
  criado: `${(i % 28) + 1}/06/2026`,
}));

const statusColor: Record<string, string> = {
  Ativo: "bg-[oklch(0.68_0.16_152)]/15 text-[oklch(0.45_0.16_152)] border-[oklch(0.68_0.16_152)]/30",
  Pendente: "bg-[oklch(0.78_0.16_80)]/15 text-[oklch(0.45_0.14_80)] border-[oklch(0.78_0.16_80)]/30",
  Arquivado: "bg-muted text-muted-foreground border-border",
};

function RegistrosList() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(mock.length / pageSize);
  const rows = mock.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <PageHeader
        title="Cadastros"
        description="Gerencie todos os registros da plataforma."
        actions={
          <Button asChild>
            <Link to="/registros/novo"><Plus className="h-4 w-4" /> Novo registro</Link>
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por título, cidade..." className="pl-9" />
          </div>
          <Select defaultValue="todos">
            <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="arquivado">Arquivado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline"><Filter className="h-4 w-4" /> Filtros</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-20">ID</TableHead>
                <TableHead>
                  <button className="inline-flex items-center gap-1 hover:text-foreground">
                    Título <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs text-muted-foreground">#{r.id}</TableCell>
                  <TableCell className="font-medium">{r.titulo}</TableCell>
                  <TableCell><Badge variant="secondary">{r.tipo}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{r.cidade}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor[r.status]}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{r.valor}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.criado}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/registros/$id" params={{ id: r.id }}>
                            <Eye className="h-4 w-4 mr-2" /> Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/registros/$id/editar" params={{ id: r.id }}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border text-sm">
          <span className="text-muted-foreground">
            Página {page} de {totalPages} · {mock.length} registros
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Próxima <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
