import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Toaster } from '@/components/ui/Toaster';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      {mobileOpen && <div className="fixed inset-0 bg-navy-900/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileOpen((v) => !v)} />
        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
