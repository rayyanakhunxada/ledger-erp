import { useState } from 'react';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Label, FieldGroup } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useProductStore } from '@/store/useProductStore';
import { useToastStore } from '@/store/useToastStore';
import type { Category } from '@/types';

export default function Categories() {
  const { categories, add, update, remove } = useCategoryStore();
  const products = useProductStore((s) => s.products);
  const push = useToastStore((s) => s.push);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState<Category['businessType']>('general');

  const openCreate = () => { setEditing(null); setName(''); setBusinessType('general'); setFormOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setBusinessType(c.businessType); setFormOpen(true); };

  const handleSubmit = () => {
    if (!name.trim()) { push('Category name is required.', 'error'); return; }
    if (editing) {
      update(editing.id, { name, businessType });
      push('Category updated.');
    } else {
      add({ name, businessType });
      push('Category created.');
    }
    setFormOpen(false);
  };

  const productCount = (id: string) => products.filter((p) => p.categoryId === id).length;

  const typeTone: Record<Category['businessType'], 'amber' | 'info' | 'neutral'> = {
    general: 'info',
    footwear: 'amber',
    other: 'neutral',
  };

  const columns: Column<Category>[] = [
    { header: 'Category', key: 'name', render: (c) => <span className="text-sm font-medium text-ink">{c.name}</span> },
    { header: 'Business type', key: 'businessType', render: (c) => <Badge tone={typeTone[c.businessType]}>{c.businessType}</Badge> },
    { header: 'Products', key: 'count', align: 'center', render: (c) => <span className="text-xs text-slate tabular">{productCount(c.id)}</span> },
    {
      header: '', key: 'actions', align: 'right',
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
        title="Categories"
        description="Organize your catalog across general merchandise, footwear, and more."
        action={<Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> Add category</Button>}
      />

      <Card>
        {categories.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Tags className="h-6 w-6 text-slate mb-2" />
            <p className="text-sm text-slate">No categories yet.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={categories} rowKey={(c) => c.id} pageSize={10} />
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit category' : 'Add category'}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit}>{editing ? 'Save changes' : 'Create category'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FieldGroup>
            <Label required>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Men's Sneakers" />
          </FieldGroup>
          <FieldGroup>
            <Label required>Business type</Label>
            <Select value={businessType} onChange={(e) => setBusinessType(e.target.value as Category['businessType'])}>
              <option value="general">General store</option>
              <option value="footwear">Footwear</option>
              <option value="other">Other</option>
            </Select>
          </FieldGroup>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete category"
        description={`Delete "${deleting?.name}"? Products in this category will keep their reference but should be reassigned.`}
        onConfirm={() => { if (deleting) { remove(deleting.id); push('Category deleted.', 'info'); } }}
      />
    </div>
  );
}
