import { type ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Column<T> {
  header: string;
  key: string;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  emptyLabel?: string;
  rowKey: (row: T) => string;
}

export function DataTable<T>({ columns, data, pageSize = 8, emptyLabel = 'No records found', rowKey }: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = data.slice((page - 1) * pageSize, page * pageSize);

  if (page > totalPages) setPage(totalPages);

  return (
    <div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate whitespace-nowrap',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-14">
                  <div className="flex flex-col items-center gap-2 text-slate">
                    <Inbox className="h-5 w-5" />
                    <span className="text-xs">{emptyLabel}</span>
                  </div>
                </td>
              </tr>
            )}
            {pageData.map((row) => (
              <tr key={rowKey(row)} className="border-b border-line last:border-0 hover:bg-paper/60 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-5 py-3 text-ink align-middle',
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                      col.className
                    )}
                  >
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-line">
          <span className="text-xs text-slate">
            Page {page} of {totalPages} · {data.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7 w-7 flex items-center justify-center rounded-sm border border-line disabled:opacity-40 hover:bg-paper"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-7 w-7 flex items-center justify-center rounded-sm border border-line disabled:opacity-40 hover:bg-paper"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
