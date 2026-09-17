import { useApp } from '../state/useApp';
import { RosterList } from './RosterList';
import { Sheet } from './Sheet';

interface AddPlayerSheetProps {
  sessionId: string;
  alreadyInSession: string[];
  onClose: () => void;
}

export function AddPlayerSheet({ sessionId, alreadyInSession, onClose }: AddPlayerSheetProps) {
  const { dispatch } = useApp();

  return (
    <Sheet title="Add player" onClose={onClose}>
      <RosterList
        mode="add"
        excludeIds={new Set(alreadyInSession)}
        onAdd={(playerId) => {
          dispatch({ type: 'ADD_LATECOMER', sessionId, playerId });
          onClose();
        }}
      />
    </Sheet>
  );
}
