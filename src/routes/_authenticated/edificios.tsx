import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { EstruturaPage } from "@/components/estruturas/EstruturaPage";

export const Route = createFileRoute("/_authenticated/edificios")({
  head: () => ({ meta: [{ title: "Edifícios — MV Broker" }] }),
  component: () => (
    <RoleGate allow={["super_admin", "secretaria"]}>
      <EstruturaPage tipo="edificio" />
    </RoleGate>
  ),
});
