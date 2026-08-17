import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          'relative w-full bg-white rounded-md shadow-pop border border-line max-h-[90vh] flex flex-col animate-[fadeIn_.15s_ease-out]',
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line shrink-0">
          <div>
            <h2 className="font-display font-semibold text-base text-ink">{title}</h2>
            {subtitle && <p className="text-xs text-slate mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-sm text-slate hover:bg-paper hover:text-ink transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-line shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
