import { X } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

interface SheetProps {
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ title, onClose, children }: SheetProps) {
  return (
    <div
      className="sheet-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title ?? 'Details'}>
        <div className="sheet__header" style={{ justifyContent: title ? 'space-between' : 'flex-end' }}>
          {title && (
            <h2 className="display" style={{ fontSize: 20 }}>
              {title}
            </h2>
          )}
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}
