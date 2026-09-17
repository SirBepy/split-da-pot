import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface InlineEditProps {
  value: string;
  onCommit: (next: string) => void;
  ariaLabel: string;
  startInEdit?: boolean;
  displayClassName?: string;
  displayStyle?: CSSProperties;
  inputStyle?: CSSProperties;
}

// Tap-to-edit text, the app's one editing idiom (same as tap-the-amount in the log).
// An empty or unchanged draft reverts silently instead of committing.
export function InlineEdit({
  value,
  onCommit,
  ariaLabel,
  startInEdit = false,
  displayClassName,
  displayStyle,
  inputStyle,
}: InlineEditProps) {
  const [editing, setEditing] = useState(startInEdit);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onCommit(trimmed);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="text-input"
        style={{ minHeight: 40, padding: '0 10px', ...inputStyle }}
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit();
          if (event.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <button
      type="button"
      className={`inline-edit ${displayClassName ?? ''}`}
      style={displayStyle}
      aria-label={`Edit ${ariaLabel}`}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
    >
      {value}
    </button>
  );
}
