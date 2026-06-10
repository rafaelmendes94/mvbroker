import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({ meta: [{ title: "Clientes — MV Broker" }] }),
  component: Clientes,
});

const clients = Array.from({ length: 9 }, (_, i) => ({
  nome: ["Ricardo Almeida", "Beatriz Souza", "Felipe Mendes", "Camila Rocha", "Eduardo Lima", "Juliana Dias", "Marcos Vinicius", "Tatiana Cruz", "Roberto Nunes"][i],
  email: ["ricardo@email.com", "beatriz@email.com", "felipe@email.com", "camila@email.com", "eduardo@email.com", "juliana@email.com", "marcos@email.com", "tatiana@email.com", "roberto@email.com"][i],
  telefone: "(11) 99999-0000",
  tag: ["Premium", "Padrão", "VIP"][i % 3],
}));

function Clientes() {
  return (
    <>
      <PageHeader title="Clientes" description="Sua base de clientes e contatos."
        actions={<Button><Plus className="h-4 w-4" /> Novo cliente</Button>} />
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar clientes..." className="pl-9" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(c => (
          <Card key={c.email} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {c.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{c.nome}</div>
                  <Badge variant="secondary" className="mt-1">{c.tag}</Badge>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> <span className="truncate">{c.email}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {c.telefone}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
