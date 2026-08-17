import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; direction: 'up' | 'down' };
  accent?: 'amber' | 'navy' | 'success' | 'danger' | 'info';
}

const accentClasses = {
  amber: 'bg-amber-50 text-amber-700',
  navy: 'bg-navy-50 text-navy-900',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
};

export function StatCard({ label, value, icon: Icon, trend, accent = 'navy' }: StatCardProps) {
  return (
    <div className="bg-white border border-line rounded-md shadow-card p-4">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate">{label}</span>
        <div className={cn('h-8 w-8 rounded-sm flex items-center justify-center', accentClasses[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="font-display font-semibold text-2xl text-ink tabular">{value}</span>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium mb-0.5',
              trend.direction === 'up' ? 'text-success' : 'text-danger'
            )}
          >
            {trend.direction === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
