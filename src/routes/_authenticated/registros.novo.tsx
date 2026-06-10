import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/registros/novo")({
  head: () => ({ meta: [{ title: "Novo registro — MV Broker" }] }),
  component: NovoRegistro,
});

function NovoRegistro() {
  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/registros"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        </Button>
      </div>
      <PageHeader title="Novo registro" description="Preencha os dados para criar um novo cadastro." />
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2"><Label>Título</Label><Input placeholder="Ex.: Apartamento Centro" /></div>
          <div className="space-y-2"><Label>Tipo</Label>
            <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="res">Residencial</SelectItem>
                <SelectItem value="com">Comercial</SelectItem>
                <SelectItem value="ter">Terreno</SelectItem>
                <SelectItem value="rur">Rural</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Cidade</Label><Input placeholder="Ex.: São Paulo" /></div>
          <div className="space-y-2"><Label>Valor</Label><Input type="number" placeholder="0,00" /></div>
          <div className="space-y-2 md:col-span-2"><Label>Descrição</Label><Textarea rows={5} placeholder="Detalhes do imóvel..." /></div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="outline" asChild><Link to="/registros">Cancelar</Link></Button>
            <Button><Save className="h-4 w-4" /> Salvar</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
