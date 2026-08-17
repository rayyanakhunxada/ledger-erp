import { useState } from 'react';
import { Download, Upload, RotateCcw, LogOut } from 'lucide-react';
import { PageHeader } from '@/components/ui/Misc';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldGroup, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { exportAllData, importAllData, clearAllData } from '@/lib/storage';
import { downloadJSON } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { settings, update } = useSettingsStore();
  const { logout } = useAuthStore();
  const push = useToastStore((s) => s.push);
  const navigate = useNavigate();

  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleExport = () => {
    const data = exportAllData();
    downloadJSON('ledger-erp-backup.json', data);
    push('Data exported successfully.', 'success');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target?.result as string);
          importAllData(data);
        } catch (err) {
          push('Invalid JSON file.', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    push('Logged out.', 'info');
  };

  return (
    <div>
      <PageHeader
        title="Settings & Configuration"
        description="Manage store details, currency, tax rates, and data backups."
      />

      <div className="space-y-4">
        <Card>
          <CardHeader title="Store Information" />
          <CardBody className="space-y-4">
            <FieldGroup>
              <Label required>Store name</Label>
              <Input
                value={settings.storeName}
                onChange={(e) => update({ storeName: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup>
              <Label>Business type</Label>
              <Select
                value={settings.businessType}
                onChange={(e) => update({ businessType: e.target.value as 'General Store' | 'Footwear' | 'Mixed Retail' })}
              >
                <option value="General Store">General Store</option>
                <option value="Footwear">Footwear</option>
                <option value="Mixed Retail">Mixed Retail</option>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label>Currency symbol</Label>
              <Input
                value={settings.currencySymbol}
                onChange={(e) => update({ currencySymbol: e.target.value })}
                maxLength={3}
                placeholder="$"
              />
            </FieldGroup>
            <FieldGroup>
              <Label>Address</Label>
              <Input
                value={settings.address || ''}
                onChange={(e) => update({ address: e.target.value })}
                placeholder="221 Market Street, Islamabad"
              />
            </FieldGroup>
            <FieldGroup>
              <Label>Phone</Label>
              <Input
                value={settings.phone || ''}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="+92 300 1234567"
              />
            </FieldGroup>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Financial Settings" />
          <CardBody className="space-y-4">
            <FieldGroup>
              <Label>Tax rate (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={settings.taxRate}
                onChange={(e) => update({ taxRate: Number(e.target.value) })}
              />
            </FieldGroup>
            <FieldGroup>
              <Label>Low stock alert threshold</Label>
              <Input
                type="number"
                min={0}
                value={settings.lowStockThreshold}
                onChange={(e) => update({ lowStockThreshold: Number(e.target.value) })}
              />
            </FieldGroup>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Data Management" subtitle="Backup and restore your entire store database" />
          <CardBody className="space-y-3">
            <Button variant="outline" className="w-full" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" /> Export all data to JSON
            </Button>
            <Button variant="outline" className="w-full" onClick={handleImport}>
              <Upload className="h-3.5 w-3.5" /> Import from backup
            </Button>
            <Button variant="outline" className="w-full text-danger" onClick={() => setResetDialogOpen(true)}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset demo data
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Account" />
          <CardBody>
            <Button variant="danger" className="w-full" onClick={() => setClearDialogOpen(true)}>
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        title="Sign out"
        description="You'll be returned to the login screen."
        confirmLabel="Sign out"
        onConfirm={handleLogout}
      />

      <ConfirmDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        title="Reset demo data"
        description="This will clear all your data and reload the app with fresh seed data. This action cannot be undone."
        confirmLabel="Reset"
        onConfirm={() => clearAllData()}
        danger
      />
    </div>
  );
}
