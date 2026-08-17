import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useOrderStore } from '@/store/useOrderStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  pending: 'warning',
  'partially-paid': 'warning',
  cancelled: 'danger',
  refunded: 'neutral',
};

export function RecentOrdersPanel() {
  const orders = useOrderStore((s) => s.orders);
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);
  const recent = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
    [orders]
  );

  return (
    <div className="divide-y divide-line">
      {recent.map((o) => (
        <div key={o.id} className="flex items-center justify-between py-2.5">
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink truncate">{o.customerName}</p>
            <p className="text-[11px] text-slate font-mono">{o.orderNo} · {formatDate(o.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold tabular text-ink">{formatCurrency(o.total, currencySymbol)}</span>
            <Badge tone={statusTone[o.status] ?? 'neutral'}>{o.status.replace('-', ' ')}</Badge>
          </div>
        </div>
      ))}
      <Link to="/sales/orders" className="block text-center text-xs font-medium text-navy-900 pt-3 hover:underline">
        View all orders →
      </Link>
    </div>
  );
}

export function TopProductsPanel() {
  const orders = useOrderStore((s) => s.orders);
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);

  const rows = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      for (const item of o.items) {
        const entry = map.get(item.sku) ?? { name: item.productName, qty: 0, revenue: 0 };
        entry.qty += item.quantity;
        entry.revenue += item.price * item.quantity;
        map.set(item.sku, entry);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  return (
    <div className="divide-y divide-line">
      {rows.map((r, i) => (
        <div key={r.name} className="flex items-center gap-3 py-2.5">
          <span className="h-6 w-6 rounded-sm bg-navy-50 text-navy-900 text-[11px] font-mono font-semibold flex items-center justify-center shrink-0">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-ink truncate">{r.name}</p>
            <p className="text-[11px] text-slate">{r.qty} units sold</p>
          </div>
          <span className="text-xs font-semibold tabular text-ink shrink-0">{formatCurrency(r.revenue, currencySymbol)}</span>
        </div>
      ))}
    </div>
  );
}
