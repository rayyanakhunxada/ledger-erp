import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '@/store/useProductStore';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/Misc';
import { PackageCheck } from 'lucide-react';

export function LowStockPanel() {
  const products = useProductStore((s) => s.products);

  const rows = useMemo(() => {
    const out: { id: string; name: string; sku: string; stock: number; reorderLevel: number }[] = [];
    for (const p of products) {
      if (p.status !== 'active') continue;
      if (p.hasVariants) {
        for (const v of p.variants) {
          if (v.stock <= v.reorderLevel) {
            out.push({ id: `${p.id}-${v.id}`, name: `${p.name} (${v.size})`, sku: v.sku, stock: v.stock, reorderLevel: v.reorderLevel });
          }
        }
      } else if (p.stock <= p.reorderLevel) {
        out.push({ id: p.id, name: p.name, sku: p.sku, stock: p.stock, reorderLevel: p.reorderLevel });
      }
    }
    return out.sort((a, b) => a.stock - b.stock).slice(0, 6);
  }, [products]);

  if (rows.length === 0) {
    return <EmptyState icon={PackageCheck} title="Stock levels are healthy" description="No products are currently below their reorder level." />;
  }

  return (
    <div className="divide-y divide-line">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center justify-between py-2.5">
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink truncate">{r.name}</p>
            <p className="text-[11px] text-slate font-mono">{r.sku}</p>
          </div>
          <Badge tone={r.stock === 0 ? 'danger' : 'warning'}>{r.stock === 0 ? 'Out of stock' : `${r.stock} left`}</Badge>
        </div>
      ))}
      <Link to="/inventory/stock" className="block text-center text-xs font-medium text-navy-900 pt-3 hover:underline">
        View full stock report →
      </Link>
    </div>
  );
}
