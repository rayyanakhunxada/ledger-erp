import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '@/types';
import { newId, nowISO, generateCode } from '@/lib/utils';
import { useSupplierStore } from './useSupplierStore';
import { useStockMovementStore } from './useStockMovementStore';

interface NewPOInput {
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  warehouseId: string;
  expectedDate?: string;
}

interface PurchaseOrderState {
  purchaseOrders: PurchaseOrder[];
  create: (input: NewPOInput) => void;
  setStatus: (id: string, status: PurchaseOrderStatus) => void;
  receiveItems: (id: string, receipts: Record<string, number>) => void;
  remove: (id: string) => void;
}

const now = nowISO();

const seed: PurchaseOrder[] = [
  {
    id: 'po1', poNo: 'PO-0001', supplierId: 's2', supplierName: 'Nike Regional Distributor',
    items: [{ productId: 'p5', productName: 'Air Max Running Sneaker', sku: 'SNK-0001', quantity: 20, costPrice: 45, received: 15 }],
    total: 900, status: 'partially-received', warehouseId: 'wh-shoe', expectedDate: now, createdAt: now, updatedAt: now,
  },
  {
    id: 'po2', poNo: 'PO-0002', supplierId: 's1', supplierName: 'Falak Foods Distribution',
    items: [{ productId: 'p1', productName: 'Basmati Rice 5kg', sku: 'GRO-0001', quantity: 50, costPrice: 9.5, received: 50 }],
    total: 475, status: 'received', warehouseId: 'wh-main', expectedDate: now, createdAt: now, updatedAt: now,
  },
  {
    id: 'po3', poNo: 'PO-0003', supplierId: 's3', supplierName: 'Bata Pakistan Wholesale',
    items: [{ productId: 'p7', productName: 'Kids Velcro Trainer', sku: 'KID-0001', quantity: 30, costPrice: 8, received: 0 }],
    total: 240, status: 'ordered', warehouseId: 'wh-shoe', expectedDate: now, createdAt: now, updatedAt: now,
  },
];

export const usePurchaseOrderStore = create<PurchaseOrderState>()(
  persist(
    (set, get) => ({
      purchaseOrders: seed,
      create: (input) => {
        const seq = get().purchaseOrders.length + 1;
        const total = input.items.reduce((sum, it) => sum + it.costPrice * it.quantity, 0);
        const po: PurchaseOrder = {
          id: newId(),
          poNo: generateCode('PO', seq),
          supplierId: input.supplierId,
          supplierName: input.supplierName,
          items: input.items.map((it) => ({ ...it, received: 0 })),
          total,
          status: 'ordered',
          warehouseId: input.warehouseId,
          expectedDate: input.expectedDate,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ purchaseOrders: [po, ...s.purchaseOrders] }));
        useSupplierStore.getState().incrementOrders(input.supplierId);
      },
      setStatus: (id, status) =>
        set((s) => ({
          purchaseOrders: s.purchaseOrders.map((p) => (p.id === id ? { ...p, status, updatedAt: nowISO() } : p)),
        })),
      receiveItems: (id, receipts) => {
        const po = get().purchaseOrders.find((p) => p.id === id);
        if (!po) return;
        const { record } = useStockMovementStore.getState();
        const updatedItems = po.items.map((item) => {
          const qty = receipts[item.productId] ?? 0;
          if (qty > 0) {
            record({
              productId: item.productId,
              productName: item.productName,
              type: 'in',
              quantity: qty,
              toWarehouseId: po.warehouseId,
              reason: 'Purchase order received',
              reference: po.poNo,
            });
          }
          return { ...item, received: Math.min(item.quantity, item.received + qty) };
        });
        const allReceived = updatedItems.every((it) => it.received >= it.quantity);
        const someReceived = updatedItems.some((it) => it.received > 0);
        const status: PurchaseOrderStatus = allReceived ? 'received' : someReceived ? 'partially-received' : po.status;
        set((s) => ({
          purchaseOrders: s.purchaseOrders.map((p) =>
            p.id === id ? { ...p, items: updatedItems, status, updatedAt: nowISO() } : p
          ),
        }));
      },
      remove: (id) => set((s) => ({ purchaseOrders: s.purchaseOrders.filter((p) => p.id !== id) })),
    }),
    { name: 'erp:purchase-orders' }
  )
);
