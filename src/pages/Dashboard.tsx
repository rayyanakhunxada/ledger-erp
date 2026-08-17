import { useMemo } from 'react';
import { DollarSign, ShoppingBag, AlertOctagon, Target, Truck } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { LowStockPanel } from '@/components/dashboard/LowStockPanel';
import { RecentOrdersPanel, TopProductsPanel } from '@/components/dashboard/RecentActivity';
import { useOrderStore } from '@/store/useOrderStore';
import { useProductStore } from '@/store/useProductStore';
import { useLeadStore } from '@/store/useLeadStore';
import { usePurchaseOrderStore } from '@/store/usePurchaseOrderStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function Dashboard() {
  const orders = useOrderStore((s) => s.orders);
  const products = useProductStore((s) => s.products);
  const leads = useLeadStore((s) => s.leads);
  const purchaseOrders = usePurchaseOrderStore((s) => s.purchaseOrders);
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);
  const currentUser = useAuthStore((s) => s.currentUser);

  const kpis = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const recentOrders = orders.filter((o) => new Date(o.createdAt) >= cutoff && o.status !== 'cancelled');
    const revenue = recentOrders.reduce((sum, o) => sum + o.total, 0);

    const lowStockCount = products.reduce((count, p) => {
      if (p.status !== 'active') return count;
      if (p.hasVariants) return count + p.variants.filter((v) => v.stock <= v.reorderLevel).length;
      return count + (p.stock <= p.reorderLevel ? 1 : 0);
    }, 0);

    const pipelineValue = leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost').reduce((sum, l) => sum + l.value, 0);
    const openPOs = purchaseOrders.filter((p) => p.status === 'ordered' || p.status === 'partially-received').length;

    return { revenue, orderCount: recentOrders.length, lowStockCount, pipelineValue, openPOs };
  }, [orders, products, leads, purchaseOrders]);

  return (
    <div>
      <PageHeader
        title={`Welcome back${currentUser ? `, ${currentUser.name.split(' ')[0]}` : ''}`}
        description="Here's what's happening across your store today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue (30 days)" value={formatCurrency(kpis.revenue, currencySymbol)} icon={DollarSign} accent="amber" trend={{ value: '12.4%', direction: 'up' }} />
        <StatCard label="Orders (30 days)" value={formatNumber(kpis.orderCount)} icon={ShoppingBag} accent="navy" trend={{ value: '4.1%', direction: 'up' }} />
        <StatCard label="Low Stock Items" value={formatNumber(kpis.lowStockCount)} icon={AlertOctagon} accent="danger" />
        <StatCard label="Open Pipeline" value={formatCurrency(kpis.pipelineValue, currencySymbol)} icon={Target} accent="info" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card className="xl:col-span-2">
          <CardHeader title="Sales trend" subtitle="Revenue over the last 14 days" />
          <CardBody className="pt-2">
            <SalesTrendChart />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Revenue by category" subtitle="Top performing categories" />
          <CardBody>
            <CategoryBreakdown />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Low stock alerts" subtitle={`${kpis.lowStockCount} items need reordering`} />
          <CardBody className="pt-3">
            <LowStockPanel />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Recent orders" subtitle="Latest sales activity" />
          <CardBody className="pt-3">
            <RecentOrdersPanel />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Top products" subtitle="By revenue, all time" />
          <CardBody className="pt-3">
            <TopProductsPanel />
          </CardBody>
        </Card>
      </div>

      {kpis.openPOs > 0 && (
        <div className="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-md px-4 py-3">
          <Truck className="h-4 w-4 text-amber-700 shrink-0" />
          <p className="text-xs text-amber-700">
            You have <strong>{kpis.openPOs}</strong> purchase order{kpis.openPOs > 1 ? 's' : ''} awaiting delivery.
          </p>
        </div>
      )}
    </div>
  );
}
