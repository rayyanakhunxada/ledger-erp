import { useMemo } from 'react';
import { useOrderStore } from '@/store/useOrderStore';
import { useProductStore } from '@/store/useProductStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatCurrency } from '@/lib/utils';

const barColors = ['#E3A008', '#101728', '#2563A6', '#1F8A55', '#7C5CBF', '#D64545'];

export function CategoryBreakdown() {
  const orders = useOrderStore((s) => s.orders);
  const products = useProductStore((s) => s.products);
  const categories = useCategoryStore((s) => s.categories);
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);

  const rows = useMemo(() => {
    const skuToCategory = new Map<string, string>();
    for (const p of products) {
      skuToCategory.set(p.sku, p.categoryId);
      for (const v of p.variants) skuToCategory.set(v.sku, p.categoryId);
    }
    const totals = new Map<string, number>();
    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      for (const item of o.items) {
        const catId = skuToCategory.get(item.sku);
        if (!catId) continue;
        totals.set(catId, (totals.get(catId) ?? 0) + item.price * item.quantity);
      }
    }
    const list = Array.from(totals.entries())
      .map(([catId, revenue]) => ({
        name: categories.find((c) => c.id === catId)?.name ?? 'Other',
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
    const max = Math.max(...list.map((r) => r.revenue), 1);
    return list.map((r) => ({ ...r, pct: (r.revenue / max) * 100 }));
  }, [orders, products, categories]);

  if (rows.length === 0) {
    return <p className="text-xs text-slate py-8 text-center">No sales recorded yet.</p>;
  }

  return (
    <div className="space-y-3.5">
      {rows.map((row, i) => (
        <div key={row.name}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-ink">{row.name}</span>
            <span className="text-slate tabular">{formatCurrency(row.revenue, currencySymbol)}</span>
          </div>
          <div className="h-1.5 bg-paper rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${row.pct}%`, backgroundColor: barColors[i % barColors.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
