import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/registros/$id/editar")({
  head: () => ({ meta: [{ title: "Editar registro — MV Broker" }] }),
  component: Edit,
});

function Edit() {
  const { id } = useParams({ from: "/_authenticated/registros/$id/editar" });
  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/registros/$id" params={{ id }}><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        </Button>
      </div>
      <PageHeader title={`Editar registro #${id}`} description="Atualize as informações deste cadastro." />
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2"><Label>Título</Label><Input defaultValue="Apartamento Centro" /></div>
          <div className="space-y-2"><Label>Cidade</Label><Input defaultValue="São Paulo" /></div>
          <div className="space-y-2"><Label>Valor</Label><Input defaultValue="580000" type="number" /></div>
          <div className="space-y-2"><Label>Área (m²)</Label><Input defaultValue="82" type="number" /></div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="outline" asChild><Link to="/registros/$id" params={{ id }}>Cancelar</Link></Button>
            <Button><Save className="h-4 w-4" /> Salvar alterações</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
