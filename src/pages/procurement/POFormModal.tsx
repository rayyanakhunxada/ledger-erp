import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Label, FieldGroup } from '@/components/ui/Field';
import { usePurchaseOrderStore } from '@/store/usePurchaseOrderStore';
import { useSupplierStore } from '@/store/useSupplierStore';
import { useProductStore } from '@/store/useProductStore';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { useToastStore } from '@/store/useToastStore';
import type { PurchaseOrderItem } from '@/types';

interface Props { open: boolean; onClose: () => void; }

export function POFormModal({ open, onClose }: Props) {
  const { create } = usePurchaseOrderStore();
  const suppliers = useSupplierStore((s) => s.suppliers);
  const products = useProductStore((s) => s.products);
  const warehouses = useWarehouseStore((s) => s.warehouses);
  const push = useToastStore((s) => s.push);

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '');
  const [warehouseId, setWarehouseId] = useState(warehouses.find((w) => w.isDefault)?.id ?? warehouses[0]?.id ?? '');
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);

  const handleAddItem = () => {
    const p = products[0];
    if (!p) { push('No products available.', 'error'); return; }
    setItems([...items, { productId: p.id, productName: p.name, sku: p.sku, quantity: 10, costPrice: p.costPrice, received: 0 }]);
  };

  const handleSubmit = () => {
    if (!items.length) { push('Add at least one item.', 'error'); return; }
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) { push('Supplier not found.', 'error'); return; }
    create({ supplierId, supplierName: supplier.name, items, warehouseId });
    push('Purchase order created.');
    onClose();
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create purchase order"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit}>Create PO</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        <FieldGroup><Label required>Supplier</Label><Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>{suppliers.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}</Select></FieldGroup>
        <FieldGroup><Label required>Destination warehouse</Label><Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>{warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}</Select></FieldGroup>
      </div>

      <div className="mb-4 border border-line rounded-md overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-line bg-paper">
          <p className="text-xs font-semibold text-ink">Items to order</p>
          <Button variant="outline" size="sm" onClick={handleAddItem}><Plus className="h-3.5 w-3.5" /> Add item</Button>
        </div>
        {items.length === 0 ? (
          <p className="text-xs text-slate py-6 text-center">No items yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center px-4 py-2.5">
                <Select className="col-span-4" value={item.productId} onChange={(e) => { const p = products.find((x) => x.id === e.target.value); if (p) { const ni = [...items]; ni[i] = { ...item, productId: p.id, productName: p.name, sku: p.sku, costPrice: p.costPrice }; setItems(ni); } }}>{products.filter((p) => p.status === 'active').map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}</Select>
                <Input className="col-span-3" type="number" min={1} value={item.quantity} onChange={(e) => { const ni = [...items]; ni[i] = { ...item, quantity: Math.max(1, Number(e.target.value)) }; setItems(ni); }} />
                <Input className="col-span-3" type="number" step="0.01" value={item.costPrice} onChange={(e) => { const ni = [...items]; ni[i] = { ...item, costPrice: Number(e.target.value) }; setItems(ni); }} />
                <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="col-span-2 flex justify-end text-danger hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
