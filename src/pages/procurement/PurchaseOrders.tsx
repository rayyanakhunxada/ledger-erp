import { useMemo, useState } from 'react';
import { Plus, Eye, Trash2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toolbar, SearchInput } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { usePurchaseOrderStore } from '@/store/usePurchaseOrderStore';
import { useSupplierStore } from '@/store/useSupplierStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types';

const statusTone: Record<PurchaseOrderStatus, 'neutral' | 'warning' | 'success' | 'danger'> = {
  draft: 'neutral',
  ordered: 'warning',
  'partially-received': 'info',
  received: 'success',
  cancelled: 'danger',
};

export default function PurchaseOrders() {
  const purchaseOrders = usePurchaseOrderStore((s) => s.purchaseOrders);
  const removePO = usePurchaseOrderStore((s) => s.remove);
  const receiveItems = usePurchaseOrderStore((s) => s.receiveItems);
  const suppliers = useSupplierStore((s) => s.suppliers);
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);
  const push = useToastStore((s) => s.push);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'all'>('all');
  const [detailOpen, setDetailOpen] = useState<PurchaseOrder | null>(null);
  const [deleting, setDeleting] = useState<PurchaseOrder | null>(null);
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesSearch = po.poNo.toLowerCase().includes(search.toLowerCase()) || po.supplierName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, search, statusFilter]);

  const handleReceive = () => {
    if (!receivingId) return;
    receiveItems(receivingId, receipts);
    push('Items received and stock updated.');
    setReceivingId(null);
    setReceipts({});
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      header: 'PO Number',
      key: 'poNo',
      render: (po) => (
        <div>
          <p className="text-sm font-semibold text-ink">{po.poNo}</p>
          <p className="text-xs text-slate">{formatDate(po.createdAt)}</p>
        </div>
      ),
    },
    {
      header: 'Supplier',
      key: 'supplierName',
      render: (po) => <span className="text-sm text-ink">{po.supplierName}</span>,
    },
    {
      header: 'Items',
      key: 'items',
      render: (po) => <span className="text-xs text-slate">{po.items.length} item{po.items.length !== 1 ? 's' : ''}</span>,
    },
    {
      header: 'Total',
      key: 'total',
      align: 'right',
      render: (po) => <span className="font-semibold tabular text-sm">{formatCurrency(po.total, currencySymbol)}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      render: (po) => <Badge tone={statusTone[po.status]}>{po.status}</Badge>,
    },
    {
      header: '',
      key: 'actions',
      align: 'right',
      render: (po) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setDetailOpen(po)}
            className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-paper text-slate hover:text-ink"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {(po.status === 'ordered' || po.status === 'partially-received') && (
            <button
              onClick={() => { setReceivingId(po.id); setReceipts({}); }}
              className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-success/5 text-slate hover:text-success"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setDeleting(po)}
            className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-danger/5 text-slate hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const detail = detailOpen;

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Track inbound shipments and manage supplier deliveries."
      />

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by PO # or supplier…" />
          <Select className="w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | 'all')}>
            <option value="all">All statuses</option>
            <option value="ordered">Ordered</option>
            <option value="partially-received">Partially received</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <span className="ml-auto text-xs text-slate">{filtered.length} orders</span>
        </Toolbar>
        <DataTable columns={columns} data={filtered} rowKey={(po) => po.id} pageSize={8} emptyLabel="No purchase orders found" />
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetailOpen(null)}
        title={detail?.poNo}
        subtitle={`${detail?.supplierName} · ${detail ? formatDate(detail.createdAt) : ''}`}
        size="md"
      >
        {detail && (
          <div className="space-y-4">
            <div className="border-b border-line pb-3">
              {detail.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.productName}</p>
                    <p className="text-xs text-slate font-mono">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate">{item.quantity} units × {formatCurrency(item.costPrice, currencySymbol)}</p>
                    <p className="text-sm font-semibold tabular">{formatCurrency(item.quantity * item.costPrice, currencySymbol)}</p>
                    {item.received < item.quantity && <p className="text-xs text-warning">{item.quantity - item.received} pending</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-paper p-3 rounded-md">
              <p className="flex justify-between text-sm"><span className="font-semibold">Total:</span><span className="font-mono">{formatCurrency(detail.total, currencySymbol)}</span></p>
              <p className="flex justify-between text-xs text-slate mt-1"><span>Status:</span><Badge tone={statusTone[detail.status]}>{detail.status}</Badge></p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!receivingId}
        onClose={() => { setReceivingId(null); setReceipts({}); }}
        title="Receive items"
        subtitle="Record how many units have arrived"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => { setReceivingId(null); setReceipts({}); }}>Cancel</Button>
            <Button size="sm" onClick={handleReceive}>Confirm receipt</Button>
          </>
        }
      >
        {receivingId && (
          <div className="space-y-3">
            {purchaseOrders
              .find((po) => po.id === receivingId)
              ?.items.map((item) => (
                <div key={item.productId} className="border border-line rounded-md p-3">
                  <p className="text-sm font-medium text-ink mb-2">{item.productName}</p>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate min-w-fit">Received:</label>
                    <input
                      type="number"
                      min={0}
                      max={item.quantity - item.received}
                      value={receipts[item.productId] ?? 0}
                      onChange={(e) => setReceipts({ ...receipts, [item.productId]: Math.max(0, Number(e.target.value)) })}
                      className="flex-1 h-8 px-2 rounded-sm border border-line text-sm"
                    />
                    <span className="text-xs text-slate font-mono">of {item.quantity - item.received}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete PO"
        description={`Remove ${deleting?.poNo}? This cannot be undone.`}
        onConfirm={() => {
          if (deleting) {
            removePO(deleting.id);
            push('PO deleted.', 'info');
          }
        }}
      />
    </div>
  );
}
