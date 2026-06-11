import type { ReactNode } from "react";

export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground truncate">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1.5">{description}</p>}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}
