import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from './ui/dialog';
import { cn } from '../lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '確認',
  cancelText = 'キャンセル',
  variant = 'default',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay style={{ zIndex: 120 }} />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl",
            "w-[calc(100vw-2rem)] max-w-sm sm:w-full shadow-sm border border-primary/30 bg-white"
          )}
          style={{ zIndex: 120 }}
        >
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <div className="text-center space-y-3">
            <h2 className="text-[15.75px] font-bold">{title}</h2>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleConfirm}
              className={cn(
                "flex-1 text-white text-sm rounded-full px-6 py-2.5 transition-colors",
                variant === 'danger'
                  ? "bg-danger hover:bg-danger/90"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm rounded-full px-5 py-2.5 border border-input bg-white hover:bg-gray-100 transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
