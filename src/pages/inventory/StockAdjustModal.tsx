import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Label, FieldGroup, Textarea } from '@/components/ui/Field';
import { useStockMovementStore } from '@/store/useStockMovementStore';
import { useToastStore } from '@/store/useToastStore';
import type { Product, StockMovementType } from '@/types';

export function StockAdjustModal({ open, onClose, product }: { open: boolean; onClose: () => void; product: Product | null }) {
  const record = useStockMovementStore((s) => s.record);
  const push = useToastStore((s) => s.push);
  const [type, setType] = useState<StockMovementType>('in');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  if (!product) return null;

  const handleSubmit = () => {
    if (quantity <= 0) { push('Quantity must be greater than zero.', 'error'); return; }
    record({
      productId: product.id,
      productName: product.name,
      type,
      quantity,
      reason: reason.trim() || (type === 'in' ? 'Manual stock in' : type === 'out' ? 'Manual stock out' : 'Manual adjustment'),
    });
    push(`Stock ${type === 'in' ? 'added' : type === 'out' ? 'removed' : 'adjusted'} for ${product.name}.`);
    setQuantity(1);
    setReason('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Adjust stock — ${product.name}`}
      subtitle={`Current stock: ${product.stock} ${product.unit}`}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit}>Record movement</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FieldGroup>
          <Label required>Movement type</Label>
          <Select value={type} onChange={(e) => setType(e.target.value as StockMovementType)}>
            <option value="in">Stock in (received / restocked)</option>
            <option value="out">Stock out (damaged / lost / used)</option>
            <option value="adjustment">Adjustment (correction)</option>
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label required>Quantity</Label>
          <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        </FieldGroup>
        <FieldGroup>
          <Label>Reason / note</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional note for the audit trail" />
        </FieldGroup>
      </div>
    </Modal>
  );
}
