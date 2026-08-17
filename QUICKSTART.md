# Quick Start Guide — Ledger ERP

Get Ledger ERP running in 3 minutes.

## 1. Install & Run

```bash
# Clone or extract the project
cd erp-app

# Install dependencies (takes ~30 seconds)
npm install

# Start development server
npm run dev
```

The app opens automatically at `http://localhost:5173`.

## 2. Login

Choose any team member — no password required:
- **Ayesha Khan** (Admin)
- **Bilal Ahmed** (Manager)
- **Sara Malik** (Sales)
- **Usman Tariq** (Warehouse)

Hit the dashboard and explore!

## 3. Try These Features First

### Add a Product
1. Go to **Catalog → Products**
2. Click "Add product"
3. Fill in name, SKU, price, warehouse
4. For shoes: enable "has variants" and add sizes (UK 7–10)
5. Click "Add product"

### Create an Order
1. Go to **Sales → Orders**
2. Click "New order"
3. Pick or enter a customer name
4. Add items (stock auto-deducts)
5. Set payment status and method
6. Click "Create order"

### View Dashboard
1. Go to **Dashboard**
2. See 30-day revenue, low stock alerts, top products
3. Trends chart updates as you add orders

### Receive Stock
1. Go to **Procurement → Purchase Orders**
2. Click the eye icon to view a PO
3. Click the checkmark to receive items
4. Enter quantities received
5. Stock automatically updates in Inventory

### Export Data
1. Go to **Settings**
2. Click "Export all data to JSON"
3. Save the file as your backup

## 4. Key Concepts

| Module | What It Does |
|--------|-------------|
| **Dashboard** | KPI overview, sales trends, alerts |
| **Products** | Manage catalog with variants |
| **Orders** | Track sales, manage payments |
| **Customers** | CRM database |
| **Leads** | Sales pipeline (new → won) |
| **Inventory** | Stock levels across warehouses |
| **Warehouses** | Multi-location stock tracking |
| **Suppliers** | Vendor management |
| **POs** | Manage inbound shipments |
| **Settings** | Store config, tax, currency |

## 5. Demo Data Included

- ✅ 10 products (general store + footwear)
- ✅ 8 categories
- ✅ 3 warehouses
- ✅ 4 customers
- ✅ 16 recent orders
- ✅ 6 sales leads
- ✅ 4 suppliers
- ✅ 3 active purchase orders

All wired up with realistic side effects:
- Creating an order deducts stock
- Receiving a PO restocks inventory
- Customer totals auto-increment

## 6. Build for Production

```bash
npm run build
npm run preview  # Test the production build locally
```

Output in `/dist/` — ready to deploy to Vercel, Netlify, or any static host.

## 7. Troubleshooting

**App won't load?**
- Check browser console for errors (F12)
- Make sure localhost:5173 isn't blocked
- Try clearing browser cache

**Data disappeared?**
- localStorage might have been cleared
- Use "Reset demo data" in Settings to reload
- Or import a backup JSON file

**Performance slow?**
- Close unnecessary browser tabs
- localStorage works best with <1000 records
- For larger datasets, consider a backend

## 8. Customize for Your Business

### Currency
Settings → Store information → Currency symbol (change `$` to `Rs`, `€`, etc.)

### Tax Rate
Settings → Financial settings → Tax rate (%)

### Categories
Catalog → Categories → Add category (organize your products)

### Users
Edit `src/store/useAuthStore.ts` to add team members

## 9. Next Steps

- **Learn the codebase**: Read `README.md` for architecture
- **Extend it**: Add custom features, integrate a backend API
- **Deploy it**: Upload the `/dist/` folder to any web host
- **Backup regularly**: Export JSON from Settings

---

**Questions?** Check the README or explore the pages — every feature is self-explanatory. Enjoy! 🎉
