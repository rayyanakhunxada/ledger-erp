import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StockMovement, StockMovementType } from '@/types';
import { newId, nowISO } from '@/lib/utils';
import { useProductStore } from './useProductStore';

interface RecordMovementInput {
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  reason: string;
  reference?: string;
}

interface StockMovementState {
  movements: StockMovement[];
  record: (input: RecordMovementInput) => void;
}

export const useStockMovementStore = create<StockMovementState>()(
  persist(
    (set) => ({
      movements: [],
      record: (input) => {
        const ts = nowISO();
        const movement: StockMovement = { ...input, id: newId(), createdAt: ts, updatedAt: ts };
        set((s) => ({ movements: [movement, ...s.movements] }));

        const { adjustStock } = useProductStore.getState();
        if (input.type === 'in' || input.type === 'adjustment') {
          adjustStock(input.productId, input.type === 'in' ? input.quantity : input.quantity);
        } else if (input.type === 'out') {
          adjustStock(input.productId, -Math.abs(input.quantity));
        } else if (input.type === 'transfer') {
          // Transfers are recorded for audit trail; warehouseId reassignment is handled by caller.
        }
      },
    }),
    { name: 'erp:stock-movements' }
  )
);
