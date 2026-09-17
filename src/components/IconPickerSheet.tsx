import { Sheet } from './Sheet';
import { ICON_POOL } from './iconPool';

interface IconPickerSheetProps {
  current: string;
  onPick: (icon: string) => void;
  onClose: () => void;
}

export function IconPickerSheet({ current, onPick, onClose }: IconPickerSheetProps) {
  return (
    <Sheet title="Pick an icon" onClose={onClose}>
      <div className="icon-grid">
        {ICON_POOL.map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            className={`icon-cell ${name === current ? 'icon-cell--current' : ''}`}
            aria-label={name}
            aria-pressed={name === current}
            onClick={() => {
              onPick(name);
              onClose();
            }}
          >
            <Icon size={26} weight="fill" />
          </button>
        ))}
      </div>
    </Sheet>
  );
}
