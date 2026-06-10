import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { EstruturaPage } from "@/components/estruturas/EstruturaPage";

export const Route = createFileRoute("/_authenticated/condominios")({
  head: () => ({ meta: [{ title: "Condomínios — MV Broker" }] }),
  component: () => (
    <RoleGate allow={["super_admin", "secretaria"]}>
      <EstruturaPage tipo="condominio" />
    </RoleGate>
  ),
});
