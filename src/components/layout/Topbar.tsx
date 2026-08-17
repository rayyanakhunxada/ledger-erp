import { useMemo, useState } from 'react';
import { Menu, Bell, ChevronDown, LogOut, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';
import { initials } from '@/lib/utils';
import { cn } from '@/lib/cn';
import { Link } from 'react-router-dom';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { currentUser, logout } = useAuthStore();
  const products = useProductStore((s) => s.products);
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const lowStock = useMemo(
    () =>
      products.filter((p) => {
        if (p.status !== 'active') return false;
        if (p.hasVariants) return p.variants.some((v) => v.stock <= v.reorderLevel);
        return p.stock <= p.reorderLevel;
      }),
    [products]
  );

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-line flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden h-9 w-9 flex items-center justify-center rounded-sm hover:bg-paper">
          <Menu className="h-4.5 w-4.5" />
        </button>
        <p className="text-xs text-slate hidden sm:block truncate">{today}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setAlertsOpen((v) => !v)}
            className="relative h-9 w-9 flex items-center justify-center rounded-sm hover:bg-paper text-slate"
          >
            <Bell className="h-4.5 w-4.5" />
            {lowStock.length > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-0.5 rounded-full bg-danger text-white text-[9px] font-semibold flex items-center justify-center">
                {lowStock.length}
              </span>
            )}
          </button>
          {alertsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setAlertsOpen(false)} />
              <div className="absolute right-0 mt-2 w-72 bg-white border border-line rounded-md shadow-pop z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-line">
                  <p className="text-sm font-semibold text-ink">Low stock alerts</p>
                </div>
                <div className="max-h-64 overflow-y-auto scrollbar-thin">
                  {lowStock.length === 0 ? (
                    <p className="text-xs text-slate px-4 py-6 text-center">Everything is well stocked.</p>
                  ) : (
                    lowStock.slice(0, 8).map((p) => (
                      <div key={p.id} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-line last:border-0">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-ink truncate">{p.name}</p>
                          <p className="text-[11px] text-slate">{p.stock} left · reorder at {p.reorderLevel}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  to="/inventory/stock"
                  onClick={() => setAlertsOpen(false)}
                  className="block text-center text-xs font-medium text-navy-900 py-2.5 hover:bg-paper border-t border-line"
                >
                  View inventory
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-sm hover:bg-paper">
            <span
              className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
              style={{ backgroundColor: currentUser?.avatarColor }}
            >
              {currentUser ? initials(currentUser.name) : '—'}
            </span>
            <span className="hidden sm:block text-left">
              <span className="block text-xs font-medium text-ink leading-tight">{currentUser?.name}</span>
              <span className="block text-[10.5px] text-slate capitalize leading-tight">{currentUser?.role}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate hidden sm:block" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-44 bg-white border border-line rounded-md shadow-pop z-20 overflow-hidden">
                <button
                  onClick={logout}
                  className={cn('flex items-center gap-2 w-full px-3.5 py-2.5 text-xs text-danger hover:bg-paper')}
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
