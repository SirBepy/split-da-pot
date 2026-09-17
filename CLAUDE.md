# Split Da Pot

Type: react (Vite + TypeScript PWA)

Host-side bank for home poker cash games. Single-device, offline-first, localStorage only - no backend. See PRODUCT.md for product truth, DESIGN.md for the committed visual world (Dark Poker Night tokens; follow it for any UI work).

## Commands

- `npm run dev` - dev server
- `npm test` - vitest (fast floor)
- `npm run typecheck` - tsc
- `npm run lint` - eslint
- `npm run build` - production build

## Facts

- Money is integer CENTS everywhere in src/domain; format/parse via src/domain/money.ts (comma decimals accepted).
- Deployed to GitHub Pages at https://sirbepy.github.io/split-da-pot/ - vite base is `/split-da-pot/`, manifest icon paths must stay relative.
- The Run It / Side Pots calculator (src/domain/runit.ts) never touches the ledger by design.
- Settlement (src/domain/settle.ts) requires nets summing to exactly 0; UI guards on remaining === 0.
