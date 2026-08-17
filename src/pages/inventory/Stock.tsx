import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toolbar, SearchInput } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Field';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { useProductStore } from '@/store/useProductStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatNumber } from '@/lib/utils';

export default function StockOverview() {
  const products = useProductStore((s) => s.products);
  const categories = useCategoryStore((s) => s.categories);
  const warehouses = useWarehouseStore((s) => s.warehouses);
  const lowStockThreshold = useSettingsStore((s) => s.settings.lowStockThreshold);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  const rows = useMemo(() => {
    const list: {
      id: string;
      name: string;
      sku: string;
      category: string;
      warehouse: string;
      stock: number;
      reorderLevel: number;
      status: string;
    }[] = [];

    for (const p of products) {
      if (p.status !== 'active') continue;

      if (p.hasVariants) {
        for (const v of p.variants) {
          const matchesSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) || v.sku.toLowerCase().includes(search.toLowerCase());
          const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
          const matchesWarehouse = warehouseFilter === 'all' || p.warehouseId === warehouseFilter;
          if (matchesSearch && matchesCategory && matchesWarehouse) {
            list.push({
              id: `${p.id}-${v.id}`,
              name: `${p.name} (${v.size})`,
              sku: v.sku,
              category: categories.find((c) => c.id === p.categoryId)?.name ?? '—',
              warehouse: warehouses.find((w) => w.id === p.warehouseId)?.name ?? '—',
              stock: v.stock,
              reorderLevel: v.reorderLevel,
              status: v.stock === 0 ? 'out-of-stock' : v.stock <= v.reorderLevel ? 'low-stock' : 'in-stock',
            });
          }
        }
      } else {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
        const matchesWarehouse = warehouseFilter === 'all' || p.warehouseId === warehouseFilter;
        if (matchesSearch && matchesCategory && matchesWarehouse) {
          list.push({
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: categories.find((c) => c.id === p.categoryId)?.name ?? '—',
            warehouse: warehouses.find((w) => w.id === p.warehouseId)?.name ?? '—',
            stock: p.stock,
            reorderLevel: p.reorderLevel,
            status: p.stock === 0 ? 'out-of-stock' : p.stock <= p.reorderLevel ? 'low-stock' : 'in-stock',
          });
        }
      }
    }
    return list;
  }, [products, categories, warehouses, search, categoryFilter, warehouseFilter]);

  const outOfStock = rows.filter((r) => r.status === 'out-of-stock').length;
  const lowStock = rows.filter((r) => r.status === 'low-stock').length;

  const columns: Column<(typeof rows)[0]>[] = [
    {
      header: 'Product',
      key: 'name',
      render: (r) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{r.name}</p>
          <p className="text-xs text-slate font-mono">{r.sku}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      render: (r) => <span className="text-xs text-slate">{r.category}</span>,
    },
    {
      header: 'Warehouse',
      key: 'warehouse',
      render: (r) => <span className="text-xs text-slate">{r.warehouse}</span>,
    },
    {
      header: 'Stock',
      key: 'stock',
      align: 'right',
      render: (r) => <span className="font-mono text-sm font-medium">{formatNumber(r.stock)}</span>,
    },
    {
      header: 'Min. level',
      key: 'reorderLevel',
      align: 'right',
      render: (r) => <span className="text-xs text-slate font-mono">{r.reorderLevel}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      render: (r) => {
        const tone = r.status === 'out-of-stock' ? 'danger' : r.status === 'low-stock' ? 'warning' : 'success';
        const label = r.status === 'out-of-stock' ? 'Out of stock' : r.status === 'low-stock' ? 'Low stock' : 'In stock';
        return <Badge tone={tone}>{label}</Badge>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Overview"
        description={`${outOfStock} out of stock · ${lowStock} low stock items`}
      />

      {(outOfStock > 0 || lowStock > 0) && (
        <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-md px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
          <p className="text-xs text-amber-700">
            <strong>{outOfStock + lowStock}</strong> item{outOfStock + lowStock > 1 ? 's' : ''} need{outOfStock + lowStock > 1 ? '' : 's'} reordering.
          </p>
        </div>
      )}

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or SKU…" />
          <Select className="w-44" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select className="w-44" value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            <option value="all">All warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </Select>
          <span className="ml-auto text-xs text-slate">{rows.length} items</span>
        </Toolbar>
        <DataTable columns={columns} data={rows} rowKey={(r) => r.id} pageSize={10} emptyLabel="No products match your filters" />
      </Card>
    </div>
  );
}
