import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'amber';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-navy-900 text-white',
  success: 'bg-success text-white',
  warning: 'bg-amber-600 text-white',
  danger: 'bg-danger text-white',
  info: 'bg-info text-white',
  amber: 'bg-amber text-navy-900',
};

/** Signature "price tag" chip — a notched badge used across the app for status/stock labels. */
export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'tag-chip inline-flex items-center pl-3.5 pr-2.5 py-1 text-[11px] font-mono font-medium tracking-wide uppercase',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = 'neutral', className }: { tone?: Tone; className?: string }) {
  const dotColor: Record<Tone, string> = {
    neutral: 'bg-slate',
    success: 'bg-success',
    warning: 'bg-amber-600',
    danger: 'bg-danger',
    info: 'bg-info',
    amber: 'bg-amber',
  };
  return <span className={cn('inline-block h-1.5 w-1.5 rounded-full', dotColor[tone], className)} />;
}
