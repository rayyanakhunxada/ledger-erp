import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card } from '@/components/ui/Card';
import { Toolbar, SearchInput } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input, Label, FieldGroup } from '@/components/ui/Field';
import { useStockMovementStore } from '@/store/useStockMovementStore';
import { useProductStore } from '@/store/useProductStore';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { useToastStore } from '@/store/useToastStore';
import { formatDate } from '@/lib/utils';
import type { StockMovement } from '@/types';

const typeTone: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  in: 'success',
  out: 'danger',
  transfer: 'info',
  adjustment: 'warning',
};

export default function Transfers() {
  const movements = useStockMovementStore((s) => s.movements);
  const record = useStockMovementStore((s) => s.record);
  const products = useProductStore((s) => s.products);
  const warehouses = useWarehouseStore((s) => s.warehouses);
  const push = useToastStore((s) => s.push);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ productId: products[0]?.id ?? '', type: 'in', quantity: 1, reason: '', reference: '' });

  const filtered = movements.filter((m) => {
    const matchesSearch = m.productName.toLowerCase().includes(search.toLowerCase()) || m.reference?.includes(search.toUpperCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSubmit = () => {
    if (!form.productId || form.quantity <= 0) {
      push('Invalid product or quantity.', 'error');
      return;
    }
    const product = products.find((p) => p.id === form.productId);
    if (!product) {
      push('Product not found.', 'error');
      return;
    }
    record({
      productId: form.productId,
      productName: product.name,
      type: form.type as any,
      quantity: form.quantity,
      reason: form.reason,
      reference: form.reference,
    });
    push('Stock movement recorded.');
    setForm({ productId: products[0]?.id ?? '', type: 'in', quantity: 1, reason: '', reference: '' });
    setFormOpen(false);
  };

  const columns: Column<StockMovement>[] = [
    { header: 'Date', key: 'createdAt', render: (m) => <span className="text-xs text-slate font-mono">{formatDate(m.createdAt)}</span> },
    {
      header: 'Product',
      key: 'productName',
      render: (m) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{m.productName}</p>
          {m.reference && <p className="text-[11px] text-slate">Ref: {m.reference}</p>}
        </div>
      ),
    },
    { header: 'Type', key: 'type', align: 'center', render: (m) => <Badge tone={typeTone[m.type] ?? 'neutral'}>{m.type}</Badge> },
    { header: 'Qty', key: 'quantity', align: 'center', render: (m) => <span className="text-xs font-mono font-semibold">{m.quantity}</span> },
    { header: 'Reason', key: 'reason', render: (m) => <span className="text-xs text-slate">{m.reason}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Movements"
        description="Track all stock adjustments, transfers, and purchase receipts."
        action={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Record movement
          </Button>
        }
      />

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by product or reference…" />
          <Select className="w-40" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="in">Stock in</option>
            <option value="out">Stock out</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </Select>
          <span className="ml-auto text-xs text-slate">{filtered.length} movements</span>
        </Toolbar>
        <DataTable columns={columns} data={filtered} rowKey={(m) => m.id} pageSize={12} emptyLabel="No movements recorded yet" />
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Record stock movement"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit}>Record</Button>
          </>
        }
      >
        <div className="space-y-3">
          <FieldGroup>
            <Label required>Product</Label>
            <Select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label required>Type</Label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="in">Stock in (received)</option>
              <option value="out">Stock out (sold/damaged)</option>
              <option value="transfer">Transfer between warehouses</option>
              <option value="adjustment">Adjustment (inventory count)</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label required>Quantity</Label>
            <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          </FieldGroup>
          <FieldGroup>
            <Label required>Reason</Label>
            <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g., 'Customer return', 'Stock count'" />
          </FieldGroup>
          <FieldGroup>
            <Label>Reference</Label>
            <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="PO number, order ID, etc." />
          </FieldGroup>
        </div>
      </Modal>
    </div>
  );
}
