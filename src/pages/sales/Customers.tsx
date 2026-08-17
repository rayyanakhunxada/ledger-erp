import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toolbar, SearchInput } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Input, Label, FieldGroup } from '@/components/ui/Field';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { Customer } from '@/types';

export default function Customers() {
  const customers = useCustomerStore((s) => s.customers);
  const { add, update, remove } = useCustomerStore();
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);
  const push = useToastStore((s) => s.push);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<Customer['type']>('regular');

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [customers, search, typeFilter]);

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      push('Name and phone are required.', 'error');
      return;
    }
    if (editing) {
      update(editing.id, { name, phone, email, address, type });
      push('Customer updated.');
    } else {
      add({ name, phone, email, address, type });
      push('Customer added.');
    }
    setFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setType('regular');
    setEditing(null);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email ?? '');
    setAddress(c.address ?? '');
    setType(c.type);
    setFormOpen(true);
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Customer',
      key: 'name',
      render: (c) => (
        <div>
          <p className="text-sm font-medium text-ink">{c.name}</p>
          <p className="text-xs text-slate font-mono">{c.phone}</p>
        </div>
      ),
    },
    {
      header: 'Email',
      key: 'email',
      render: (c) => <span className="text-xs text-slate">{c.email || '—'}</span>,
    },
    {
      header: 'Type',
      key: 'type',
      render: (c) => <Badge tone="neutral" className="capitalize">{c.type.replace('-', ' ')}</Badge>,
    },
    {
      header: 'Total spent',
      key: 'totalSpent',
      align: 'right',
      render: (c) => <span className="text-sm font-semibold tabular">{formatCurrency(c.totalSpent, currencySymbol)}</span>,
    },
    {
      header: 'Orders',
      key: 'totalOrders',
      align: 'center',
      render: (c) => <span className="text-xs text-slate">{formatNumber(c.totalOrders)}</span>,
    },
    {
      header: '',
      key: 'actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openEdit(c)} className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-paper text-slate hover:text-ink">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setDeleting(c)} className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-danger/5 text-slate hover:text-danger">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage your customer base — wholesale accounts, regular buyers, and walk-ins."
        action={
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add customer
          </Button>
        }
      />

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or phone…" />
          <Select className="w-44" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="walk-in">Walk-in</option>
            <option value="regular">Regular</option>
            <option value="wholesale">Wholesale</option>
          </Select>
          <span className="ml-auto text-xs text-slate">{filtered.length} customers</span>
        </Toolbar>
        <DataTable columns={columns} data={filtered} rowKey={(c) => c.id} pageSize={8} emptyLabel="No customers found" />
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit customer' : 'Add new customer'}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit}>{editing ? 'Save' : 'Add'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FieldGroup>
            <Label required>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Fatima Noor" autoFocus />
          </FieldGroup>
          <FieldGroup>
            <Label required>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" />
          </FieldGroup>
          <FieldGroup>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@email.com" />
          </FieldGroup>
          <FieldGroup>
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Blue Area, Islamabad" />
          </FieldGroup>
          <FieldGroup>
            <Label>Type</Label>
            <Select value={type} onChange={(e) => setType(e.target.value as Customer['type'])}>
              <option value="walk-in">Walk-in</option>
              <option value="regular">Regular buyer</option>
              <option value="wholesale">Wholesale account</option>
            </Select>
          </FieldGroup>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete customer"
        description={`Remove "${deleting?.name}" from your customer list? Their order history will be preserved.`}
        onConfirm={() => {
          if (deleting) {
            remove(deleting.id);
            push('Customer deleted.', 'info');
          }
        }}
      />
    </div>
  );
}
