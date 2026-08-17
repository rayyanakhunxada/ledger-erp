import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldGroup } from '@/components/ui/Field';
import { usePurchaseOrderStore } from '@/store/usePurchaseOrderStore';
import { useToastStore } from '@/store/useToastStore';
import { formatCurrency } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { PurchaseOrder } from '@/types';

interface Props { open: boolean; onClose: () => void; po: PurchaseOrder; }

export function ReceiveItemsModal({ open, onClose, po }: Props) {
  const { receiveItems } = usePurchaseOrderStore();
  const push = useToastStore((s) => s.push);
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);

  const [receipts, setReceipts] = useState<Record<string, number>>(
    po.items.reduce((acc, item) => ({ ...acc, [item.productId]: 0 }), {})
  );

  const handleSubmit = () => {
    const toReceive = Object.entries(receipts).filter(([, qty]) => qty > 0);
    if (!toReceive.length) { push('Specify at least one quantity to receive.', 'error'); return; }
    receiveItems(po.id, receipts);
    push('Items received and stock updated.');
    onClose();
  };

  const totalReceived = Object.values(receipts).reduce((sum, qty) => sum + qty, 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Receive items from ${po.poNo}`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit}>Confirm receipt</Button>
        </>
      }
    >
      <div className="space-y-3 mb-4">
        {po.items.map((item) => (
          <FieldGroup key={item.productId}>
            <Label>
              {item.productName} ({item.quantity} ordered, {item.received} received)
            </Label>
            <div className="flex items-center gap-2">
              <Input type="number" min={0} max={item.quantity - item.received} value={receipts[item.productId] ?? 0} onChange={(e) => setReceipts({ ...receipts, [item.productId]: Math.max(0, Number(e.target.value)) })} placeholder="Qty to receive now" />
              <span className="text-xs font-mono text-slate w-20 text-right">{formatCurrency(item.costPrice * (receipts[item.productId] ?? 0), currencySymbol)}</span>
            </div>
          </FieldGroup>
        ))}
      </div>
      <div className="bg-paper border border-line rounded-md p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate">Total items to receive:</span>
          <span className="font-semibold text-ink tabular">{totalReceived}</span>
        </div>
      </div>
    </Modal>
  );
}
