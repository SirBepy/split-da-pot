# Split Da Pot

Host-side money tracker for home poker cash games. One phone (the host's), zero backend, works offline at the table.

## Who

The host of a recurring home poker night. Croatian friend group, euros, evenings. Players hand the host cash; the host is the bank.

## Core job

1. **Bank ledger during the night**: record each player's cash buy-ins (and mid-game cash-outs). The pot total is always visible.
2. **End-of-night reconciliation**: host counts each player's chips and types the money value per player. The app live-shows what's left unaccounted in the pot; over-allocation goes negative and shows alarm-red. Only at exactly zero does the "suggested split" unlock.
3. **Suggested split**: who pays whom, minimizing the number of transactions.
4. **Run It / Side Pots**: an in-hand calculator (all-ins, run-it-twice/thrice). Enter pot amounts and winners, get who takes what in chips. Purely informational, never touches the cash ledger.

## Decisions (from the owner interview, 2026-09-17)

- Single host device only; no accounts, no sync. localStorage persistence.
- Players (name + assigned icon) persist across sessions; names editable.
- End-of-night entry is a money value per player, not a chip-color calculator.
- Full session history, saved locally, browsable. History screen carries a note: data is saved only on this device; suggestion box for cloud accounts: https://forms.gle/gNwNCPYFC5ACwx9z9
- Currency symbol defaults to €, changeable in settings.
- Visual direction: V1 "Dark Poker Night" (owner-picked from a 3-way mockup board).
- Deploys as a PWA on GitHub Pages under /split-da-pot/.

## Assumptions (labeled, not interviewed)

- Copy tone uses playful "da" branding ("in da pot", "Count da chips") - inferred from the app name; owner saw it in the approved mockups without objection.
- Settlement marks are informational; the app does not track whether people actually paid.

## Mode

Operate (task completion at a loud poker table, often one-handed, dim light). Scanability and fat touch targets outrank expression; brand lives in the details.
