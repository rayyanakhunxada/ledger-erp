import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-64 max-w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-8 pr-3 rounded-sm border border-line bg-white text-sm placeholder:text-slate/70 focus:border-navy-900/40"
      />
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 px-5 py-3.5 border-b border-line">{children}</div>;
}
