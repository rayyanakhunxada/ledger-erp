import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toolbar, SearchInput } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Input, Label, FieldGroup, Textarea } from '@/components/ui/Field';
import { useLeadStore } from '@/store/useLeadStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';
import { formatCurrency } from '@/lib/utils';
import type { Lead, LeadStage } from '@/types';

const stageTone: Record<LeadStage, 'neutral' | 'warning' | 'info' | 'success' | 'danger'> = {
  new: 'neutral',
  contacted: 'info',
  qualified: 'warning',
  proposal: 'warning',
  won: 'success',
  lost: 'danger',
};

export default function Leads() {
  const leads = useLeadStore((s) => s.leads);
  const { add, update, remove, setStage } = useLeadStore();
  const currencySymbol = useSettingsStore((s) => s.settings.currencySymbol);
  const push = useToastStore((s) => s.push);

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<LeadStage | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState<Lead | null>(null);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [value, setValue] = useState(0);
  const [source, setSource] = useState('');
  const [owner, setOwner] = useState('');
  const [notes, setNotes] = useState('');
  const [stage, setStageForm] = useState<LeadStage>('new');

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || (l.company?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStage = stageFilter === 'all' || l.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [leads, search, stageFilter]);

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      push('Name and phone are required.', 'error');
      return;
    }
    if (editing) {
      update(editing.id, { name, company, phone, email, value, source, owner, notes, stage });
      push('Lead updated.');
    } else {
      add({ name, company, phone, email, value, source, owner, notes, stage: 'new' });
      push('Lead added to pipeline.');
    }
    setFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setValue(0);
    setSource('');
    setOwner('');
    setNotes('');
    setStageForm('new');
    setEditing(null);
  };

  const openEdit = (l: Lead) => {
    setEditing(l);
    setName(l.name);
    setCompany(l.company ?? '');
    setPhone(l.phone);
    setEmail(l.email ?? '');
    setValue(l.value);
    setSource(l.source);
    setOwner(l.owner);
    setNotes(l.notes ?? '');
    setStageForm(l.stage);
    setFormOpen(true);
  };

  const totalValue = leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost').reduce((sum, l) => sum + l.value, 0);

  const columns: Column<Lead>[] = [
    {
      header: 'Lead',
      key: 'name',
      render: (l) => (
        <div>
          <p className="text-sm font-medium text-ink">{l.name}</p>
          <p className="text-xs text-slate">{l.company || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Contact',
      key: 'phone',
      render: (l) => (
        <div>
          <p className="text-xs text-slate font-mono">{l.phone}</p>
          {l.email && <p className="text-xs text-slate">{l.email}</p>}
        </div>
      ),
    },
    {
      header: 'Value',
      key: 'value',
      align: 'right',
      render: (l) => <span className="text-sm font-semibold tabular">{formatCurrency(l.value, currencySymbol)}</span>,
    },
    {
      header: 'Source',
      key: 'source',
      render: (l) => <span className="text-xs text-slate">{l.source}</span>,
    },
    {
      header: 'Stage',
      key: 'stage',
      render: (l) => <Badge tone={stageTone[l.stage]}>{l.stage}</Badge>,
    },
    {
      header: '',
      key: 'actions',
      align: 'right',
      render: (l) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openEdit(l)} className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-paper text-slate hover:text-ink">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setDeleting(l)} className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-danger/5 text-slate hover:text-danger">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sales Pipeline"
        description={`Pipeline value: ${formatCurrency(totalValue, currencySymbol)} across ${leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost').length} open leads.`}
        action={
          <Button size="sm" onClick={() => { resetForm(); setFormOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> New lead
          </Button>
        }
      />

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or company…" />
          <Select className="w-44" value={stageFilter} onChange={(e) => setStageFilter(e.target.value as LeadStage | 'all')}>
            <option value="all">All stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </Select>
          <span className="ml-auto text-xs text-slate">{filtered.length} leads</span>
        </Toolbar>
        <DataTable columns={columns} data={filtered} rowKey={(l) => l.id} pageSize={8} emptyLabel="No leads in pipeline" />
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit lead' : 'Add new lead'}
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit}>{editing ? 'Save' : 'Add'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup>
            <Label required>Contact name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Imran Khan" autoFocus />
          </FieldGroup>
          <FieldGroup>
            <Label>Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Imran Traders" />
          </FieldGroup>
          <FieldGroup>
            <Label required>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 301 1234567" />
          </FieldGroup>
          <FieldGroup>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@company.com" />
          </FieldGroup>
          <FieldGroup>
            <Label>Deal value</Label>
            <Input type="number" min={0} value={value} onChange={(e) => setValue(Number(e.target.value))} />
          </FieldGroup>
          <FieldGroup>
            <Label>Source</Label>
            <Select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">Select source</option>
              <option value="Referral">Referral</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Website">Website</option>
              <option value="Trade Show">Trade Show</option>
              <option value="Other">Other</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Assigned to</Label>
            <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Sara Malik" />
          </FieldGroup>
          <FieldGroup>
            <Label>Stage</Label>
            <Select value={stage} onChange={(e) => setStageForm(e.target.value as LeadStage)}>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </Select>
          </FieldGroup>
          <FieldGroup className="col-span-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any follow-up details…" />
          </FieldGroup>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete lead"
        description={`Remove "${deleting?.name}" from your pipeline?`}
        onConfirm={() => {
          if (deleting) {
            remove(deleting.id);
            push('Lead deleted.', 'info');
          }
        }}
      />
    </div>
  );
}
