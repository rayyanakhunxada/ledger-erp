import { useState } from 'react';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Label, FieldGroup } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { useToastStore } from '@/store/useToastStore';
import type { Warehouse } from '@/types';

export default function Warehouses() {
  const warehouses = useWarehouseStore((s) => s.warehouses);
  const { add, update, remove } = useWarehouseStore();
  const push = useToastStore((s) => s.push);

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [deleting, setDeleting] = useState<Warehouse | null>(null);

  const handleSubmit = () => {
    if (!name.trim() || !location.trim()) {
      push('Name and location are required.', 'error');
      return;
    }
    if (editing) {
      update(editing.id, { name, location, isDefault });
      push('Warehouse updated.');
    } else {
      if (isDefault) {
        warehouses.forEach((w) => update(w.id, { isDefault: false }));
      }
      add({ name, location, isDefault });
      push('Warehouse added.');
    }
    setFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setLocation('');
    setIsDefault(false);
    setEditing(null);
  };

  const openEdit = (w: Warehouse) => {
    setEditing(w);
    setName(w.name);
    setLocation(w.location);
    setIsDefault(w.isDefault);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Warehouses & Storage Locations"
        description="Manage your physical storage locations for multi-location inventory tracking."
        action={
          <Button size="sm" onClick={() => { resetForm(); setFormOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> Add warehouse
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((w) => (
          <Card key={w.id}>
            <CardBody className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-slate" />
                  <h3 className="font-semibold text-sm text-ink">{w.name}</h3>
                </div>
                <p className="text-xs text-slate">{w.location}</p>
                {w.isDefault && <Badge tone="amber" className="mt-2">Default</Badge>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(w)}
                  className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-paper text-slate hover:text-ink"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {!w.isDefault && (
                  <button
                    onClick={() => setDeleting(w)}
                    className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-danger/5 text-slate hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit warehouse' : 'Add new warehouse'}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit}>{editing ? 'Save' : 'Add'}</Button>
          </>
        }
      >
        <FieldGroup>
          <Label required>Warehouse name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Main Warehouse" autoFocus />
        </FieldGroup>
        <FieldGroup>
          <Label required>Location address</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ground floor, Market Street" />
        </FieldGroup>
        <div className="flex items-center gap-2 pt-1">
          <input
            id="isDefault"
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded accent-navy-900"
          />
          <label htmlFor="isDefault" className="text-xs font-medium text-ink">Set as default warehouse</label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete warehouse"
        description={`Remove "${deleting?.name}"? Make sure no active stock is stored here.`}
        onConfirm={() => {
          if (deleting) {
            remove(deleting.id);
            push('Warehouse deleted.', 'info');
          }
        }}
      />
    </div>
  );
}
