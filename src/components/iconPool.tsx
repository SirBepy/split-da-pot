import {
  Alien,
  Anchor,
  Cat,
  Club,
  Crown,
  Diamond,
  DiceFive,
  Dog,
  Ghost,
  Heart,
  Robot,
  Rocket,
  Skull,
  Spade,
  Sword,
  Target,
  type Icon,
} from '@phosphor-icons/react';

export const ICON_POOL: { name: string; Icon: Icon }[] = [
  { name: 'crown', Icon: Crown },
  { name: 'skull', Icon: Skull },
  { name: 'diamond', Icon: Diamond },
  { name: 'club', Icon: Club },
  { name: 'heart', Icon: Heart },
  { name: 'spade', Icon: Spade },
  { name: 'robot', Icon: Robot },
  { name: 'alien', Icon: Alien },
  { name: 'ghost', Icon: Ghost },
  { name: 'cat', Icon: Cat },
  { name: 'dog', Icon: Dog },
  { name: 'rocket', Icon: Rocket },
  { name: 'anchor', Icon: Anchor },
  { name: 'sword', Icon: Sword },
  { name: 'target', Icon: Target },
  { name: 'dice', Icon: DiceFive },
];

export function getIcon(name: string): Icon {
  return ICON_POOL.find((entry) => entry.name === name)?.Icon ?? Crown;
}

/** First pool icon not already assigned to a roster player; cycles once the roster outgrows the pool. */
export function nextIconName(usedNames: string[]): string {
  const unused = ICON_POOL.find((entry) => !usedNames.includes(entry.name));
  if (unused) return unused.name;
  return ICON_POOL[usedNames.length % ICON_POOL.length].name;
}
