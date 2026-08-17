// ---------- Shared ----------
export type ID = string;

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

// ---------- Auth ----------
export type Role = 'admin' | 'manager' | 'sales' | 'warehouse';

export interface AppUser {
  id: ID;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
}

// ---------- Catalog ----------
export interface Category {
  id: ID;
  name: string;
  businessType: 'general' | 'footwear' | 'other';
}

export interface ProductVariant {
  id: ID;
  size?: string;
  color?: string;
  sku: string;
  stock: number;
  reorderLevel: number;
}

export interface Product extends Timestamps {
  id: ID;
  name: string;
  sku: string;
  categoryId: ID;
  brand?: string;
  unit: string; // pcs, kg, pair, box...
  costPrice: number;
  sellPrice: number;
  stock: number; // aggregate stock for products w/o variants
  reorderLevel: number;
  warehouseId: ID;
  hasVariants: boolean;
  variants: ProductVariant[];
  status: 'active' | 'inactive';
  image?: string;
}

// ---------- Inventory / Warehouse ----------
export interface Warehouse {
  id: ID;
  name: string;
  location: string;
  isDefault: boolean;
}

export type StockMovementType = 'in' | 'out' | 'transfer' | 'adjustment';

export interface StockMovement extends Timestamps {
  id: ID;
  productId: ID;
  productName: string;
  type: StockMovementType;
  quantity: number;
  fromWarehouseId?: ID;
  toWarehouseId?: ID;
  reason: string;
  reference?: string;
}

// ---------- Sales / CRM ----------
export interface Customer extends Timestamps {
  id: ID;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: 'walk-in' | 'wholesale' | 'regular';
  totalSpent: number;
  totalOrders: number;
}

export type OrderStatus = 'pending' | 'paid' | 'partially-paid' | 'cancelled' | 'refunded';

export interface OrderItem {
  productId: ID;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  variantLabel?: string;
}

export interface Order extends Timestamps {
  id: ID;
  orderNo: string;
  customerId?: ID;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: OrderStatus;
  paymentMethod: 'cash' | 'card' | 'bank-transfer' | 'credit';
  channel: 'in-store' | 'online' | 'phone';
}

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface Lead extends Timestamps {
  id: ID;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  stage: LeadStage;
  value: number;
  source: string;
  owner: string;
  notes?: string;
}

// ---------- Procurement ----------
export interface Supplier extends Timestamps {
  id: ID;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  rating: number; // 1-5
  totalOrders: number;
}

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partially-received' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  productId: ID;
  productName: string;
  sku: string;
  quantity: number;
  costPrice: number;
  received: number;
}

export interface PurchaseOrder extends Timestamps {
  id: ID;
  poNo: string;
  supplierId: ID;
  supplierName: string;
  items: PurchaseOrderItem[];
  total: number;
  status: PurchaseOrderStatus;
  expectedDate?: string;
  warehouseId: ID;
}

// ---------- Settings ----------
export interface StoreSettings {
  storeName: string;
  businessType: 'General Store' | 'Footwear' | 'Mixed Retail';
  currencySymbol: string;
  address?: string;
  phone?: string;
  taxRate: number; // percentage
  lowStockThreshold: number;
  theme: 'light' | 'dark';
}

// ---------- Toast ----------
export interface Toast {
  id: ID;
  type: 'success' | 'error' | 'info';
  message: string;
}
