import { useRef, useState, type ReactNode } from 'react';

const ACTION_WIDTH = 84;
const DRAG_THRESHOLD = 8;

interface SwipeRowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: () => void;
  actionLabel: string;
  children: ReactNode;
}

// iOS-style swipe-left to reveal a destructive action; tap the row to close it again.
export function SwipeRow({ open, onOpenChange, onAction, actionLabel, children }: SwipeRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const drag = useRef<{ pointerId: number; startX: number; base: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const restX = open ? -ACTION_WIDTH : 0;
  const x = dragX ?? restX;

  function onPointerDown(event: React.PointerEvent) {
    drag.current = { pointerId: event.pointerId, startX: event.clientX, base: restX, moved: false };
  }

  function onPointerMove(event: React.PointerEvent) {
    const d = drag.current;
    if (!d || event.pointerId !== d.pointerId) return;
    const dx = event.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      d.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragX(Math.min(0, Math.max(-ACTION_WIDTH, d.base + dx)));
  }

  function onPointerEnd() {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) {
      suppressClick.current = true;
      onOpenChange(x < -ACTION_WIDTH / 2);
      setDragX(null);
    }
  }

  function onClickCapture(event: React.MouseEvent) {
    if (suppressClick.current) {
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (open) {
      event.preventDefault();
      event.stopPropagation();
      onOpenChange(false);
    }
  }

  return (
    <div className="swipe-row row-in">
      <button
        type="button"
        className="swipe-row__action"
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        onClick={onAction}
      >
        {actionLabel}
      </button>
      <div
        className={`swipe-row__content ${dragX !== null ? 'swipe-row__content--dragging' : ''}`}
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
    </div>
  );
}
