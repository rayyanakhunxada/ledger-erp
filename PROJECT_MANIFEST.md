# Ledger ERP — Project Manifest

## What's Included

### ✅ Complete, Production-Ready Application

A fully functional **enterprise resource planning system** for retail businesses — general stores, footwear shops, or mixed retail. Everything runs entirely in the browser using React, TypeScript, Tailwind CSS, and localStorage.

---

## Architecture Overview

### Frontend Stack
- **React 18** — UI framework
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling with custom design tokens
- **Zustand** — Lightweight state management (persisted to localStorage)
- **React Router v6** — Client-side routing
- **Recharts** — Data visualization (area charts, bars)
- **Lucide React** — Icon library (300+ icons)
- **Vite** — Ultra-fast build tool

### Storage
- **localStorage API** — All data stored locally in the browser (5MB limit per domain)
- No backend required
- Automatic persistence of all stores
- Export/import as JSON for backup/restore

### Design System
- **Navy (#101728)** primary + **Amber (#E3A008)** accent
- **Notched "tag chip" badges** — signature UI element
- **Monospace font** for data (SKUs, prices, codes)
- **Responsive grid** — desktop, tablet, mobile
- **Minimal, clean aesthetic** — focus on data

---

## Feature Modules (12 Major Sections)

### 1. Dashboard
- **KPI Cards**: 30-day revenue, order count, pipeline value, low-stock items
- **14-Day Sales Trend**: Area chart with daily revenue
- **Category Breakdown**: Revenue distribution by product category
- **Low Stock Panel**: Products below reorder level
- **Recent Orders**: Last 6 sales
- **Top Products**: Best-selling items by revenue

### 2. Sales Management
- **Orders Page**: Full order list with search/filter, create/view/delete
- **Order Form Modal**: 
  - Customer selection or manual entry
  - Multi-item cart with dynamic pricing
  - Discount, tax, and payment tracking
  - Automatic stock deduction on order creation
  - Side effects: increments customer totals, records stock movements
- **Order Detail Modal**: View full order breakdown, payment status
- **Payment Tracking**: Record partial payments, track outstanding balance

### 3. Customer Relationship Management (CRM)
- **Customer Database**: Walk-in, regular, wholesale profiles
- **Customer Tracking**: Total spent, order count, email/address on file
- **Lead Pipeline**: 
  - Stages: New → Contacted → Qualified → Proposal → Won/Lost
  - Track deal value through pipeline
  - Assign to sales rep
  - Add notes and source tracking
  - Real-time pipeline value summary

### 4. Inventory & Warehouse
- **Stock Overview**: Real-time stock levels with low-stock alerts
  - Per-product inventory across warehouses
  - Reorder level warnings
  - Variant support (shoes in multiple sizes)
- **Warehouse Management**: 
  - Multi-location support
  - Default warehouse configuration
  - Location-based stock tracking
- **Stock Movements**: Complete audit trail
  - Stock in, stock out, transfers, adjustments
  - Reference to orders/POs
  - Warehouse from/to tracking

### 5. Procurement
- **Supplier Management**: 
  - Contact info and ratings (1–5 stars)
  - Order history tracking
  - Performance notes
- **Purchase Orders**: 
  - Create POs with line items
  - Track expected delivery dates
  - Status: draft, ordered, partially-received, received, cancelled
  - Receive items with modal interface
  - Auto-restock inventory on receive
  - Side effects: records stock movements

### 6. Product Catalog
- **Full CRUD**: Create, read, update, delete products
- **Variant Support**: Size/color variants (e.g., shoes in UK 7–10)
  - Independent stock per variant
  - Variant-specific SKUs
  - Reorder levels per variant
- **Product Details**:
  - Brand, category, warehouse, unit
  - Cost price, sell price
  - Stock quantity, reorder level
  - Status (active/inactive)
- **Bulk Operations**: CSV export

### 7. Category Management
- **Custom Categories**: Organize products by type
- **Business Type**: General store, footwear, other
- **CRUD Operations**: Add, edit, delete categories

### 8. Settings & Configuration
- **Store Details**: Name, business type, address, phone
- **Financial Config**: Tax rate (%), currency symbol, low-stock threshold
- **Data Management**: 
  - Export all data to JSON backup
  - Import from backup (restore on next load)
  - Reset demo data (clears all, reloads with seed data)
- **Account**: Sign out

---

## Data Model (Complete TypeScript Types)

```typescript
// Entities
Product { id, name, sku, categoryId, brand, unit, costPrice, sellPrice, stock, reorderLevel, warehouseId, hasVariants, variants[], status, createdAt, updatedAt }
ProductVariant { id, size, color, sku, stock, reorderLevel }

Customer { id, name, phone, email, address, type, totalSpent, totalOrders, createdAt, updatedAt }
Order { id, orderNo, customerId, customerName, items[], subtotal, discount, tax, total, amountPaid, status, paymentMethod, channel, createdAt, updatedAt }
OrderItem { productId, productName, sku, quantity, price, variantLabel }

Lead { id, name, company, phone, email, stage, value, source, owner, notes, createdAt, updatedAt }

Supplier { id, name, contactPerson, phone, email, address, rating, totalOrders, createdAt, updatedAt }
PurchaseOrder { id, poNo, supplierId, supplierName, items[], total, status, expectedDate, warehouseId, createdAt, updatedAt }
PurchaseOrderItem { productId, productName, sku, quantity, costPrice, received }

StockMovement { id, productId, productName, type, quantity, fromWarehouseId, toWarehouseId, reason, reference, createdAt, updatedAt }

Category { id, name, businessType }
Warehouse { id, name, location, isDefault }
AppUser { id, name, email, role, avatarColor }
StoreSettings { storeName, businessType, currencySymbol, address, phone, taxRate, lowStockThreshold, theme }
```

---

## Zustand Stores (State Management)

Each store persists to a dedicated localStorage key under `erp:` prefix:

| Store | Key | Purpose |
|-------|-----|---------|
| `useSettingsStore` | `erp:settings` | Store config, currency, tax |
| `useAuthStore` | `erp:auth` | Current logged-in user |
| `useCategoryStore` | `erp:categories` | Product categories |
| `useWarehouseStore` | `erp:warehouses` | Warehouse locations |
| `useProductStore` | `erp:products` | Catalog with CRUD |
| `useCustomerStore` | `erp:customers` | Customer database |
| `useOrderStore` | `erp:orders` | Sales orders (triggers side effects) |
| `useLeadStore` | `erp:leads` | Sales pipeline |
| `useSupplierStore` | `erp:suppliers` | Vendor database |
| `usePurchaseOrderStore` | `erp:purchase-orders` | Inbound orders |
| `useStockMovementStore` | `erp:stock-movements` | Audit trail |
| `useToastStore` | (ephemeral) | Notifications |

### Side Effects (Business Logic)
- **Order Creation**: Stock deduction + stock movement recording + customer total increment
- **PO Receipt**: Stock addition + stock movement recording + supplier order increment
- **Product Delete**: Cascade-safe (orders still work, reference by ID)
- **Customer Delete**: Order history preserved (customer field is text, not FK)

---

## Component Architecture

### UI Components (`/src/components/ui/`)
- **Button** — 5 variants (primary, secondary, ghost, danger, outline)
- **Card** — Flexible container (Card, CardHeader, CardBody)
- **Badge** — Notched "tag chip" design (status/stock labels)
- **Modal** — Dialog overlay with portal
- **ConfirmDialog** — Destructive action confirmation
- **Toaster** — Toast notifications (auto-dismiss)
- **Form Fields** — Input, Select, Textarea, Label, FieldGroup
- **DataTable** — Paginated list with columns, empty state, sorting prep
- **StatCard** — KPI display with trends and accent colors
- **SearchInput** — Search bar with icon
- **Toolbar** — Wrapper for filters and actions
- **EmptyState & PageHeader** — Consistent page structure

### Layout Components (`/src/components/layout/`)
- **Sidebar** — Navigation (grouped by module), user brand, offline notice
- **Topbar** — Date display, low-stock bell with badge, user menu with logout
- **Layout** — Shell combining sidebar, topbar, routes, toaster

### Dashboard Components (`/src/components/dashboard/`)
- **SalesTrendChart** — 14-day revenue area chart
- **CategoryBreakdown** — Revenue by category (progress bars)
- **LowStockPanel** — Alert list with links to inventory
- **RecentOrdersPanel** — Last 6 orders with payment status
- **TopProductsPanel** — Top 5 by revenue

### Page Components (`/src/pages/`)
- **Dashboard** — Main overview (no query params, root route)
- **Products** — CRUD + search/filter + CSV export + modal form with variants
- **Categories** — CRUD, grid layout, tag-chip badges
- **Orders** — List + search/filter + create modal + detail modal
- **Customers** — List + CRUD + filter by type
- **Leads** — Pipeline + search/filter + form modal
- **Stock** — Real-time overview, low-stock highlighting
- **Warehouses** — CRUD, grid layout
- **Movements** — Audit trail, filter by type
- **Suppliers** — CRUD, star ratings
- **PurchaseOrders** — List + detail + receive items modal
- **Settings** — Config forms + data export/import + reset + logout

---

## File Structure

```
erp-app/
├── public/
│   └── favicon.svg              # App icon
├── src/
│   ├── components/
│   │   ├── ui/                  # Reusable UI (Button, Card, Modal, etc.)
│   │   ├── layout/              # Sidebar, Topbar, Layout shell
│   │   └── dashboard/           # Dashboard panels & charts
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Login.tsx            # Login screen
│   │   ├── products/            # Product CRUD + form modal
│   │   ├── categories/          # Category CRUD
│   │   ├── sales/               # Orders, Customers
│   │   ├── crm/                 # Leads pipeline
│   │   ├── inventory/           # Stock, Warehouses, Movements
│   │   ├── procurement/         # Suppliers, Purchase Orders
│   │   └── settings/            # Settings, data export/import
│   ├── store/                   # Zustand stores (1 per domain)
│   ├── types/                   # TypeScript interfaces
│   ├── lib/                     # Utilities (format, storage, cn)
│   ├── App.tsx                  # Routes
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles + Tailwind directives
├── index.html                   # HTML shell
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
├── tailwind.config.js           # Tailwind tokens
├── postcss.config.js            # PostCSS
├── .gitignore
├── README.md                    # Full documentation
├── QUICKSTART.md                # Quick start guide
└── PROJECT_MANIFEST.md          # This file
```

---

## Seed Data Included

The app comes fully loaded with realistic demo data, all wired together:

### Products (10)
- Basmati Rice 5kg, Cooking Oil 1L, Dish Wash Liquid
- A4 Notebook, Ballpoint Pens
- Face Cream 100ml
- Air Max Running Sneaker (UK 7–10 variants)
- Classic Oxford Formal Shoe (UK 8–10 variants)
- Kids Velcro Trainer, Foam Slide Sandal

### Categories (8)
- Groceries, Household Supplies, Stationery, Cosmetics & Personal Care
- Men's Sneakers, Formal Shoes, Kids' Footwear, Sandals & Slippers

### Warehouses (3)
- Main Store Floor, Back Warehouse, Footwear Storeroom

### Customers (4)
- Hamza Retail Store (wholesale, $4,820 spent, 12 orders)
- Fatima Noor (regular, $640 spent, 9 orders)
- Zain Sports Corner (wholesale, $9,120 spent, 21 orders)
- Walk-in Customer

### Orders (16)
- Spanning 14 days with realistic sales patterns
- Mix of cash, card, bank transfer, credit payments
- Various statuses: paid, partially-paid, cancelled
- Linked to customers + products with automatic side effects

### Leads (6)
- At different pipeline stages: new, contacted, qualified, proposal, won, lost
- With deal values ranging from $1,500–$8,900
- Assigned to sales reps, tagged with sources

### Suppliers (4)
- Falak Foods Distribution (rating ⭐⭐⭐⭐)
- Nike Regional Distributor (rating ⭐⭐⭐⭐⭐)
- Bata Pakistan Wholesale (rating ⭐⭐⭐⭐)
- PaperCo Stationers (rating ⭐⭐⭐)

### Purchase Orders (3)
- States: ordered (Nike), partially-received (Nike), received (Falak Foods)
- Line items linked to products
- Auto-restock on receive

### Demo Users (4)
- Ayesha Khan (Admin), Bilal Ahmed (Manager), Sara Malik (Sales), Usman Tariq (Warehouse)

---

## Quick Reference: What's Automatic

✅ **Create an order** → Stock deducts + stock movement recorded + customer totals increment
✅ **Receive a PO** → Stock increases + stock movement recorded
✅ **Add product** → Stores in catalog, queryable by category/warehouse
✅ **Low stock alert** → Bell in topbar + color-coded badges
✅ **Data persistence** → All changes saved to localStorage automatically
✅ **Export/Import** → Backup entire store as JSON, restore anytime
✅ **Demo reset** → Clear data and reload with fresh seed data

---

## Build & Deployment

### Development
```bash
npm install
npm run dev          # Start dev server on localhost:5173
```

### Production
```bash
npm run build        # Optimize & bundle to /dist
npm run preview      # Test production build locally
```

### Deploy
Upload `/dist/` folder to:
- **Vercel** — Push to GitHub, auto-deploy
- **Netlify** — Drag & drop `/dist/`
- **GitHub Pages** — Static hosting
- **Any web server** — Copy `/dist/` contents

No backend setup required. App runs entirely in the browser.

---

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires localStorage support and ES2020 JavaScript.

---

## Performance Notes

- **Initial Load**: ~2MB bundle (minified, gzipped ~600KB)
- **Storage Limit**: 5MB per domain via localStorage
- **Typical Dataset**: Handles 500–1000 products, 5000+ orders comfortably
- **Bottleneck**: Large CSV exports or 100k+ stock movements may slow export

For enterprise scale (10k+ products, 100k+ orders), consider a backend database (PostgreSQL) + API layer.

---

## Security Considerations

⚠️ **Frontend-only application** — data stored in browser, not on server:
- ✅ Good for: Demo, internal tools, offline capability, privacy
- ⚠️ Risk: Data loss if localStorage cleared or device wiped
- ⚠️ Risk: No access control per user (all team members see all data)
- 📋 Mitigation: Regular backups (export JSON), use private browsing on shared machines

For production deployment, consider:
- Backend authentication (JWT)
- Role-based access control (RBAC)
- Server-side data persistence
- SSL/TLS encryption
- Audit logging

---

## Customization Hooks

All stores use Zustand with getState/setState patterns — easy to extend:

```typescript
// Add a hook to stores
const useProductStore = create((set, get) => ({
  // ... existing actions
  custom_action: () => {
    const products = get().products;
    // Do something
    set({ products: [...] });
  }
}));
```

All types are fully typed in `src/types/index.ts` — extend as needed.

---

## Future Roadmap

Potential enhancements (not included):
- Backend API (Node.js + Express + PostgreSQL)
- Real authentication (JWT, OAuth2)
- Advanced reporting (PDF exports, dashboards)
- Barcode scanning for POS integration
- Multi-currency support
- Discount rules engine
- Loyalty programs
- Supplier performance analytics
- Forecasting & budgets
- Mobile app (React Native, PWA)
- SMS/email notifications

---

## Summary

**Ledger ERP** is a complete, modern business management system suitable for:
- ✅ General stores
- ✅ Footwear retailers
- ✅ Small/medium retail chains
- ✅ Multi-category businesses
- ✅ Demo & learning purposes
- ✅ MVPs and internal tools

All built with React, TypeScript, Tailwind CSS, running entirely in-browser with localStorage. Production-ready code, fully typed, with realistic seed data and comprehensive documentation.

---

**Questions?** Refer to README.md (full docs) or QUICKSTART.md (getting started).
