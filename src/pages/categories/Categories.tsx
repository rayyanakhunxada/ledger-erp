import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Label, FieldGroup, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useToastStore } from '@/store/useToastStore';
import type { Category } from '@/types';

export default function Categories() {
  const categories = useCategoryStore((s) => s.categories);
  const { add, update, remove } = useCategoryStore();
  const push = useToastStore((s) => s.push);

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState<Category['businessType']>('general');
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      push('Category name is required.', 'error');
      return;
    }
    if (editing) {
      update(editing.id, { name, businessType });
      push('Category updated.');
    } else {
      add({ name, businessType });
      push('Category added.');
    }
    setFormOpen(false);
    setName('');
    setEditing(null);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setBusinessType(c.businessType);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Product Categories"
        description="Organize your catalog with custom categories for general store, footwear, or mixed retail."
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setName('');
              setBusinessType('general');
              setFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add category
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card key={c.id}>
            <CardBody className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-sm text-ink">{c.name}</h3>
                <p className="text-xs text-slate mt-1 capitalize">{c.businessType.replace(/([A-Z])/g, ' $1')}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(c)}
                  className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-paper text-slate hover:text-ink"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(c)}
                  className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-danger/5 text-slate hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit category' : 'Add new category'}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              {editing ? 'Save' : 'Add'}
            </Button>
          </>
        }
      >
        <FieldGroup>
          <Label required>Category name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Men's Sneakers"
            autoFocus
          />
        </FieldGroup>
        <FieldGroup>
          <Label>Business type</Label>
          <Select value={businessType} onChange={(e) => setBusinessType(e.target.value as Category['businessType'])}>
            <option value="general">General Store</option>
            <option value="footwear">Footwear</option>
            <option value="other">Other</option>
          </Select>
        </FieldGroup>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete category"
        description={`Delete "${deleting?.name}"? Products in this category won't be affected.`}
        onConfirm={() => {
          if (deleting) {
            remove(deleting.id);
            push('Category deleted.', 'info');
          }
        }}
      />
    </div>
  );
}
