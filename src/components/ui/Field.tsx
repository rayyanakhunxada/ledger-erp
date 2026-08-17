import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/cn';

const fieldBase =
  'w-full h-9 px-3 rounded-sm border border-line bg-white text-sm text-ink placeholder:text-slate/70 focus:border-navy-900/40 transition-colors';

export function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-slate mb-1.5">
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldBase, className)} {...props} />
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(fieldBase, 'pr-8 appearance-none bg-no-repeat bg-[right_10px_center]', className)} {...props}>
      {children}
    </select>
  )
);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, 'h-auto min-h-[80px] py-2 resize-y', className)} {...props} />
  )
);
Textarea.displayName = 'Textarea';

export function FieldGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-1.5', className)}>{children}</div>;
}
