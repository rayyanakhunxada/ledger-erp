import { useMemo, useState } from 'react';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toolbar, SearchInput } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useOrderStore } from '@/store/useOrderStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderFormModal } from './OrderFormModal';
import { OrderDetailModal } from './OrderDetailModal';
import type { Order, OrderStatus } from '@/types';

const statusTone: Record<OrderStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'amber'> = {
  paid: 'success',
  pending: 'warning',
  'partially-paid': 'warning',
  cancelled: 'danger',
  refunded: 'neutral',
};

export default function Orders() {
  const orders = useOrderStore((s) => s.orders);
  const removeOrder = useOrderStore((s) => s.remove);
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);
  const push = useToastStore((s) => s.push);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = o.orderNo.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const columns: Column<Order>[] = [
    {
      header: 'Order',
      key: 'orderNo',
      render: (o) => (
        <div>
          <p className="text-sm font-semibold text-ink">{o.orderNo}</p>
          <p className="text-xs text-slate">{formatDate(o.createdAt)}</p>
        </div>
      ),
    },
    {
      header: 'Customer',
      key: 'customerName',
      render: (o) => <span className="text-sm text-ink">{o.customerName}</span>,
    },
    {
      header: 'Items',
      key: 'items',
      render: (o) => <span className="text-xs text-slate">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</span>,
    },
    {
      header: 'Total',
      key: 'total',
      align: 'right',
      render: (o) => <span className="font-semibold tabular text-sm">{formatCurrency(o.total, currencySymbol)}</span>,
    },
    {
      header: 'Paid',
      key: 'amountPaid',
      align: 'right',
      render: (o) => <span className="text-xs tabular text-slate">{formatCurrency(o.amountPaid, currencySymbol)}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      render: (o) => <Badge tone={statusTone[o.status]}>{o.status.replace('-', ' ')}</Badge>,
    },
    {
      header: '',
      key: 'actions',
      align: 'right',
      render: (o) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setDetailOpen(o)}
            className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-paper text-slate hover:text-ink"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleting(o)}
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
        title="Sales Orders"
        description="Track all incoming orders, payments, and fulfillment status."
        action={<Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-3.5 w-3.5" /> New order</Button>}
      />

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by order # or customer…" />
          <Select className="w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}>
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partially-paid">Partially paid</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <span className="ml-auto text-xs text-slate">{filtered.length} orders</span>
        </Toolbar>
        <DataTable columns={columns} data={filtered} rowKey={(o) => o.id} pageSize={8} emptyLabel="No orders found" />
      </Card>

      <OrderFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <OrderDetailModal order={detailOpen} onClose={() => setDetailOpen(null)} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete order"
        description={`Remove ${deleting?.orderNo}? This cannot be undone.`}
        onConfirm={() => {
          if (deleting) {
            removeOrder(deleting.id);
            push('Order deleted.', 'info');
          }
        }}
      />
    </div>
  );
}
