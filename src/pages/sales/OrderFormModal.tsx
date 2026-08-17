import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Label, FieldGroup } from '@/components/ui/Field';
import { useOrderStore } from '@/store/useOrderStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useProductStore } from '@/store/useProductStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';
import { formatCurrency } from '@/lib/utils';
import type { OrderItem, OrderStatus } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function OrderFormModal({ open, onClose }: Props) {
  const { create } = useOrderStore();
  const customers = useCustomerStore((s) => s.customers);
  const products = useProductStore((s) => s.products);
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);
  const taxRate = useSettingsStore((s) => s.settings.taxRate);
  const push = useToastStore((s) => s.push);

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank-transfer' | 'credit'>('cash');
  const [channel, setChannel] = useState<'in-store' | 'online' | 'phone'>('in-store');
  const [status, setStatus] = useState<OrderStatus>('paid');
  const [amountPaid, setAmountPaid] = useState(0);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = subtotal - discount + tax;

  const addItem = () => {
    const p = products.find((x) => x.status === 'active');
    if (!p) {
      push('No active products available.', 'error');
      return;
    }
    setItems([...items, { productId: p.id, productName: p.name, sku: p.sku, quantity: 1, price: p.sellPrice }]);
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const patchItem = (idx: number, patch: Partial<OrderItem>) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], ...patch };
    setItems(updated);
  };

  const handleSubmit = () => {
    if (!customerName.trim()) {
      push('Customer name is required.', 'error');
      return;
    }
    if (items.length === 0) {
      push('Add at least one item.', 'error');
      return;
    }
    if (amountPaid > total) {
      push('Amount paid cannot exceed total.', 'error');
      return;
    }

    create({
      customerId: customerId || undefined,
      customerName,
      items,
      discount,
      tax,
      amountPaid,
      status,
      paymentMethod,
      channel,
    });

    setCustomerId('');
    setCustomerName('');
    setItems([]);
    setDiscount(0);
    setStatus('paid');
    setAmountPaid(0);
    push('Order created successfully.');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create new order"
      subtitle="Record a sale and manage stock automatically"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit}>Create order</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup>
            <Label>Select customer</Label>
            <Select value={customerId} onChange={(e) => { setCustomerId(e.target.value); const c = customers.find((x) => x.id === e.target.value); if (c) setCustomerName(c.name); }}>
              <option value="">—</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label required>Or enter name</Label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" />
          </FieldGroup>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Order items</Label>
            <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3.5 w-3.5" /> Add item</Button>
          </div>
          <div className="border border-line rounded-md overflow-hidden">
            {items.length === 0 ? (
              <p className="text-xs text-slate px-4 py-6 text-center">No items yet.</p>
            ) : (
              <div className="space-y-2 p-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <Select value={item.productId} onChange={(e) => { const p = products.find((x) => x.id === e.target.value); if (p) patchItem(idx, { productId: p.id, productName: p.name, sku: p.sku, price: p.sellPrice }); }} className="flex-1 col-span-3">
                      <option value="">Select product</option>
                      {products.filter((p) => p.status === 'active').map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </Select>
                    <Input type="number" min={1} value={item.quantity} onChange={(e) => patchItem(idx, { quantity: Math.max(1, Number(e.target.value)) })} className="w-20" placeholder="Qty" />
                    <Input type="number" min={0} step="0.01" value={item.price} onChange={(e) => patchItem(idx, { price: Number(e.target.value) })} className="w-24" placeholder="Price" />
                    <span className="text-xs font-medium text-ink whitespace-nowrap">{formatCurrency(item.price * item.quantity, currencySymbol)}</span>
                    <button onClick={() => removeItem(idx)} className="h-8 w-8 flex items-center justify-center rounded-sm hover:bg-danger/5 text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FieldGroup>
            <Label>Discount</Label>
            <Input type="number" min={0} step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
          </FieldGroup>
          <FieldGroup>
            <Label>Payment method</Label>
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'bank-transfer' | 'credit')}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank-transfer">Bank transfer</option>
              <option value="credit">Credit</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Channel</Label>
            <Select value={channel} onChange={(e) => setChannel(e.target.value as 'in-store' | 'online' | 'phone')}>
              <option value="in-store">In-store</option>
              <option value="online">Online</option>
              <option value="phone">Phone</option>
            </Select>
          </FieldGroup>
        </div>

        <div className="bg-paper rounded-md border border-line p-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate">Subtotal</span><span className="font-mono">{formatCurrency(subtotal, currencySymbol)}</span></div>
            <div className="flex justify-between"><span className="text-slate">Discount</span><span className="font-mono">-{formatCurrency(discount, currencySymbol)}</span></div>
            <div className="flex justify-between"><span className="text-slate">Tax ({taxRate}%)</span><span className="font-mono">{formatCurrency(tax, currencySymbol)}</span></div>
            <div className="border-t border-line pt-1.5 flex justify-between"><span className="font-semibold">Total</span><span className="font-semibold font-mono text-lg">{formatCurrency(total, currencySymbol)}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup>
            <Label required>Amount paid</Label>
            <Input type="number" min={0} step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} />
          </FieldGroup>
          <FieldGroup>
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partially-paid">Partially paid</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </FieldGroup>
        </div>
      </div>
    </Modal>
  );
}
