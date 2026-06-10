import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { EstruturaPage } from "@/components/estruturas/EstruturaPage";

export const Route = createFileRoute("/_authenticated/empreendimentos")({
  head: () => ({ meta: [{ title: "Empreendimentos — MV Broker" }] }),
  component: () => (
    <RoleGate allow={["super_admin", "secretaria"]}>
      <EstruturaPage tipo="empreendimento" />
    </RoleGate>
  ),
});
