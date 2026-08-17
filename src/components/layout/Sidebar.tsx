import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Target,
  Boxes,
  Warehouse,
  ArrowLeftRight,
  Truck,
  ClipboardList,
  Package,
  Tags,
  Settings,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useSettingsStore } from '@/store/useSettingsStore';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  { label: 'Overview', items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'Sales & CRM',
    items: [
      { to: '/sales/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/sales/customers', label: 'Customers', icon: Users },
      { to: '/crm/leads', label: 'Leads Pipeline', icon: Target },
    ],
  },
  {
    label: 'Inventory & Warehouse',
    items: [
      { to: '/inventory/stock', label: 'Stock Overview', icon: Boxes },
      { to: '/inventory/warehouses', label: 'Warehouses', icon: Warehouse },
      { to: '/inventory/transfers', label: 'Stock Movements', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Procurement',
    items: [
      { to: '/procurement/suppliers', label: 'Suppliers', icon: Truck },
      { to: '/procurement/purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/products', label: 'Products', icon: Package },
      { to: '/categories', label: 'Categories', icon: Tags },
    ],
  },
  { label: 'System', items: [{ to: '/settings', label: 'Settings', icon: Settings }] },
];

export function Sidebar({ mobileOpen, onNavigate }: { mobileOpen: boolean; onNavigate: () => void }) {
  const storeName = useSettingsStore((s) => s.settings.storeName);

  return (
    <aside
      className={cn(
        'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-navy-900 text-white flex flex-col transition-transform duration-200 shrink-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10 shrink-0">
        <div className="h-8 w-8 rounded-sm bg-amber flex items-center justify-center shrink-0">
          <Tag className="h-4 w-4 text-navy-900" />
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-sm leading-tight truncate">{storeName}</p>
          <p className="text-[11px] text-white/50 leading-tight">Ledger ERP</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2.5 mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-white/40">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[13px] font-medium transition-colors',
                      isActive ? 'bg-amber text-navy-900' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-3.5 border-t border-white/10 text-[11px] text-white/40 shrink-0">
        Runs entirely offline · Data stored in this browser
      </div>
    </aside>
  );
}
