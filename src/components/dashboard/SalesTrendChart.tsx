import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useOrderStore } from '@/store/useOrderStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatCurrency } from '@/lib/utils';

export function SalesTrendChart() {
  const orders = useOrderStore((s) => s.orders);
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);

  const data = useMemo(() => {
    const days: { key: string; label: string; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const key = dt.toDateString();
      days.push({ key, label: dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), revenue: 0 });
    }
    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      const key = new Date(o.createdAt).toDateString();
      const bucket = days.find((d) => d.key === key);
      if (bucket) bucket.revenue += o.total;
    }
    return days;
  }, [orders]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E3A008" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#E3A008" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EB" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5B6472' }} axisLine={{ stroke: '#E3E6EB' }} tickLine={false} interval={1} />
        <YAxis tick={{ fontSize: 11, fill: '#5B6472' }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value, currencySymbol), 'Revenue']}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#E3E6EB' }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#E3A008" strokeWidth={2} fill="url(#revFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
