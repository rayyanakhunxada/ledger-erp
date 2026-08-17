import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/Misc';
import { Card } from '@/components/ui/Card';
import { Toolbar, SearchInput } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { useStockMovementStore } from '@/store/useStockMovementStore';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { formatDate, formatNumber } from '@/lib/utils';
import type { StockMovement } from '@/types';

const typeTone: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  in: 'success',
  out: 'danger',
  transfer: 'info',
  adjustment: 'warning',
};

const typeLabel: Record<string, string> = {
  in: 'Stock in',
  out: 'Stock out',
  transfer: 'Transfer',
  adjustment: 'Adjustment',
};

export default function StockMovements() {
  const movements = useStockMovementStore((s) => s.movements);
  const warehouses = useWarehouseStore((s) => s.warehouses);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch = m.productName.toLowerCase().includes(search.toLowerCase()) || m.reference?.includes(search);
      const matchesType = typeFilter === 'all' || m.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [movements, search, typeFilter]);

  const columns: Column<StockMovement>[] = [
    {
      header: 'Date',
      key: 'createdAt',
      render: (m) => <span className="text-xs text-slate">{formatDate(m.createdAt)}</span>,
    },
    {
      header: 'Product',
      key: 'productName',
      render: (m) => (
        <div>
          <p className="text-sm font-medium text-ink">{m.productName}</p>
          <p className="text-xs text-slate font-mono">{m.reference && `Ref: ${m.reference}`}</p>
        </div>
      ),
    },
    {
      header: 'Type',
      key: 'type',
      render: (m) => <Badge tone={typeTone[m.type]}>{typeLabel[m.type]}</Badge>,
    },
    {
      header: 'Quantity',
      key: 'quantity',
      align: 'right',
      render: (m) => (
        <span className={`text-sm font-mono font-semibold ${m.type === 'in' ? 'text-success' : m.type === 'out' ? 'text-danger' : 'text-slate'}`}>
          {m.type === 'out' ? '-' : m.type === 'in' ? '+' : ''}{formatNumber(m.quantity)}
        </span>
      ),
    },
    {
      header: 'Reason',
      key: 'reason',
      render: (m) => <span className="text-xs text-slate">{m.reason}</span>,
    },
    {
      header: 'Warehouse',
      key: 'toWarehouseId',
      render: (m) => {
        const name = m.toWarehouseId ? warehouses.find((w) => w.id === m.toWarehouseId)?.name : m.fromWarehouseId ? warehouses.find((w) => w.id === m.fromWarehouseId)?.name : '—';
        return <span className="text-xs text-slate">{name}</span>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Movements"
        description="Audit trail of all inventory changes — inbound, outbound, transfers, and adjustments."
      />

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by product or reference…" />
          <Select className="w-40" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="in">Stock in</option>
            <option value="out">Stock out</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </Select>
          <span className="ml-auto text-xs text-slate">{filtered.length} movements</span>
        </Toolbar>
        <DataTable columns={columns} data={filtered} rowKey={(m) => m.id} pageSize={10} emptyLabel="No stock movements recorded" />
      </Card>
    </div>
  );
}
