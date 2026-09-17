# DESIGN.md - Dark Poker Night

Committed visual world (owner-approved mockup V1, 2026-09-17, `.for_bepy/mockups/mockup-vibes.html` section #v1, plus two owner corrections).

## World

Casino at midnight: near-black room, felt-green table surfaces, gold light on the money. Elegant, not gimmicky. The money numbers are the heroes of every screen.

## Tokens (CSS custom properties in src/index.css)

- `--bg: #0e1210` near-black with a green undertone; page background.
- `--felt: #16241c` felt-green surface; cards, list rows.
- `--felt-raised: #1d3025` elevated felt; inputs, pressed states, the "left in pot" panel. Owner correction: inputs and the left-in-pot panel must sit on THIS raised green, never on near-black (#0e1210-on-#16241c inputs read "too black").
- `--line: #2a4234` hairline borders on felt.
- `--gold: #d9a441` accent: pot totals, primary CTA, focus rings.
- `--gold-bright: #f0c775` hover/active gold.
- `--ink: #e8e6df` primary text, warm off-white.
- `--ink-dim: #8fa398` secondary text, muted green-grey.
- `--danger: #e2574b` negative pot, destructive actions.
- `--ok: #4cc38a` zero-reached state, success.

## Type

- Numbers/display: "Playfair Display" (Google Fonts), 600-700, used for money amounts and screen titles.
- UI text: "Inter", 400-600.
- Money amounts are always the largest thing in their container.

## Shape and depth

- Radius: 16px cards, 12px inputs/buttons, 999px chips/avatars.
- Depth comes from layered greens (bg -> felt -> felt-raised), not shadows; at most a soft `0 1px 0 rgba(0,0,0,.4)` under cards.
- Hairline `--line` borders separate surfaces; no heavy outlines.

## Motion

- 150-200ms ease-out on state changes; the left-in-pot number animates count-up/down on recount.
- Red state pulses once on entering negative, then holds steady (no perpetual animation).

## Voice

Playful "da" branding: "in da pot", "Count da chips", "View da split". English UI. Never em dashes in copy.

## Fixed constraints

- Mobile-first 390px; must stay usable at 320px and fine on desktop.
- Touch targets >= 44px. One-handed reach: primary actions bottom-anchored.
- Dark only (the app is used at night); `color-scheme: dark`.
