import { useState, useMemo } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Label, FieldGroup } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { useOrderStore } from '@/store/useOrderStore';
import { useProductStore } from '@/store/useProductStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';
import { formatCurrency } from '@/lib/utils';
import type { OrderItem } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateOrderModal({ open, onClose }: Props) {
  const { create } = useOrderStore();
  const products = useProductStore((s) => s.products);
  const customers = useCustomerStore((s) => s.customers);
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);
  const push = useToastStore((s) => s.push);

  const [customer, setCustomer] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank-transfer' | 'credit'>('cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');

  const subtotal = useMemo(() => cart.reduce((sum, it) => sum + it.price * it.quantity, 0), [cart]);
  const tax = useMemo(() => subtotal * 0.05, [subtotal]);
  const total = subtotal - discount + tax;

  const activeProduct = products.find((p) => p.id === selectedProduct);
  const variants = activeProduct?.variants ?? [];

  const handleAddToCart = () => {
    if (!selectedProduct) {
      push('Select a product.', 'error');
      return;
    }
    const prod = products.find((p) => p.id === selectedProduct);
    if (!prod) return;

    let variantLabel = '';
    if (prod.hasVariants && !selectedVariant) {
      push('Select a variant (size/color).', 'error');
      return;
    }
    if (selectedVariant) {
      const v = variants.find((x) => x.id === selectedVariant);
      variantLabel = v ? (v.size ? ` (${v.size}` + (v.color ? `, ${v.color}` : '') + ')' : '') : '';
    }

    const item: OrderItem = {
      productId: selectedVariant || prod.id,
      productName: prod.name + variantLabel,
      sku: selectedVariant ? variants.find((v) => v.id === selectedVariant)?.sku || prod.sku : prod.sku,
      quantity: selectedQuantity,
      price: prod.sellPrice,
      variantLabel,
    };

    setCart((c) => [...c, item]);
    setSelectedProduct('');
    setSelectedVariant('');
    setSelectedQuantity(1);
    push('Added to cart.');
  };

  const handleSubmit = () => {
    if (!customer) {
      push('Select a customer.', 'error');
      return;
    }
    if (cart.length === 0) {
      push('Add items to the cart.', 'error');
      return;
    }

    const cust = customers.find((c) => c.id === customer);
    create({
      customerId: customer !== 'walk-in' ? customer : undefined,
      customerName: cust?.name ?? 'Walk-in Customer',
      items: cart,
      discount,
      tax,
      amountPaid: Math.min(amountPaid, total),
      status: amountPaid >= total ? 'paid' : amountPaid > 0 ? 'partially-paid' : 'pending',
      paymentMethod,
      channel: 'in-store',
    });

    push('Order created successfully.', 'success');
    setCart([]);
    setCustomer('');
    setDiscount(0);
    setAmountPaid(0);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create new order"
      subtitle="Add items, set payment, and complete the sale"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit}>Complete order</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup className="col-span-2">
          <Label required>Customer</Label>
          <Select value={customer} onChange={(e) => setCustomer(e.target.value)}>
            <option value="">— Select customer —</option>
            <option value="walk-in">Walk-in customer</option>
            {customers.filter((c) => c.type !== 'walk-in').map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </FieldGroup>

        <div className="col-span-2 border border-line rounded-md p-4 space-y-3">
          <p className="text-xs font-semibold text-ink">Add items</p>
          <FieldGroup>
            <Label>Product</Label>
            <Select value={selectedProduct} onChange={(e) => { setSelectedProduct(e.target.value); setSelectedVariant(''); }}>
              <option value="">— Select —</option>
              {products.filter((p) => p.status === 'active').map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.sellPrice, currencySymbol)})</option>
              ))}
            </Select>
          </FieldGroup>

          {activeProduct?.hasVariants && variants.length > 0 && (
            <FieldGroup>
              <Label>Variant</Label>
              <Select value={selectedVariant} onChange={(e) => setSelectedVariant(e.target.value)}>
                <option value="">— All sizes —</option>
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>{v.size}{v.color ? ` · ${v.color}` : ''} ({v.stock} left)</option>
                ))}
              </Select>
            </FieldGroup>
          )}

          <div className="flex items-end gap-2">
            <FieldGroup className="flex-1">
              <Label>Qty</Label>
              <Input
                type="number"
                min={1}
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
              />
            </FieldGroup>
            <Button variant="secondary" size="md" onClick={handleAddToCart}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>

        <div className="col-span-2 border border-line rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-xs text-slate text-center py-4">No items yet</p>
          ) : (
            cart.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 bg-paper rounded-sm">
                <span className="text-xs font-medium text-ink truncate flex-1">{item.productName}</span>
                <span className="text-xs text-slate tabular mx-2">{item.quantity}x {formatCurrency(item.price, currencySymbol)}</span>
                <button onClick={() => setCart((c) => c.filter((_, j) => j !== i))} className="text-slate hover:text-danger">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>

        <FieldGroup>
          <Label>Discount</Label>
          <Input type="number" min={0} step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        </FieldGroup>
        <div className="text-right">
          <p className="text-xs text-slate">Subtotal</p>
          <p className="font-semibold text-sm">{formatCurrency(subtotal, currencySymbol)}</p>
        </div>

        <FieldGroup>
          <Label>Payment method</Label>
          <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank-transfer">Bank transfer</option>
            <option value="credit">Credit</option>
          </Select>
        </FieldGroup>
        <div className="text-right">
          <p className="text-xs text-slate">Tax (5%)</p>
          <p className="font-semibold text-sm">{formatCurrency(tax, currencySymbol)}</p>
        </div>

        <FieldGroup className="col-span-2">
          <Label>Amount paid</Label>
          <Input type="number" min={0} step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} />
        </FieldGroup>

        <div className="col-span-2 bg-navy-50 rounded-sm p-3 flex items-center justify-between">
          <span className="text-xs font-medium text-navy-900">Total</span>
          <span className="font-display font-semibold text-lg text-navy-900 tabular">{formatCurrency(total, currencySymbol)}</span>
        </div>
      </div>
    </Modal>
  );
}
