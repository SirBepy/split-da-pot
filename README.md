# Split Da Pot

Host-side bank for home poker cash games. One phone, no backend, works offline at the table.

**Live:** https://sirbepy.github.io/split-da-pot/

## What it does

- **Bank ledger**: record each player's cash buy-ins and mid-game cash-outs; the pot total is always on screen.
- **Count da chips**: at the end of the night, type each player's counted chip value. The app live-shows what's left in the pot, goes alarm-red if you allocate more than the pot holds, and unlocks the split only at exactly zero.
- **Suggested split**: who pays whom, with the fewest transactions.
- **Run It / Side Pots**: an in-hand calculator for all-ins and run-it-twice - enter pot amounts and winners, see who takes what in chips. Never touches the bank.
- **History**: every settled night saved locally, with per-player results and the settlement.

Player names and icons persist across nights. Currency symbol is configurable (default €). All data lives in your browser's localStorage - nothing leaves the device.

## Stack

React 19 + Vite + TypeScript, PWA (installable, offline via service worker). No backend, no accounts.

## Development

```
npm install
npm run dev        # dev server
npm test           # vitest
npm run typecheck  # tsc
npm run lint       # eslint
npm run build      # production build (dist/)
```

Deployed to GitHub Pages from `main` via GitHub Actions.
