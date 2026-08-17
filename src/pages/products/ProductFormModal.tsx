import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Label, FieldGroup } from '@/components/ui/Field';
import { useProductStore } from '@/store/useProductStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { useToastStore } from '@/store/useToastStore';
import { newId } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

const emptyVariant = (): ProductVariant => ({ id: newId(), size: '', color: '', sku: '', stock: 0, reorderLevel: 3 });

export function ProductFormModal({ open, onClose, product }: Props) {
  const { add, update } = useProductStore();
  const categories = useCategoryStore((s) => s.categories);
  const warehouses = useWarehouseStore((s) => s.warehouses);
  const push = useToastStore((s) => s.push);

  const [form, setForm] = useState({
    name: '', sku: '', categoryId: categories[0]?.id ?? '', brand: '', unit: 'pcs',
    costPrice: 0, sellPrice: 0, stock: 0, reorderLevel: 5, warehouseId: warehouses[0]?.id ?? '',
    hasVariants: false, status: 'active' as Product['status'],
  });
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name, sku: product.sku, categoryId: product.categoryId, brand: product.brand ?? '',
        unit: product.unit, costPrice: product.costPrice, sellPrice: product.sellPrice, stock: product.stock,
        reorderLevel: product.reorderLevel, warehouseId: product.warehouseId, hasVariants: product.hasVariants,
        status: product.status,
      });
      setVariants(product.variants);
    } else {
      setForm({
        name: '', sku: '', categoryId: categories[0]?.id ?? '', brand: '', unit: 'pcs',
        costPrice: 0, sellPrice: 0, stock: 0, reorderLevel: 5, warehouseId: warehouses[0]?.id ?? '',
        hasVariants: false, status: 'active',
      });
      setVariants([]);
    }
  }, [product, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    if (!form.name.trim() || !form.sku.trim()) {
      push('Product name and SKU are required.', 'error');
      return;
    }
    const payload = {
      ...form,
      variants: form.hasVariants ? variants : [],
      stock: form.hasVariants ? variants.reduce((sum, v) => sum + v.stock, 0) : form.stock,
    };
    if (product) {
      update(product.id, payload);
      push('Product updated successfully.');
    } else {
      add(payload);
      push('Product added to catalog.');
    }
    onClose();
  };

  const addVariant = () => setVariants((v) => [...v, emptyVariant()]);
  const removeVariant = (id: string) => setVariants((v) => v.filter((x) => x.id !== id));
  const patchVariant = (id: string, patch: Partial<ProductVariant>) =>
    setVariants((v) => v.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? 'Edit product' : 'Add new product'}
      subtitle="Works for general merchandise or footwear with sizes"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit}>{product ? 'Save changes' : 'Add product'}</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup className="col-span-2">
          <Label required>Product name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Basmati Rice 5kg" />
        </FieldGroup>

        <FieldGroup>
          <Label required>Base SKU</Label>
          <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. GRO-0001" />
        </FieldGroup>
        <FieldGroup>
          <Label>Brand</Label>
          <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Optional" />
        </FieldGroup>

        <FieldGroup>
          <Label required>Category</Label>
          <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label required>Warehouse</Label>
          <Select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label>Unit</Label>
          <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="pcs, pair, box…" />
        </FieldGroup>
        <FieldGroup>
          <Label>Status</Label>
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product['status'] })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label required>Cost price</Label>
          <Input type="number" min={0} step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
        </FieldGroup>
        <FieldGroup>
          <Label required>Sell price</Label>
          <Input type="number" min={0} step="0.01" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) })} />
        </FieldGroup>

        <div className="col-span-2 flex items-center gap-2 pt-1">
          <input
            id="hasVariants"
            type="checkbox"
            checked={form.hasVariants}
            onChange={(e) => setForm({ ...form, hasVariants: e.target.checked })}
            className="h-4 w-4 rounded accent-navy-900"
          />
          <label htmlFor="hasVariants" className="text-xs font-medium text-ink">
            This product has size / color variants (e.g. shoes)
          </label>
        </div>

        {!form.hasVariants ? (
          <>
            <FieldGroup>
              <Label required>Stock quantity</Label>
              <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </FieldGroup>
            <FieldGroup>
              <Label required>Reorder level</Label>
              <Input type="number" min={0} value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
            </FieldGroup>
          </>
        ) : (
          <div className="col-span-2 border border-line rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-ink">Variants</p>
              <Button variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-3.5 w-3.5" /> Add variant
              </Button>
            </div>
            <div className="space-y-2">
              {variants.length === 0 && <p className="text-xs text-slate py-3 text-center">No variants yet — add a size or color.</p>}
              {variants.map((v) => (
                <div key={v.id} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    className="col-span-3"
                    placeholder="Size (UK 9)"
                    value={v.size}
                    onChange={(e) => patchVariant(v.id, { size: e.target.value })}
                  />
                  <Input
                    className="col-span-2"
                    placeholder="Color"
                    value={v.color}
                    onChange={(e) => patchVariant(v.id, { color: e.target.value })}
                  />
                  <Input
                    className="col-span-3"
                    placeholder="Variant SKU"
                    value={v.sku}
                    onChange={(e) => patchVariant(v.id, { sku: e.target.value })}
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    min={0}
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) => patchVariant(v.id, { stock: Number(e.target.value) })}
                  />
                  <Input
                    className="col-span-1"
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={v.reorderLevel}
                    onChange={(e) => patchVariant(v.id, { reorderLevel: Number(e.target.value) })}
                  />
                  <button onClick={() => removeVariant(v.id)} className="col-span-1 h-9 flex items-center justify-center text-danger hover:bg-danger/5 rounded-sm">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
