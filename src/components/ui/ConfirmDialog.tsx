import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
  danger = true,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="h-9 w-9 rounded-full bg-danger/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-4.5 w-4.5 text-danger" />
        </div>
        <p className="text-sm text-slate leading-relaxed">{description}</p>
      </div>
    </Modal>
  );
}
