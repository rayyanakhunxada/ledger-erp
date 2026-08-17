import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderItem, OrderStatus } from '@/types';
import { newId, nowISO, generateCode } from '@/lib/utils';
import { useCustomerStore } from './useCustomerStore';
import { useStockMovementStore } from './useStockMovementStore';

interface NewOrderInput {
  customerId?: string;
  customerName: string;
  items: OrderItem[];
  discount: number;
  tax: number;
  amountPaid: number;
  status: OrderStatus;
  paymentMethod: Order['paymentMethod'];
  channel: Order['channel'];
}

interface OrderState {
  orders: Order[];
  create: (input: NewOrderInput) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
  remove: (id: string) => void;
}

const seedItems = (name: string, sku: string, qty: number, price: number): OrderItem[] => [
  { productId: 'seed', productName: name, sku, quantity: qty, price },
];

/** ISO timestamp for `daysAgo` days before now, used only to make seed data feel alive. */
const d = (daysAgo: number, hour = 12): string => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(hour, 0, 0, 0);
  return dt.toISOString();
};

const seed: Order[] = [
  { id: 'o1', orderNo: 'ORD-0001', customerId: 'c2', customerName: 'Hamza Retail Store', items: seedItems('Basmati Rice 5kg', 'GRO-0001', 10, 13.0), subtotal: 130, discount: 5, tax: 6.25, total: 131.25, amountPaid: 131.25, status: 'paid', paymentMethod: 'bank-transfer', channel: 'in-store', createdAt: d(13), updatedAt: d(13) },
  { id: 'o2', orderNo: 'ORD-0002', customerId: 'c3', customerName: 'Fatima Noor', items: seedItems('Face Cream 100ml', 'COS-0001', 2, 4.5), subtotal: 9, discount: 0, tax: 0.45, total: 9.45, amountPaid: 9.45, status: 'paid', paymentMethod: 'cash', channel: 'in-store', createdAt: d(12), updatedAt: d(12) },
  { id: 'o3', orderNo: 'ORD-0003', customerId: 'c4', customerName: 'Zain Sports Corner', items: seedItems('Air Max Running Sneaker (UK 8)', 'SNK-0001-8', 3, 79), subtotal: 237, discount: 10, tax: 11.35, total: 238.35, amountPaid: 150, status: 'partially-paid', paymentMethod: 'credit', channel: 'phone', createdAt: d(11), updatedAt: d(11) },
  { id: 'o4', orderNo: 'ORD-0004', customerId: 'c1', customerName: 'Walk-in Customer', items: seedItems('A4 Notebook 200pg', 'STA-0001', 5, 1.2), subtotal: 6, discount: 0, tax: 0.3, total: 6.3, amountPaid: 6.3, status: 'paid', paymentMethod: 'cash', channel: 'in-store', createdAt: d(10), updatedAt: d(10) },
  { id: 'o5', orderNo: 'ORD-0005', customerId: 'c2', customerName: 'Hamza Retail Store', items: seedItems('Cooking Oil 1L', 'GRO-0002', 24, 3.6), subtotal: 86.4, discount: 4, tax: 4.1, total: 86.5, amountPaid: 86.5, status: 'paid', paymentMethod: 'bank-transfer', channel: 'in-store', createdAt: d(9), updatedAt: d(9) },
  { id: 'o6', orderNo: 'ORD-0006', customerId: 'c1', customerName: 'Walk-in Customer', items: seedItems('Foam Slide Sandal', 'SAN-0001', 2, 9), subtotal: 18, discount: 0, tax: 0.9, total: 18.9, amountPaid: 18.9, status: 'paid', paymentMethod: 'cash', channel: 'in-store', createdAt: d(9), updatedAt: d(9) },
  { id: 'o7', orderNo: 'ORD-0007', customerId: 'c3', customerName: 'Fatima Noor', items: seedItems('Kids Velcro Trainer', 'KID-0001', 1, 15), subtotal: 15, discount: 0, tax: 0.75, total: 15.75, amountPaid: 15.75, status: 'paid', paymentMethod: 'card', channel: 'in-store', createdAt: d(8), updatedAt: d(8) },
  { id: 'o8', orderNo: 'ORD-0008', customerId: 'c4', customerName: 'Zain Sports Corner', items: seedItems('Classic Oxford Formal Shoe (UK 9)', 'FRM-0001-9', 4, 65), subtotal: 260, discount: 15, tax: 12.25, total: 257.25, amountPaid: 257.25, status: 'paid', paymentMethod: 'bank-transfer', channel: 'phone', createdAt: d(7), updatedAt: d(7) },
  { id: 'o9', orderNo: 'ORD-0009', customerId: 'c1', customerName: 'Walk-in Customer', items: seedItems('Basmati Rice 5kg', 'GRO-0001', 4, 13.0), subtotal: 52, discount: 0, tax: 2.6, total: 54.6, amountPaid: 54.6, status: 'paid', paymentMethod: 'cash', channel: 'in-store', createdAt: d(6), updatedAt: d(6) },
  { id: 'o10', orderNo: 'ORD-0010', customerId: 'c3', customerName: 'Fatima Noor', items: seedItems('Face Cream 100ml', 'COS-0001', 3, 4.5), subtotal: 13.5, discount: 0, tax: 0.68, total: 14.18, amountPaid: 14.18, status: 'paid', paymentMethod: 'cash', channel: 'online', createdAt: d(5), updatedAt: d(5) },
  { id: 'o11', orderNo: 'ORD-0011', customerId: 'c2', customerName: 'Hamza Retail Store', items: seedItems('A4 Notebook 200pg', 'STA-0001', 60, 1.2), subtotal: 72, discount: 3, tax: 3.45, total: 72.45, amountPaid: 72.45, status: 'paid', paymentMethod: 'bank-transfer', channel: 'in-store', createdAt: d(4), updatedAt: d(4) },
  { id: 'o12', orderNo: 'ORD-0012', customerId: 'c4', customerName: 'Zain Sports Corner', items: seedItems('Air Max Running Sneaker (UK 9)', 'SNK-0001-9', 2, 79), subtotal: 158, discount: 8, tax: 7.5, total: 157.5, amountPaid: 100, status: 'partially-paid', paymentMethod: 'credit', channel: 'phone', createdAt: d(3), updatedAt: d(3) },
  { id: 'o13', orderNo: 'ORD-0013', customerId: 'c1', customerName: 'Walk-in Customer', items: seedItems('Dish Wash Liquid 500ml', 'HH-0001', 6, 1.8), subtotal: 10.8, discount: 0, tax: 0.54, total: 11.34, amountPaid: 11.34, status: 'paid', paymentMethod: 'cash', channel: 'in-store', createdAt: d(2), updatedAt: d(2) },
  { id: 'o14', orderNo: 'ORD-0014', customerId: 'c3', customerName: 'Fatima Noor', items: seedItems('Foam Slide Sandal', 'SAN-0001', 1, 9), subtotal: 9, discount: 0, tax: 0.45, total: 9.45, amountPaid: 9.45, status: 'cancelled', paymentMethod: 'cash', channel: 'in-store', createdAt: d(1), updatedAt: d(1) },
  { id: 'o15', orderNo: 'ORD-0015', customerId: 'c2', customerName: 'Hamza Retail Store', items: seedItems('Cooking Oil 1L', 'GRO-0002', 30, 3.6), subtotal: 108, discount: 5, tax: 5.15, total: 108.15, amountPaid: 108.15, status: 'paid', paymentMethod: 'bank-transfer', channel: 'in-store', createdAt: d(0), updatedAt: d(0) },
  { id: 'o16', orderNo: 'ORD-0016', customerId: 'c1', customerName: 'Walk-in Customer', items: seedItems('Kids Velcro Trainer', 'KID-0001', 2, 15), subtotal: 30, discount: 0, tax: 1.5, total: 31.5, amountPaid: 31.5, status: 'paid', paymentMethod: 'card', channel: 'in-store', createdAt: d(0, 9), updatedAt: d(0, 9) },
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: seed,
      create: (input) => {
        const seq = get().orders.length + 1;
        const subtotal = input.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
        const total = subtotal - input.discount + input.tax;
        const order: Order = {
          id: newId(),
          orderNo: generateCode('ORD', seq),
          customerId: input.customerId,
          customerName: input.customerName,
          items: input.items,
          subtotal,
          discount: input.discount,
          tax: input.tax,
          total,
          amountPaid: input.amountPaid,
          status: input.status,
          paymentMethod: input.paymentMethod,
          channel: input.channel,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ orders: [order, ...s.orders] }));

        // Side effects: deduct stock + record movement, credit customer totals
        const { record } = useStockMovementStore.getState();
        for (const item of input.items) {
          if (!item.productId || item.productId === 'seed') continue;
          record({
            productId: item.productId,
            productName: item.productName,
            type: 'out',
            quantity: item.quantity,
            reason: 'Sale',
            reference: order.orderNo,
          });
        }
        if (input.customerId && input.status !== 'cancelled') {
          useCustomerStore.getState().registerOrder(input.customerId, total);
        }
      },
      updateStatus: (id, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status, updatedAt: nowISO() } : o)) })),
      remove: (id) => set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
    }),
    { name: 'erp:orders' }
  )
);
