import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, ArrowUp, ArrowDown, Settings2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoleGate } from "@/components/RoleGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { CATEGORIAS, useSystemOptions, type SystemOption } from "@/hooks/use-system-options";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authenticated/configuracoes/opcoes")({
  head: () => ({ meta: [{ title: "Opções do Sistema — MV Broker" }] }),
  component: () => (
    <RoleGate allow={["super_admin"]}>
      <OpcoesPage />
    </RoleGate>
  ),
});

const PAGE_SIZE = 10;

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function OpcoesPage() {
  const [categoria, setCategoria] = useState<string>(CATEGORIAS[0].key);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SystemOption | null>(null);
  const [nome, setNome] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  const { options, loading, reload } = useSystemOptions(categoria);

  const filtered = useMemo(
    () => options.filter((o) => o.nome.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openCreate() {
    setEditing(null); setNome(""); setAtivo(true); setOpen(true);
  }
  function openEdit(o: SystemOption) {
    setEditing(o); setNome(o.nome); setAtivo(o.ativo); setOpen(true);
  }

  async function save() {
    if (!nome.trim()) { toast.error("Informe o nome"); return; }
    setSaving(true);
    const slug = slugify(nome);
    if (editing) {
      const { error } = await supabase
        .from("system_options")
        .update({ nome, slug, ativo })
        .eq("id", editing.id);
      setSaving(false);
      if (error) { toast.error(error.message); return; }
      await logAudit("perfil_alterado", `Opção atualizada: ${categoria}/${slug}`);
      toast.success("Opção atualizada");
    } else {
      const nextOrdem = (options.at(-1)?.ordem ?? 0) + 1;
      const { error } = await supabase
        .from("system_options")
        .insert({ categoria, nome, slug, ativo, ordem: nextOrdem });
      setSaving(false);
      if (error) { toast.error(error.message); return; }
      await logAudit("perfil_alterado", `Opção criada: ${categoria}/${slug}`);
      toast.success("Opção criada");
    }
    setOpen(false); reload();
  }

  async function toggleAtivo(o: SystemOption) {
    const { error } = await supabase
      .from("system_options").update({ ativo: !o.ativo }).eq("id", o.id);
    if (error) return toast.error(error.message);
    reload();
  }

  async function remove(o: SystemOption) {
    if (!confirm(`Excluir opção "${o.nome}"?`)) return;
    const { error } = await supabase.from("system_options").delete().eq("id", o.id);
    if (error) return toast.error(error.message);
    await logAudit("perfil_alterado", `Opção removida: ${o.categoria}/${o.slug}`);
    toast.success("Opção removida"); reload();
  }

  async function move(o: SystemOption, dir: -1 | 1) {
    const sorted = [...options].sort((a, b) => a.ordem - b.ordem);
    const idx = sorted.findIndex((x) => x.id === o.id);
    const target = sorted[idx + dir];
    if (!target) return;
    await Promise.all([
      supabase.from("system_options").update({ ordem: target.ordem }).eq("id", o.id),
      supabase.from("system_options").update({ ordem: o.ordem }).eq("id", target.id),
    ]);
    reload();
  }

  return (
    <>
      <PageHeader
        title="Opções do Sistema"
        description="Centralize aqui todas as listas usadas nos formulários do sistema."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" /> Nova opção</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar opção" : "Nova opção"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Categoria</Label>
                  <div className="text-sm text-muted-foreground">
                    {CATEGORIAS.find((c) => c.key === categoria)?.label}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome *</Label>
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} />
                  {nome && (
                    <p className="text-[11px] text-muted-foreground">Slug: <code>{slugify(nome)}</code></p>
                  )}
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">Ativo</p>
                    <p className="text-xs text-muted-foreground">Exibido nos formulários.</p>
                  </div>
                  <Switch checked={ativo} onCheckedChange={setAtivo} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={save} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                  {editing ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="mb-4">
        <CardContent className="p-3 flex flex-wrap gap-1.5">
          {CATEGORIAS.map((c) => {
            const active = c.key === categoria;
            return (
              <button
                key={c.key}
                onClick={() => { setCategoria(c.key); setPage(1); setSearch(""); }}
                className={
                  "px-3 py-1.5 text-xs rounded-md border transition-colors " +
                  (active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted text-foreground/80 border-border")
                }
              >
                {c.label}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar opção..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
          ) : pageItems.length === 0 ? (
            <div className="py-12 text-center">
              <Settings2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma opção encontrada.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Ordem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[180px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="text-muted-foreground text-xs font-mono">{o.ordem}</TableCell>
                      <TableCell className="font-medium">{o.nome}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">{o.slug}</TableCell>
                      <TableCell>
                        <Badge variant={o.ativo ? "default" : "secondary"}>
                          {o.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => move(o, -1)}><ArrowUp className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => move(o, 1)}><ArrowDown className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => toggleAtivo(o)} title={o.ativo ? "Inativar" : "Ativar"}>
                            <Switch checked={o.ativo} className="pointer-events-none scale-75" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => openEdit(o)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => remove(o)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>{filtered.length} opções</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
                  <span>{page} / {totalPages}</span>
                  <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Próximo</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
