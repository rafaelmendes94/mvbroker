import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — MV Broker" }] }),
  component: Configuracoes,
});

function Configuracoes() {
  return (
    <>
      <PageHeader title="Configurações" description="Personalize sua experiência na plataforma." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Organização</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Nome da empresa</Label><Input defaultValue="MV Broker Ltda." /></div>
            <div className="space-y-2"><Label>CNPJ</Label><Input defaultValue="00.000.000/0001-00" /></div>
            <div className="space-y-2"><Label>E-mail de contato</Label><Input type="email" defaultValue="contato@mvbroker.com" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Preferências</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Notificações por e-mail", "Receba atualizações importantes."],
              ["Resumo semanal", "Relatório consolidado toda segunda-feira."],
              ["Modo compacto", "Reduzir espaçamento das listas."],
            ].map(([t, d]) => (
              <div key={t} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{t}</div>
                  <div className="text-xs text-muted-foreground">{d}</div>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
            <Separator />
            <Button><Save className="h-4 w-4" /> Salvar alterações</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
