import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card } from '@/components/ui/Card';
import { Toolbar, SearchInput } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProductFormModal } from './ProductFormModal';
import { useProductStore } from '@/store/useProductStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';
import { formatCurrency, exportToCSV } from '@/lib/utils';
import type { Product } from '@/types';

export default function Products() {
  const products = useProductStore((s) => s.products);
  const removeProduct = useProductStore((s) => s.remove);
  const categories = useCategoryStore((s) => s.categories);
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);
  const push = useToastStore((s) => s.push);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—';

  const stockLabel = (p: Product) => {
    const total = p.hasVariants ? p.variants.reduce((sum, v) => sum + v.stock, 0) : p.stock;
    const min = p.hasVariants ? Math.min(...p.variants.map((v) => v.reorderLevel), p.reorderLevel) : p.reorderLevel;
    const tone = total === 0 ? 'danger' : total <= min ? 'warning' : 'success';
    return <Badge tone={tone}>{total} {p.hasVariants ? `· ${p.variants.length} sizes` : p.unit}</Badge>;
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product',
      key: 'name',
      render: (p) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{p.name}</p>
          <p className="text-[11px] text-slate font-mono">{p.sku}{p.brand ? ` · ${p.brand}` : ''}</p>
        </div>
      ),
    },
    { header: 'Category', key: 'categoryId', render: (p) => <span className="text-xs text-slate">{categoryName(p.categoryId)}</span> },
    { header: 'Stock', key: 'stock', render: stockLabel },
    { header: 'Cost', key: 'costPrice', align: 'right', render: (p) => <span className="tabular text-xs text-slate">{formatCurrency(p.costPrice, currencySymbol)}</span> },
    { header: 'Sell price', key: 'sellPrice', align: 'right', render: (p) => <span className="tabular text-sm font-medium">{formatCurrency(p.sellPrice, currencySymbol)}</span> },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      render: (p) => <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>{p.status}</Badge>,
    },
    {
      header: '',
      key: 'actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setEditing(p); setFormOpen(true); }}
            className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-paper text-slate hover:text-ink"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleting(p)}
            className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-danger/5 text-slate hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your entire catalog — general merchandise, footwear, and everything between."
        action={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV('products.csv', filtered.map((p) => ({ name: p.name, sku: p.sku, category: categoryName(p.categoryId), stock: p.stock, cost: p.costPrice, price: p.sellPrice, status: p.status })))}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-3.5 w-3.5" /> Add product
            </Button>
          </>
        }
      />

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or SKU…" />
          <Select className="w-44" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select className="w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <span className="ml-auto text-xs text-slate">{filtered.length} products</span>
        </Toolbar>
        <DataTable columns={columns} data={filtered} rowKey={(p) => p.id} pageSize={8} emptyLabel="No products match your filters" />
      </Card>

      {products.length === 0 && (
        <div className="hidden">
          <Package />
        </div>
      )}

      <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} product={editing} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete product"
        description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
        onConfirm={() => {
          if (deleting) {
            removeProduct(deleting.id);
            push('Product deleted.', 'info');
          }
        }}
      />
    </div>
  );
}
