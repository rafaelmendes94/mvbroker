import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Building2, MapPin, Calendar, Tag } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/registros/$id")({
  head: () => ({ meta: [{ title: "Detalhes do registro — MV Broker" }] }),
  component: Detail,
});

function Detail() {
  const { id } = useParams({ from: "/_authenticated/registros/$id" });
  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/registros"><ArrowLeft className="h-4 w-4" /> Voltar para cadastros</Link>
        </Button>
      </div>
      <PageHeader
        title={`Registro #${id}`}
        description="Detalhes completos do imóvel cadastrado."
        actions={
          <Button asChild>
            <Link to="/registros/$id/editar" params={{ id }}><Pencil className="h-4 w-4" /> Editar</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Informações gerais</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Título", "Apartamento Centro"],
              ["Código interno", `MVB-${id}`],
              ["Tipo", "Residencial"],
              ["Subtipo", "Apartamento"],
              ["Área útil", "82 m²"],
              ["Quartos", "3"],
              ["Vagas", "2"],
              ["Valor", "R$ 580.000"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-xs text-muted-foreground">{k}</div>
                <div className="text-sm font-medium mt-0.5">{v}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Badge className="bg-[oklch(0.68_0.16_152)] text-white">Ativo</Badge></div>
            <div className="flex items-center gap-2 text-sm"><Tag className="h-4 w-4 text-muted-foreground" /> Categoria: Premium</div>
            <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> São Paulo / SP</div>
            <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /> Criado em 10/06/2026</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
