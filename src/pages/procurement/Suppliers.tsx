import { useState } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Label, FieldGroup } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { useSupplierStore } from '@/store/useSupplierStore';
import { useToastStore } from '@/store/useToastStore';
import type { Supplier } from '@/types';

const ratingStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

export default function Suppliers() {
  const suppliers = useSupplierStore((s) => s.suppliers);
  const { add, update, remove } = useSupplierStore();
  const push = useToastStore((s) => s.push);

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState(5);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const handleSubmit = () => {
    if (!name.trim() || !contactPerson.trim() || !phone.trim()) {
      push('Name, contact person, and phone are required.', 'error');
      return;
    }
    if (editing) {
      update(editing.id, { name, contactPerson, phone, email, address, rating });
      push('Supplier updated.');
    } else {
      add({ name, contactPerson, phone, email, address, rating });
      push('Supplier added.');
    }
    setFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setRating(5);
    setEditing(null);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setName(s.name);
    setContactPerson(s.contactPerson);
    setPhone(s.phone);
    setEmail(s.email ?? '');
    setAddress(s.address ?? '');
    setRating(s.rating);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Suppliers & Vendors"
        description="Manage your supply network — delivery terms, ratings, and order history."
        action={
          <Button size="sm" onClick={() => { resetForm(); setFormOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> Add supplier
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((s) => (
          <Card key={s.id}>
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-ink">{s.name}</h3>
                  <p className="text-xs text-slate">{s.contactPerson}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(s)}
                    className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-paper text-slate hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleting(s)}
                    className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-danger/5 text-slate hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {s.phone && <p className="text-xs text-slate">{s.phone}</p>}
                {s.email && <p className="text-xs text-slate">{s.email}</p>}
                {s.address && <p className="text-xs text-slate">{s.address}</p>}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-line">
                <span className="text-yellow-500 text-xs font-semibold">{ratingStars(s.rating)}</span>
                <span className="text-[11px] text-slate">{s.totalOrders} orders</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit supplier' : 'Add new supplier'}
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
            <Label required>Company name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Falak Foods Distribution" autoFocus />
          </FieldGroup>
          <FieldGroup>
            <Label required>Contact person</Label>
            <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Tariq Javed" />
          </FieldGroup>
          <FieldGroup>
            <Label required>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 42 3567 1200" />
          </FieldGroup>
          <FieldGroup>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sales@supplier.com" />
          </FieldGroup>
          <FieldGroup>
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Industrial Area, Lahore" />
          </FieldGroup>
          <FieldGroup>
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setRating(r)}
                  className={`text-lg ${r <= rating ? 'text-yellow-500' : 'text-slate'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete supplier"
        description={`Remove "${deleting?.name}" from your supplier list? Order history will be preserved.`}
        onConfirm={() => {
          if (deleting) {
            remove(deleting.id);
            push('Supplier deleted.', 'info');
          }
        }}
      />
    </div>
  );
}
