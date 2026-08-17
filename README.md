# Ledger ERP — Frontend-Only Business Management System

A modern, fully functional ERP system built with **React + TypeScript + Tailwind CSS** for general stores, footwear retailers, and multi-category businesses. Everything runs in your browser using localStorage — no backend, no server setup required.

## Features

### 📊 Dashboard
- **KPI Overview**: Revenue trends, order counts, pipeline value, low stock alerts
- **14-Day Sales Chart**: Area chart tracking revenue trends
- **Category Breakdown**: Revenue by product category
- **Low Stock Alerts**: Real-time inventory warnings
- **Recent Orders & Top Products**: Quick access to active sales

### 🛒 Sales & CRM
- **Orders Management**: Create, track, and manage sales orders with automatic stock deduction
- **Customer Database**: Walk-in, regular, and wholesale customer profiles with spending history
- **Sales Pipeline**: Track leads from new → contacted → qualified → proposal → won/lost
- **Payment Tracking**: Record partial payments and manage outstanding balances

### 📦 Inventory & Warehouse
- **Stock Overview**: Real-time inventory levels across all products and variants
- **Multi-Warehouse Support**: Track stock across different storage locations
- **Low Stock Alerts**: Automatic reorder level warnings
- **Stock Movements**: Complete audit trail of all inbound, outbound, transfer, and adjustment movements

### 🏭 Procurement
- **Supplier Management**: Contact info, ratings, and order history
- **Purchase Orders**: Create POs, track delivery status, receive items
- **Automatic Stock Updates**: Receiving goods automatically updates inventory

### 📋 Catalog Management
- **Product CRUD**: Add, edit, delete products with full details
- **Variant Support**: Size/color variants for footwear (e.g., shoes in UK sizes 7–10)
- **Category Organization**: Organize by general store, footwear, or custom categories
- **Bulk Operations**: Export products to CSV

### ⚙️ Settings & Data
- **Store Configuration**: Name, currency, tax rate, business type
- **Data Export/Import**: Backup entire store as JSON, restore from backup
- **Demo Reset**: Clear all data and reload with fresh seed data

## Technology Stack

