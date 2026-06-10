import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logAudit } from "@/lib/audit";
import { logAction, createSecurityAlert } from "@/lib/audit";

type Search = { from?: string };

export const Route = createFileRoute("/_authenticated/acesso-negado")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  component: AcessoNegado,
});

function AcessoNegado() {
  const { from } = useSearch({ from: "/_authenticated/acesso-negado" });

  useEffect(() => {
    logAudit("acesso_negado", from ?? "rota_bloqueada", { from });
    logAction({
      modulo: "seguranca",
      acao: "acesso_negado",
      status: "negado",
      descricao: from ? `Tentativa de acesso a ${from}` : "Tentativa de acesso a rota bloqueada",
    });
    createSecurityAlert({
      tipo: "rota_bloqueada",
      severidade: "media",
      descricao: `Acesso negado${from ? ` à rota ${from}` : ""}`,
      metadata: { from },
    });
  }, [from]);

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldX className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold">Acesso negado</h1>
        <p className="text-muted-foreground">
          Você não tem permissão para acessar esta página. O acesso foi registrado para fins de auditoria.
        </p>
        {from && <p className="text-xs text-muted-foreground">Rota: <code>{from}</code></p>}
        <div className="flex gap-2 justify-center pt-2">
          <Button asChild variant="outline"><Link to="/dashboard">Voltar ao Dashboard</Link></Button>
        </div>
      </div>
    </div>
  );
}
