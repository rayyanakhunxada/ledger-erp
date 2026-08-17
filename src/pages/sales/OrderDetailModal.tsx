import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order } from '@/types';

interface Props {
  order: Order | null;
  onClose: () => void;
}

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'amber'> = {
  paid: 'success',
  pending: 'warning',
  'partially-paid': 'warning',
  cancelled: 'danger',
};

export function OrderDetailModal({ order, onClose }: Props) {
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);

  if (!order) return null;

  const outstanding = order.total - order.amountPaid;

  return (
    <Modal
      open={!!order}
      onClose={onClose}
      title={order.orderNo}
      subtitle={`${order.customerName} · ${formatDate(order.createdAt)}`}
      size="md"
      footer={<Button size="sm" onClick={onClose}>Close</Button>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate">Customer</p>
            <p className="text-sm text-ink">{order.customerName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate">Status</p>
            <Badge tone={statusTone[order.status] ?? 'neutral'} className="mt-1">{order.status.replace('-', ' ')}</Badge>
          </div>
          <div>
            <p className="text-xs font-medium text-slate">Payment method</p>
            <p className="text-sm text-ink capitalize">{order.paymentMethod.replace('-', ' ')}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate">Channel</p>
            <p className="text-sm text-ink capitalize">{order.channel.replace('-', ' ')}</p>
          </div>
        </div>

        <div className="border-t border-line pt-4">
          <p className="text-xs font-semibold text-slate mb-3 uppercase tracking-wide">Line items</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-paper rounded-sm">
                <div>
                  <p className="text-sm font-medium text-ink">{item.productName}</p>
                  <p className="text-[11px] text-slate font-mono">{item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate">{item.quantity} × {formatCurrency(item.price, currencySymbol)}</p>
                  <p className="text-sm font-semibold tabular">{formatCurrency(item.price * item.quantity, currencySymbol)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-paper rounded-md border border-line p-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-slate">Subtotal</span><span className="font-mono">{formatCurrency(order.subtotal, currencySymbol)}</span></div>
          {order.discount > 0 && <div className="flex justify-between"><span className="text-slate">Discount</span><span className="font-mono">-{formatCurrency(order.discount, currencySymbol)}</span></div>}
          <div className="flex justify-between"><span className="text-slate">Tax</span><span className="font-mono">{formatCurrency(order.tax, currencySymbol)}</span></div>
          <div className="border-t border-line pt-1.5 flex justify-between font-semibold"><span>Total</span><span className="font-mono text-base">{formatCurrency(order.total, currencySymbol)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-slate">Amount paid</span><span className="font-mono">{formatCurrency(order.amountPaid, currencySymbol)}</span></div>
          {outstanding > 0 && <div className="flex justify-between text-xs text-danger"><span>Outstanding</span><span className="font-mono">{formatCurrency(outstanding, currencySymbol)}</span></div>}
        </div>
      </div>
    </Modal>
  );
}
