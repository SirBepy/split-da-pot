import { X } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface SheetProps {
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ title, onClose, children }: SheetProps) {
  const [closing, setClosing] = useState(false);
  const closedRef = useRef(false);

  function finishClose() {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
  }

  useEffect(() => {
    // Fallback in case animationend never fires (e.g. jsdom).
    if (!closing) return;
    const timer = setTimeout(finishClose, 260);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setClosing(true);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`sheet-backdrop ${closing ? 'sheet-backdrop--closing' : ''}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) setClosing(true);
      }}
    >
      <div
        className={`sheet ${closing ? 'sheet--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Details'}
        onAnimationEnd={(event) => {
          if (closing && event.target === event.currentTarget) finishClose();
        }}
      >
        <div className="sheet__header" style={{ justifyContent: title ? 'space-between' : 'flex-end' }}>
          {title && (
            <h2 className="display" style={{ fontSize: 20 }}>
              {title}
            </h2>
          )}
          <button type="button" className="icon-btn" aria-label="Close" onClick={() => setClosing(true)}>
            <X size={20} />
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}