- **React 18** — UI library
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling (custom navy/amber design tokens)
- **Zustand** — State management (persisted to localStorage)
- **React Router** — Navigation
- **Lucide React** — 300+ icons
- **Recharts** — Data visualization
- **Vite** — Lightning-fast dev & build

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:5173`.

### Demo Login
No password required. Choose from 4 pre-loaded team members:
- **Ayesha Khan** (Admin) — Full access
- **Bilal Ahmed** (Manager) — Manage operations
- **Sara Malik** (Sales) — Handle sales & leads
- **Usman Tariq** (Warehouse) — Manage inventory

## Seed Data Included

The app comes pre-loaded with realistic demo data:
- **10 products**: Mix of groceries, stationery, footwear (some with size variants)
- **8 categories**: General store + footwear
- **3 warehouses**: Main store floor, back warehouse, footwear storeroom
- **4 customers**: Mix of walk-in and wholesale accounts
- **16 recent orders**: Spanning the last 14 days with realistic sales patterns
- **6 leads**: At different pipeline stages with valuations
- **4 suppliers**: With contact info and ratings
- **3 purchase orders**: Various stages (ordered, partially-received, received)

### Footwear-Specific Features
- **Size Variants**: Air Max sneaker available in UK sizes 7–10 with independent stock
- **Shoe Categories**: Men's sneakers, formal shoes, kids' footwear, sandals
- **Variant SKUs**: Each size gets a unique SKU (e.g., `SNK-0001-8` for UK size 8)

## Design System

### Visual Identity
The app uses a distinctive "ledger/price tag" aesthetic:
- **Navy sidebar** (#101728) with amber accent (#E3A008)
- **Notched "tag chip" badges** — the signature UI element for statuses and stock labels
- **Clean, minimal layout** — focus on data, not decoration
- **Monospace fonts** for SKUs and prices (IBM Plex Mono)
- **Responsive grid** — works on desktop, tablet, and mobile

### Key Components
- Button (5 variants: primary, secondary, ghost, danger, outline)
- Card, CardHeader, CardBody
- Badge (notched tag design)
- Modal, ConfirmDialog
- DataTable (pagination built-in)
- Toolbar + SearchInput
- StatCard (KPI display)
- Form fields (Input, Select, Textarea, Label, FieldGroup)

## State Management (Zustand)

All data persists to localStorage under the `erp:` prefix:
- `useSettingsStore` — Store config
- `useAuthStore` — Current user (demo-only)
- `useCategoryStore` — Product categories
- `useWarehouseStore` — Warehouse locations
- `useProductStore` — Catalog with variants
- `useCustomerStore` — Customer database
- `useOrderStore` — Sales orders (triggers stock deduction)
- `useLeadStore` — Sales pipeline
- `useSupplierStore` — Supplier contacts
- `usePurchaseOrderStore` — Purchase orders (triggers stock receipt)
- `useStockMovementStore` — Audit trail
- `useToastStore` — Ephemeral notifications (not persisted)

### Side Effects
- Creating an order automatically:
  - Deducts product stock
  - Records stock movements
  - Increments customer total spent & orders
- Receiving a purchase order automatically:
  - Adds stock to warehouse
  - Records stock movements
- Deleting products cascades safely (orders reference by ID)

## Data Export & Backup

### Export
```javascript
import { exportAllData } from '@/lib/storage';
const backup = exportAllData(); // JSON-serializable object
// Download to disk via the Settings page
```

### Import
```javascript
import { importAllData } from '@/lib/storage';
importAllData(backupData); // Restores all stores, reloads page
```

### Reset
```javascript
import { clearAllData } from '@/lib/storage';
clearAllData(); // Wipes all data, reloads with fresh seed
```

## File Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Sidebar, Topbar, Layout
│   └── dashboard/       # Dashboard panels & charts
├── pages/               # Full-page components
│   ├── products/
│   ├── sales/
│   ├── crm/
│   ├── inventory/
│   ├── procurement/
│   └── settings/
├── store/               # Zustand stores (one per domain)
├── types/               # TypeScript interfaces
├── lib/                 # Utilities & helpers
├── App.tsx              # Routes & layout
├── main.tsx             # Entry point
└── index.css            # Global styles + Tailwind
```

## Utilities

### Formatting
```typescript
formatCurrency(amount, symbol)   // $1,234.56
formatNumber(n)                  // 1,234
formatDate(iso)                  // Jan 1, 2024
formatDateTime(iso)              // Jan 1, 2024, 2:30 PM
generateCode(prefix, seq)        // ORD-0001
initials(name)                   // AK (from "Ayesha Khan")
```

### Data
```typescript
newId()                          // Random UUID
nowISO()                         // ISO timestamp
colorForString(str)              // Consistent avatar color
clamp(n, min, max)               // Math clamp
downloadJSON(filename, data)     // Export as file
exportToCSV(filename, rows)      // CSV export
```

## Customization

### Currency
Edit `useSettingsStore` in the Settings page to change default currency symbol.

### Tax Rates
Configurable per store in Settings. Applied to all new orders.

### Categories
Add custom categories in the Categories page. Filter products by business type.

### Users
Edit `DEMO_USERS` in `src/store/useAuthStore.ts` to add/modify team members.

### Seed Data
Modify seed arrays in each store file to pre-load different demo data.

## Limitations & Future Enhancements

### Current Scope
- Frontend only — no backend persistence
- No user authentication (demo-only)
- No email/SMS notifications
- No payment gateway integration
- localStorage limited to ~5MB per domain

### Potential Additions
- Backend API (Node.js + PostgreSQL)
- Real authentication (JWT/OAuth)
- Advanced reporting & analytics
- Barcode scanning for POS
- Multi-currency support
- Discount rules engine
- Customer loyalty programs
- Supplier performance analytics
- Budget forecasting
- Mobile app (React Native)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires localStorage support and ES2020 JavaScript.

## License

MIT License — free for personal and commercial use.

## Support & Contributing

This is a fully self-contained demo. All data lives in your browser and is lost on cache clear. For production use, integrate with a backend API.

---

**Built with ❤️ for retail, distribution, and e-commerce teams who value clean, fast software.**
