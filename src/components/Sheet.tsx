import { X } from '@phosphor-icons/react';
import { useEffect, type ReactNode } from 'react';

interface SheetProps {
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ title, onClose, children }: SheetProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
