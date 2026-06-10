import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/registros")({
  component: () => <Outlet />,
});
// keep Link available for treeshake-safe imports elsewhere
void Link;
