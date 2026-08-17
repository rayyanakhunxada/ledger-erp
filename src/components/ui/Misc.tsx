import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-12 w-12 rounded-full bg-navy-50 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-navy-900" />
      </div>
      <h3 className="font-display font-semibold text-sm text-ink">{title}</h3>
      <p className="text-xs text-slate mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display font-semibold text-xl text-ink">{title}</h1>
        {description && <p className="text-sm text-slate mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}
