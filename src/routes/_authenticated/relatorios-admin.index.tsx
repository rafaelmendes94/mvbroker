import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/relatorios-admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/relatorios-admin/atividade" });
  },
  component: () => null,
});
