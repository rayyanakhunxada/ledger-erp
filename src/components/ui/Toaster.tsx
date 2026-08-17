import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';
import { cn } from '@/lib/cn';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const toneClasses = {
  success: 'border-success/30 text-success',
  error: 'border-danger/30 text-danger',
  info: 'border-info/30 text-info',
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80 no-print">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-2.5 bg-white border rounded-md shadow-pop px-4 py-3 animate-[fadeIn_.15s_ease-out]',
              toneClasses[t.type]
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <p className="text-sm text-ink flex-1 leading-snug">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-slate hover:text-ink shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
